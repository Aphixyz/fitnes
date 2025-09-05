"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Profile ของ Member ครบถ้วน
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูล Profile ของสมาชิก
 */
export async function getMemberProfile(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูล Profile ครบถ้วนจาก member table พร้อมกับข้อมูลส่วนสูงล่าสุด
    const [rows] = await pool.query(
      `SELECT 
        m.member_id,
        m.member_username,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_phone,
        m.member_gender,
        m.member_dob,
        m.member_profileimage,
        mh.member_health_height as latest_height
      FROM member m
      LEFT JOIN (
        SELECT member_id, member_health_height, member_health_measurementdate
        FROM member_health 
        WHERE member_id = ? AND member_health_height IS NOT NULL
        ORDER BY member_health_measurementdate DESC, member_health_id DESC
        LIMIT 1
      ) mh ON m.member_id = mh.member_id
      WHERE m.member_id = ?`,
      [memberId, memberId]
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (rows.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลสมาชิก",
        data: null,
      };
    }

    const memberData = rows[0];

    // คำนวณอายุจากวันเกิด
    let age = null;
    if (memberData.member_dob) {
      const today = new Date();
      const birthDate = new Date(memberData.member_dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
    }

    // แปลงข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
    const profile = {
      id: memberData.member_id,
      username: memberData.member_username,
      firstName: memberData.member_firstname,
      lastName: memberData.member_lastname,
      fullName: `${memberData.member_firstname} ${memberData.member_lastname}`,
      email: memberData.member_email,
      phone: memberData.member_phone,
      gender: memberData.member_gender,
      dateOfBirth: memberData.member_dob,
      age: age,
      profileImage: memberData.member_profileimage,
      // ข้อมูลส่วนสูงล่าสุดจาก member_health table
      latestHeight: memberData.latest_height,
      height: memberData.latest_height, // Keep compatibility
      // สร้าง URL สำหรับ profile image
      profileImageUrl: memberData.member_profileimage
        ? `/uploads/${memberData.member_profileimage}`
        : "/default-avatar.png",
    };

    return {
      success: true,
      message: "ดึงข้อมูล Profile สำเร็จ",
      data: profile,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Profile:", error);
    return {
      success: false,
      message: "ไม่สามารถดึงข้อมูล Profile ได้",
      error: error.message,
      data: null,
    };
  }
}

/**
 * อัปเดตข้อมูล Profile ของ Member
 * @param {number} memberId - รหัสสมาชิก
 * @param {FormData|Object} updateData - ข้อมูลที่ต้องการอัปเดต (FormData สำหรับไฟล์ หรือ Object สำหรับข้อมูลปกติ)
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดต
 */
export async function updateMemberProfile(memberId, updateData) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    if (!updateData) {
      throw new Error("ไม่มีข้อมูลที่ต้องการอัปเดต");
    }

    // สร้าง dynamic query สำหรับการอัปเดต
    const allowedFields = [
      "member_firstname",
      "member_lastname",
      "member_email",
      "member_phone",
      "member_gender",
      "member_dob",
      "member_profileimage",
    ];

    const updateFields = [];
    const updateValues = [];
    let profileImageFileName = null;

    // จัดการข้อมูลจาก FormData หรือ Object
    let dataEntries;
    if (updateData instanceof FormData) {
      dataEntries = Array.from(updateData.entries());
    } else {
      dataEntries = Object.entries(updateData);
    }

    // ตรวจสอบและเพิ่มเฉพาะ field ที่ได้รับอนุญาต
    for (const [key, value] of dataEntries) {
      if (
        allowedFields.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        // จัดการไฟล์รูปภาพ
        if (key === "member_profileimage" && value instanceof File) {
          // สร้างชื่อไฟล์ใหม่
          const fileExtension = value.name.split(".").pop();
          const timestamp = Date.now();
          profileImageFileName = `profile_${memberId}_${timestamp}.${fileExtension}`;

          // บันทึกไฟล์ไปยัง public/uploads
          const fs = require("fs");
          const path = require("path");
          const uploadDir = path.join(process.cwd(), "public", "uploads");

          // สร้างโฟลเดอร์ถ้ายังไม่มี
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, profileImageFileName);
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          fs.writeFileSync(filePath, buffer);

          updateFields.push(`${key} = ?`);
          updateValues.push(profileImageFileName);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      throw new Error("ไม่มีข้อมูลที่ถูกต้องสำหรับการอัปเดต");
    }

    // เพิ่ม memberId ไว้ท้ายสุดสำหรับ WHERE clause
    updateValues.push(memberId);

    const query = `
      UPDATE member 
      SET ${updateFields.join(", ")}
      WHERE member_id = ?
    `;

    const [result] = await pool.query(query, updateValues);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลสมาชิกที่ต้องการอัปเดต",
      };
    }

    return {
      success: true,
      message: "อัปเดตข้อมูล Profile สำเร็จ",
      affectedRows: result.affectedRows,
      profileImageFileName: profileImageFileName,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล Profile:", error);
    return {
      success: false,
      message: "ไม่สามารถอัปเดตข้อมูล Profile ได้",
      error: error.message,
    };
  }
}

/**
 * อัปเดตข้อมูลสุขภาพของ Member (เฉพาะส่วนสูง)
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} height - ส่วนสูง (ซม.)
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึก
 */
export async function updateMemberHealth(memberId, height) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    if (!height || height <= 0) {
      throw new Error("กรุณาระบุส่วนสูงที่ถูกต้อง");
    }

    // บันทึกข้อมูลส่วนสูงใหม่ลง member_health table
    const [result] = await pool.query(
      `INSERT INTO member_health (
        member_id, 
        member_health_height, 
        member_health_measurementdate
      ) VALUES (?, ?, CURDATE())`,
      [memberId, parseFloat(height)]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "ไม่สามารถบันทึกข้อมูลส่วนสูงได้",
      };
    }

    return {
      success: true,
      message: "บันทึกข้อมูลส่วนสูงสำเร็จ",
      healthId: result.insertId,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลสุขภาพ:", error);
    return {
      success: false,
      message: "ไม่สามารถบันทึกข้อมูลสุขภาพได้",
      error: error.message,
    };
  }
}

/**
 * ดึงข้อมูลน้ำหนักล่าสุดของ Member
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลน้ำหนักล่าสุด
 */
export async function getCurrentWeight(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลน้ำหนักล่าสุดจาก member_health table
    const [rows] = await pool.query(
      `SELECT member_health_weight
       FROM member_health 
       WHERE member_id = ? AND member_health_weight IS NOT NULL
       ORDER BY member_health_measurementdate DESC, member_health_id DESC
       LIMIT 1`,
      [memberId]
    );

    const currentWeight = rows.length > 0 ? rows[0].member_health_weight : null;

    return {
      success: true,
      message: "ดึงข้อมูลน้ำหนักสำเร็จ",
      data: currentWeight,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลน้ำหนัก:", error);
    return {
      success: false,
      message: "ไม่สามารถดึงข้อมูลน้ำหนักได้",
      error: error.message,
      data: null,
    };
  }
}

/**
 * ตรวจสอบว่าอีเมลซ้ำหรือไม่ (สำหรับการอัปเดต)
 * @param {string} email - อีเมลที่ต้องการตรวจสอบ
 * @param {number} excludeMemberId - รหัสสมาชิกที่ต้องการยกเว้น (สำหรับการอัปเดต)
 * @returns {Promise<Object>} - ผลลัพธ์การตรวจสอบ
 */
export async function checkEmailAvailability(email, excludeMemberId = null) {
  try {
    if (!email) {
      throw new Error("กรุณาระบุอีเมล");
    }

    let query = "SELECT member_id FROM member WHERE member_email = ?";
    let params = [email];

    // ถ้ามี excludeMemberId ให้เพิ่มเงื่อนไขยกเว้น
    if (excludeMemberId) {
      query += " AND member_id != ?";
      params.push(excludeMemberId);
    }

    const [rows] = await pool.query(query, params);

    return {
      success: true,
      isAvailable: rows.length === 0,
      message:
        rows.length === 0 ? "อีเมลสามารถใช้งานได้" : "อีเมลนี้ถูกใช้งานแล้ว",
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบอีเมล:", error);
    return {
      success: false,
      message: "ไม่สามารถตรวจสอบอีเมลได้",
      error: error.message,
    };
  }
}

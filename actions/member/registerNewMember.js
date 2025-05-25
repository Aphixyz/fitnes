"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * ลงทะเบียนสมาชิกใหม่และสร้างความสัมพันธ์กับ trainer
 * สร้าง member record ทันทีพร้อมสถานะ active
 *
 * @param {Object} data - ข้อมูลสมาชิกใหม่
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ผลลัพธ์การลงทะเบียน
 */
export async function registerNewMember(data, trainerId) {
  try {
    if (!data || !trainerId || !data.packages_id) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const requiredFields = [
      "member_username",
      "member_password",
      "member_firstname",
      "member_lastname",
      "member_email",
      "packages_id",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`กรุณากรอก ${field}`);
      }
    }

    // ตรวจสอบ trainer
    const [trainerCheck] = await db.query(
      "SELECT trainer_id FROM trainer WHERE trainer_id = ? AND trainer_status = 'active'",
      [trainerId]
    );

    if (!trainerCheck || trainerCheck.length === 0) {
      throw new Error(
        "ไม่พบข้อมูลเทรนเนอร์หรือเทรนเนอร์ไม่อยู่ในสถานะพร้อมให้บริการ"
      );
    }

    // ตรวจสอบ package และดึงข้อมูล duration
    const [packageCheck] = await db.query(
      "SELECT packages_duration_months FROM packages WHERE packages_id = ? AND trainer_id = ?",
      [data.packages_id, trainerId]
    );

    if (!packageCheck || packageCheck.length === 0) {
      throw new Error("แพ็คเกจไม่ถูกต้องหรือไม่พร้อมใช้งาน");
    }

    const packageDuration = packageCheck[0].packages_duration_months; // หน่วยเป็นเดือน

    // คำนวณวันเริ่มต้นและวันสิ้นสุด
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + packageDuration); // เพิ่มเดือนตาม package duration

    // ตรวจสอบว่า email หรือ username ซ้ำหรือไม่
    const [existingMember] = await db.query(
      "SELECT member_id FROM member WHERE member_email = ? OR member_username = ?",
      [data.member_email, data.member_username]
    );

    if (existingMember && existingMember.length > 0) {
      throw new Error("อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(data.member_password, 10);

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // สร้าง member record ด้วยสถานะ active
      const [memberResult] = await db.query(
        `INSERT INTO member 
         (member_username, member_password, member_firstname, member_lastname, 
          member_email, member_phone, member_gender, member_dob, member_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          data.member_username,
          hashedPassword,
          data.member_firstname,
          data.member_lastname,
          data.member_email,
          data.member_phone || null,
          data.member_gender || null,
          data.member_dob || null,
        ]
      );

      const memberId = memberResult.insertId;

      // สร้าง registration record พร้อมวันเริ่มต้นและสิ้นสุด
      const [registrationResult] = await db.query(
        `INSERT INTO registration 
         (member_id, trainer_id, packages_id, registration_startdate, 
          registration_enddate, registration_status) 
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [
          memberId,
          trainerId,
          data.packages_id,
          startDate.toISOString().split("T")[0], // แปลงเป็น YYYY-MM-DD
          endDate.toISOString().split("T")[0],
        ]
      );

      // // สร้าง member_health record เบื้องต้น (ค่าว่าง)
      // await db.query(
      //   `INSERT INTO member_health (member_id, measurement_date)
      //    VALUES (?, CURDATE())`,
      //   [memberId]
      // );

      await db.query("COMMIT");

      return {
        success: true,
        member_id: memberId,
        registration_id: registrationResult.insertId,
        message: "ลงทะเบียนสำเร็จ คุณสามารถเข้าสู่ระบบได้ทันที",
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error registering new member:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลงทะเบียน",
    };
  }
}
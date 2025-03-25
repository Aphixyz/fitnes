"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลสุขภาพล่าสุดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object|null>} ข้อมูลสุขภาพล่าสุดหรือ null
 */
export async function getMemberHealth(memberId) {
  try {
    // ตรวจสอบความถูกต้องของ input
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลสุขภาพล่าสุด
    const [rows] = await pool.query(
      `SELECT * FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching health data:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสุขภาพได้: " + error.message);
  }
}

/**
 * ดึงประวัติข้อมูลสุขภาพของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} limit - จำนวนรายการที่ต้องการดึง (ค่าเริ่มต้น 10)
 * @returns {Promise<Array>} รายการข้อมูลสุขภาพย้อนหลัง
 */
export async function getMemberHealthHistory(memberId, limit = 10) {
  try {
    // ตรวจสอบความถูกต้องของ input
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงประวัติข้อมูลสุขภาพ
    const [rows] = await pool.query(
      `SELECT * FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT ?`,
      [memberId, limit]
    );

    return rows;
  } catch (error) {
    console.error("Error fetching health history:", error);
    throw new Error("ไม่สามารถดึงประวัติข้อมูลสุขภาพได้: " + error.message);
  }
}

/**
 * บันทึกข้อมูลสุขภาพใหม่ของสมาชิก
 * @param {Object} healthData - ข้อมูลสุขภาพที่ต้องการบันทึก
 * @returns {Promise<Object>} ผลลัพธ์การบันทึก
 */
export async function addMemberHealth(healthData) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!healthData.member_id) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // กำหนด member_health_measurementdate ถ้าไม่มี
    if (!healthData.member_health_measurementdate) {
      healthData.member_health_measurementdate = new Date();
    }
    // กำหนด member_health_recorddate
    healthData.member_health_recorddate = new Date();

    // กรองฟิลด์ member_health_id ออกไป (ถ้ามี)
    const dataToSave = {};
    Object.entries(healthData).forEach(([key, value]) => {
      if (key !== "member_health_id") {
        dataToSave[key] = value;
      }
    });

    // สร้าง SQL parameters
    const fields = Object.keys(dataToSave);
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((field) => dataToSave[field]);

    // บันทึกข้อมูล
    const [result] = await pool.query(
      `INSERT INTO member_health (${fields.join(", ")}) 
       VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      member_health_id: result.insertId,
      message: "บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error adding health data:", error);
    throw new Error("ไม่สามารถบันทึกข้อมูลสุขภาพได้: " + error.message);
  }
}

/**
 * อัพเดตข้อมูลสุขภาพของสมาชิก
 * @param {number} healthId - รหัสข้อมูลสุขภาพ
 * @param {Object} healthData - ข้อมูลสุขภาพที่ต้องการอัพเดต
 * @returns {Promise<Object>} ผลลัพธ์การอัพเดต
 */
export async function updateMemberHealth(healthId, healthData) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!healthId) {
      throw new Error("กรุณาระบุรหัสข้อมูลสุขภาพ");
    }

    // สร้างข้อมูลที่จะอัพเดต - กรองเฉพาะฟิลด์ที่ไม่ใช่ member_health_id
    const dataToUpdate = {};
    Object.entries(healthData).forEach(([key, value]) => {
      if (value !== undefined && key !== "member_health_id") {
        dataToUpdate[key] = value;
      }
    });

    // ถ้าไม่มีข้อมูลที่จะอัพเดต
    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error("ไม่มีข้อมูลที่ต้องการอัพเดต");
    }

    // สร้าง SQL parameters
    const updates = Object.keys(dataToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(dataToUpdate);
    values.push(healthId); // สำหรับ WHERE clause

    // อัพเดตข้อมูล
    const [result] = await pool.query(
      `UPDATE member_health 
       SET ${updates} 
       WHERE member_health_id = ?`,
      values
    );

    // ตรวจสอบผลลัพธ์
    if (result.affectedRows === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพที่ต้องการอัพเดต");
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: "อัพเดตข้อมูลสุขภาพเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error updating health data:", error);
    throw new Error("ไม่สามารถอัพเดตข้อมูลสุขภาพได้: " + error.message);
  }
}

/**
 * ลบข้อมูลสุขภาพของสมาชิก
 * @param {number} healthId - รหัสข้อมูลสุขภาพ
 * @param {number} memberId - รหัสสมาชิก (สำหรับความปลอดภัย)
 * @returns {Promise<Object>} ผลลัพธ์การลบ
 */
export async function deleteMemberHealth(healthId, memberId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!healthId || !memberId) {
      throw new Error("กรุณาระบุรหัสข้อมูลสุขภาพและรหัสสมาชิก");
    }

    // ลบข้อมูล
    const [result] = await pool.query(
      `DELETE FROM member_health 
       WHERE member_health_id = ? AND member_id = ?`,
      [healthId, memberId]
    );

    // ตรวจสอบผลลัพธ์
    if (result.affectedRows === 0) {
      throw new Error(
        "ไม่พบข้อมูลสุขภาพที่ต้องการลบ หรือคุณไม่มีสิทธิ์ลบข้อมูลนี้"
      );
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: "ลบข้อมูลสุขภาพเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error deleting health data:", error);
    throw new Error(error.message || "ไม่สามารถลบข้อมูลสุขภาพได้");
  }
}

/**
 * ดึงข้อมูลสุขภาพตาม ID
 * @param {number} healthId - รหัสข้อมูลสุขภาพ
 * @returns {Promise<Object|null>} ข้อมูลสุขภาพหรือ null
 */
export async function getHealthById(healthId) {
  try {
    if (!healthId) {
      throw new Error("กรุณาระบุรหัสข้อมูลสุขภาพ");
    }

    const [rows] = await pool.query(
      `SELECT * FROM member_health 
       WHERE member_health_id = ?`,
      [healthId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching health data by ID:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสุขภาพได้: " + error.message);
  }
}

/**
 * ดึงข้อมูลสุขภาพสองรายการเพื่อนำไปเปรียบเทียบ
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} currentHealthId - รหัสข้อมูลสุขภาพปัจจุบัน
 * @param {number} previousHealthId - รหัสข้อมูลสุขภาพก่อนหน้า (ถ้าไม่ระบุจะดึงรายการก่อนหน้า currentHealthId)
 * @returns {Promise<Object>} ข้อมูลสุขภาพทั้งสองรายการ
 */
export async function getHealthDataForComparison(
  memberId,
  currentHealthId,
  previousHealthId = null
) {
  try {
    if (!memberId || !currentHealthId) {
      throw new Error("กรุณาระบุรหัสสมาชิกและรหัสข้อมูลสุขภาพปัจจุบัน");
    }

    // ดึงข้อมูลสุขภาพปัจจุบัน
    const [currentRows] = await pool.query(
      `SELECT * FROM member_health WHERE member_health_id = ? AND member_id = ?`,
      [currentHealthId, memberId]
    );

    if (currentRows.length === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพปัจจุบัน");
    }

    const currentHealth = currentRows[0];

    // ดึงข้อมูลสุขภาพก่อนหน้า
    let previousHealth = null;
    if (previousHealthId) {
      const [prevRows] = await pool.query(
        `SELECT * FROM member_health WHERE member_health_id = ? AND member_id = ?`,
        [previousHealthId, memberId]
      );
      previousHealth = prevRows[0] || null;
    } else {
      const [prevRows] = await pool.query(
        `SELECT * FROM member_health 
         WHERE member_id = ? AND member_health_measurementdate < ? 
         ORDER BY member_health_measurementdate DESC LIMIT 1`,
        [memberId, currentHealth.member_health_measurementdate]
      );
      previousHealth = prevRows[0] || null;
    }

    return {
      success: true,
      current: currentHealth,
      previous: previousHealth,
      message: previousHealth
        ? "พบข้อมูลทั้งสองรายการ"
        : "ไม่พบข้อมูลก่อนหน้าสำหรับเปรียบเทียบ",
    };
  } catch (error) {
    console.error("Error fetching health data for comparison:", error);
    throw new Error(
      "ไม่สามารถดึงข้อมูลสุขภาพเพื่อเปรียบเทียบได้: " + error.message
    );
  }
}

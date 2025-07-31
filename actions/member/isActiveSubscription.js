"use server";

import pool from "@/lib/db.js";

/**
 * ตรวจสอบว่าสมาชิกมีสิทธิใช้งานในช่วง subscription ปัจจุบัน
 * @param {number} memberId - รหัสสมาชิกที่จะตรวจสอบ
 * @param {string} currentDate - วันที่ปัจจุบัน (YYYY-MM-DD format)
 * @returns {Promise<{success: boolean, isActive: boolean, message: string, data?: any}>}
 */
export async function isActiveSubscription(memberId, currentDate = null) {
  try {
    // ตรวจสอบ input validation
    if (!memberId || isNaN(memberId)) {
      return {
        success: false,
        isActive: false,
        message: "member_id ไม่ถูกต้อง",
      };
    }

    // ถ้าไม่ระบุ currentDate ให้ใช้วันปัจจุบัน
    const today = currentDate || new Date().toISOString().split("T")[0];

    // SQL query ตรวจสอบ registration ที่ active อยู่ในช่วงเวลาปัจจุบัน
    const sql = `
      SELECT 
        registration_id,
        member_id,
        trainer_id,
        packages_id,
        registration_startdate,
        registration_enddate
      FROM registration 
      WHERE member_id = ? 
        AND registration_startdate <= ? 
        AND registration_enddate >= ?
      ORDER BY registration_enddate DESC
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [memberId, today, today]);

    // ตรวจสอบผลลัพธ์
    if (rows && rows.length > 0) {
      return {
        success: true,
        isActive: true,
        message: "สมาชิกมีสิทธิใช้งานในช่วง subscription ปัจจุบัน",
        data: {
          registration: rows[0],
          currentDate: today,
        },
      };
    } else {
      return {
        success: true,
        isActive: false,
        message: "สมาชิกไม่มีสิทธิใช้งานในช่วง subscription ปัจจุบัน",
        data: {
          currentDate: today,
        },
      };
    }
  } catch (error) {
    console.error("Error in isActiveSubscription:", error);
    return {
      success: false,
      isActive: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การใช้งาน",
      error: error.message,
    };
  }
}


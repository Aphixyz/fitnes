"use server";

import pool from "@/lib/db";

/**
 * ดึงน้ำหนักล่าสุดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object|null>} ข้อมูลน้ำหนักล่าสุดหรือ null
 */
export async function getLatestWeight(memberId) {
    try {
      if (!memberId) {
        throw new Error("กรุณาระบุรหัสสมาชิก");
      }
  
      const [rows] = await pool.query(
        `SELECT 
          member_health_id,
          member_health_weight,
          member_health_measurementdate
         FROM member_health 
         WHERE member_id = ? AND member_health_weight IS NOT NULL
         ORDER BY member_health_measurementdate DESC 
         LIMIT 1`,
        [memberId]
      );
  
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching latest weight:", error);
      throw new Error(`ไม่สามารถดึงน้ำหนักล่าสุดได้: ${error.message}`);
    }
  }
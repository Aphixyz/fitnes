"use server";

import pool from "../../../lib/db.js";

/**
 * ดึงข้อมูลสุขภาพล่าสุดของแต่ละ metric แยกกัน
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูลสุขภาพล่าสุดของแต่ละ field
 */
export async function fetchLatestHealthMetrics(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const connection = await pool.getConnection();

    // Query แยกสำหรับแต่ละ metric เพื่อหาข้อมูลล่าสุดของแต่ละ field
    const queries = [
      // Weight
      `SELECT member_health_weight as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_weight IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Body Fat
      `SELECT member_health_bodyfat as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_bodyfat IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Chest
      `SELECT member_health_chest as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_chest IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Waist
      `SELECT member_health_waist as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_waist IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Hip
      `SELECT member_health_hip as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_hip IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Arm
      `SELECT member_health_arm as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_arm IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`,
      
      // Thigh
      `SELECT member_health_thigh as value, member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? AND member_health_thigh IS NOT NULL
       ORDER BY member_health_measurementdate DESC LIMIT 1`
    ];

    // Execute all queries
    const [weightResult, bodyfatResult, chestResult, waistResult, hipResult, armResult, thighResult] = 
      await Promise.all(queries.map(query => connection.execute(query, [memberId])));

    connection.release();

    // Process results
    const processResult = (result) => {
      return result[0].length > 0 ? result[0][0] : null;
    };

    const weight = processResult(weightResult);
    const bodyfat = processResult(bodyfatResult);
    const chest = processResult(chestResult);
    const waist = processResult(waistResult);
    const hip = processResult(hipResult);
    const arm = processResult(armResult);
    const thigh = processResult(thighResult);

    return {
      success: true,
      data: {
        member_health_weight: weight?.value || null,
        member_health_weight_date: weight?.date || null,
        
        member_health_bodyfat: bodyfat?.value || null,
        member_health_bodyfat_date: bodyfat?.date || null,
        
        member_health_chest: chest?.value || null,
        member_health_chest_date: chest?.date || null,
        
        member_health_waist: waist?.value || null,
        member_health_waist_date: waist?.date || null,
        
        member_health_hip: hip?.value || null,
        member_health_hip_date: hip?.date || null,
        
        member_health_arm: arm?.value || null,
        member_health_arm_date: arm?.date || null,
        
        member_health_thigh: thigh?.value || null,
        member_health_thigh_date: thigh?.date || null
      }
    };

  } catch (error) {
    console.error("Error fetching health metrics:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสุขภาพ"
    };
  }
}

/**
 * ดึงประวัติข้อมูลสุขภาพของสมาชิก (สำหรับ chart/graph)
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} limit - จำนวนรายการที่ต้องการ (default: 10)
 * @returns {Promise<Object>} ประวัติข้อมูลสุขภาพ
 */
export async function fetchHealthHistory(memberId, limit = 10) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const connection = await pool.getConnection();

    const query = `
      SELECT 
        member_health_measurementdate,
        member_health_weight,
        member_health_bodyfat,
        member_health_chest,
        member_health_waist,
        member_health_hip,
        member_health_arm,
        member_health_thigh
      FROM member_health
      WHERE member_id = ?
      ORDER BY member_health_measurementdate DESC
      LIMIT ?
    `;

    const [rows] = await connection.execute(query, [memberId, limit]);
    connection.release();

    return {
      success: true,
      data: rows
    };

  } catch (error) {
    console.error("Error fetching health history:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงประวัติข้อมูลสุขภาพ"
    };
  }
}
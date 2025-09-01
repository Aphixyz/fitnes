"use server";

import pool from "../../../lib/db.js";

/**
 * ดึงข้อมูลภาพความก้าวหน้าล่าสุดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูลภาพความก้าวหน้าล่าสุด
 */
export async function fetchLatestProgressPhotos(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const connection = await pool.getConnection();

    // Query เพื่อดึงข้อมูลภาพล่าสุดที่มีอย่างน้อย 1 ภาพ
    const query = `
      SELECT 
        member_health_id,
        member_id,
        member_health_measurementdate,
        member_health_weight,
        photo_front,
        photo_side,
        photo_back
      FROM member_health
      WHERE member_id = ?
      AND (photo_front IS NOT NULL OR photo_side IS NOT NULL OR photo_back IS NOT NULL)
      ORDER BY member_health_measurementdate DESC
      LIMIT 1
    `;

    const [rows] = await connection.execute(query, [memberId]);
    connection.release();

    // ถ้าไม่มีข้อมูลภาพ
    if (rows.length === 0) {
      return {
        success: true,
        data: null,
        message: "ไม่พบภาพความก้าวหน้า"
      };
    }

    // ส่งข้อมูลกลับ
    const progressData = rows[0];

    return {
      success: true,
      data: {
        member_health_id: progressData.member_health_id,
        member_id: progressData.member_id,
        member_health_measurementdate: progressData.member_health_measurementdate,
        member_health_weight: progressData.member_health_weight,
        photo_front: progressData.photo_front,
        photo_side: progressData.photo_side,
        photo_back: progressData.photo_back,
        // Count total photos
        total_photos: [
          progressData.photo_front,
          progressData.photo_side,
          progressData.photo_back
        ].filter(photo => photo !== null && photo !== '').length
      }
    };

  } catch (error) {
    console.error("Error fetching progress photos:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลภาพความก้าวหน้า"
    };
  }
}

/**
 * ดึงประวัติภาพความก้าวหน้าทั้งหมดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} limit - จำนวนรายการที่ต้องการ (default: 10)
 * @returns {Promise<Object>} ประวัติภาพความก้าวหน้า
 */
export async function fetchProgressPhotosHistory(memberId, limit = 10) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const connection = await pool.getConnection();

    const query = `
      SELECT 
        member_health_id,
        member_health_measurementdate,
        member_health_weight,
        photo_front,
        photo_side,
        photo_back
      FROM member_health
      WHERE member_id = ?
      AND (photo_front IS NOT NULL OR photo_side IS NOT NULL OR photo_back IS NOT NULL)
      ORDER BY member_health_measurementdate DESC
      LIMIT ?
    `;

    const [rows] = await connection.execute(query, [memberId, limit]);
    connection.release();

    // Add total photos count for each record
    const historyData = rows.map(row => ({
      ...row,
      total_photos: [row.photo_front, row.photo_side, row.photo_back]
        .filter(photo => photo !== null && photo !== '').length
    }));

    return {
      success: true,
      data: historyData
    };

  } catch (error) {
    console.error("Error fetching progress photos history:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงประวัติภาพความก้าวหน้า"
    };
  }
}
"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล progress photos ทั้งหมดของ member
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getAllProgressPhotos(memberId) {
  try {
    if (!memberId) {
      throw new Error("memberId เป็น required field");
    }

    const [rows] = await pool.query(
      `
      SELECT 
        member_health_id,
        member_id,
        member_health_measurementdate AS measurementDate,
        photo_front,
        photo_side,
        photo_back
      FROM member_health
      WHERE member_id = ?
        AND (photo_front IS NOT NULL OR photo_side IS NOT NULL OR photo_back IS NOT NULL)
      ORDER BY member_health_measurementdate DESC, member_health_id DESC
      `,
      [memberId]
    );

    if (rows.length === 0) {
      return { success: false, error: "ไม่พบข้อมูล progress photos" };
    }

    return {
      success: true,
      data: rows.map((row) => ({
        id: row.member_health_id,
        memberId: row.member_id,
        measurementDate: row.measurementDate,
        photos: {
          front: row.photo_front,
          side: row.photo_side,
          back: row.photo_back,
        },
      })),
    };
  } catch (err) {
    console.error("Error getAllProgressPhotos:", err);
    return { success: false, error: err.message };
  }
}

/**
 * ดึงข้อมูล progress photos ของ member ในวัน measurement date ที่กำหนด
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} measurementDate - วันที่ที่ต้องการ (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getProgressPhotos(memberId, measurementDate) {
  try {
    if (!memberId || !measurementDate) {
      throw new Error("memberId และ measurementDate เป็น required field");
    }

    const [rows] = await pool.query(
      `
      SELECT 
        member_health_id,
        member_id,
        member_health_measurementdate AS measurementDate,
        photo_front,
        photo_side,
        photo_back
      FROM member_health
      WHERE member_id = ?
        AND member_health_measurementdate = ?
      ORDER BY member_health_id DESC
      `,
      [memberId, measurementDate]
    );

    if (rows.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูล progress photos ในวันดังกล่าว",
      };
    }

    return {
      success: true,
      data: rows.map((row) => ({
        id: row.member_health_id,
        memberId: row.member_id,
        measurementDate: row.measurementDate,
        photos: {
          front: row.photo_front,
          side: row.photo_side,
          back: row.photo_back,
        },
      })),
    };
  } catch (err) {
    console.error("Error getProgressPhotos:", err);
    return { success: false, error: err.message };
  }
}

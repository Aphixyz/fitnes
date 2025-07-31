"use server";

import pool from "@/lib/db";
import { getProgressPhotos } from "./getProgressPhoto";

/**
 * ดึงข้อมูลสำหรับ WeightLogModal
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูลน้ำหนักล่าสุดและรูปภาพ progress
 */
export async function getWeightLogData(memberId) {
  try {
    if (!memberId) {
      return {
        success: false,
        message: "กรุณาระบุรหัสสมาชิก",
      };
    }

    // ดึงน้ำหนักล่าสุด
    const [weightRows] = await pool.execute(
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

    const latestWeight = weightRows[0]?.member_health_weight || null;

    // ดึงรูปภาพ progress ล่าสุด (วันนี้)
    const today = new Date().toISOString().split("T")[0];
    const progressPhotosResult = await getProgressPhotos(memberId, today);

    let progressPhotos = null;
    if (progressPhotosResult.success && progressPhotosResult.data.length > 0) {
      const latestPhotos = progressPhotosResult.data[0];
      progressPhotos = {
        photo_front: latestPhotos.photo_front,
        photo_side: latestPhotos.photo_side,
        photo_back: latestPhotos.photo_back,
      };
    }

    return {
      success: true,
      data: {
        latestWeight,
        progressPhotos,
      },
    };
  } catch (error) {
    console.error("Error fetching weight log data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}

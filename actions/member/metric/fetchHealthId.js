"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลสุขภาพของสมาชิกจาก healthId ที่ระบุ
 * ใช้สำหรับแก้ไขข้อมูลสุขภาพเฉพาะรายการ
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} healthId - รหัสข้อมูลสุขภาพ
 * @returns {Promise<Object|null>} ข้อมูลสุขภาพหรือ null ถ้าไม่มีข้อมูล
 */
export async function fetchHealthId(memberId, healthId) {
  try {
    // ===== Validation =====
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    if (!healthId) {
      throw new Error("กรุณาระบุรหัสข้อมูลสุขภาพ");
    }

    // ===== Database Query =====
    const [records] = await pool.query(
      `SELECT 
        member_health_id,
        member_id,
        member_health_weight,
        member_health_bodyfat,
        member_health_chest,
        member_health_waist,
        member_health_hip,
        member_health_arm,
        member_health_thigh,
        member_health_measurementdate,
        photo_front,
        photo_side,
        photo_back
       FROM member_health 
       WHERE member_id = ? AND member_health_id = ?`,
      [memberId, healthId]
    );

    // ถ้าไม่มีข้อมูล
    if (records.length === 0) {
      return null;
    }

    const record = records[0];

    // ===== Prepare Response =====
    const result = {
      success: true,
      member_health_id: record.member_health_id,
      member_id: record.member_id,
      measurement_date: record.member_health_measurementdate,

      // ข้อมูลหลัก
      weight: record.member_health_weight,

      // ข้อมูล metric
      metrics: {
        bodyfat: record.member_health_bodyfat,
        chest: record.member_health_chest,
        waist: record.member_health_waist,
        hip: record.member_health_hip,
        arm: record.member_health_arm,
        thigh: record.member_health_thigh,
      },

      // รูปภาพ
      photos: {
        front: record.photo_front,
        side: record.photo_side,
        back: record.photo_back,
      },

      // สรุปข้อมูลที่บันทึกแล้ว
      summary: {
        has_weight: !!record.member_health_weight,
        has_metrics: !!(
          record.member_health_bodyfat ||
          record.member_health_chest ||
          record.member_health_waist ||
          record.member_health_hip ||
          record.member_health_arm ||
          record.member_health_thigh
        ),
        has_photos: !!(
          record.photo_front ||
          record.photo_side ||
          record.photo_back
        ),
        total_metrics: [
          record.member_health_bodyfat,
          record.member_health_chest,
          record.member_health_waist,
          record.member_health_hip,
          record.member_health_arm,
          record.member_health_thigh,
        ].filter(Boolean).length,
        total_photos: [
          record.photo_front,
          record.photo_side,
          record.photo_back,
        ].filter(Boolean).length,
      },

      message: `พบข้อมูลสุขภาพ (ID: ${healthId})`,
    };

    return result;
  } catch (error) {
    console.error("Error fetching health data by ID:", error);
    throw new Error(`ไม่สามารถดึงข้อมูลสุขภาพได้: ${error.message}`);
  }
}

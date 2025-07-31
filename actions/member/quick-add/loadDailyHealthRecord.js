"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลสุขภาพของสมาชิกในวันที่ระบุ
 * ใช้สำหรับแสดงข้อมูลเดิมในฟอร์มเพื่อให้ผู้ใช้เห็นว่าบันทึกอะไรไปแล้ว
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} date - วันที่ (YYYY-MM-DD) ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน
 * @returns {Promise<Object|null>} ข้อมูลสุขภาพหรือ null ถ้าไม่มีข้อมูล
 */
export async function loadDailyHealthRecord(memberId, date = null) {
  try {
    // ===== Validation =====
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // กำหนดวันที่ถ้าไม่ระบุ
    const targetDate = date || new Date().toISOString().split("T")[0];

    // ตรวจสอบรูปแบบวันที่
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD");
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
       WHERE member_id = ? AND member_health_measurementdate = ?
       ORDER BY member_health_id DESC
       LIMIT 1`,
      [memberId, targetDate]
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

      message: `พบข้อมูลสุขภาพของวันที่ ${targetDate}`,
    };

    return result;
  } catch (error) {
    console.error("Error loading daily health record:", error);
    throw new Error(`ไม่สามารถดึงข้อมูลสุขภาพได้: ${error.message}`);
  }
}

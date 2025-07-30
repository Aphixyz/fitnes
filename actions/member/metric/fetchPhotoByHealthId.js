"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลรูปภาพตาม healthId สำหรับแสดงผลในแต่ละ measurement_date
 * @param {number} healthId - รหัสข้อมูลสุขภาพ (member_health_id)
 * @returns {Promise<Object|null>} ข้อมูลรูปภาพพร้อม path และ metadata
 */
export async function fetchPhotoByHealthId(healthId) {
  if (!healthId) throw new Error("กรุณาระบุรหัสข้อมูลสุขภาพ");

  try {
    // Query ข้อมูลรูปภาพและข้อมูลพื้นฐาน
    const [records] = await pool.query(
      `SELECT 
        member_health_id,
        member_id,
        member_health_measurementdate,
        photo_front,
        photo_side,
        photo_back
       FROM member_health
       WHERE member_health_id = ?
       LIMIT 1`,
      [healthId]
    );

    // ถ้าไม่พบข้อมูล
    if (records.length === 0) {
      return null;
    }

    const record = records[0];

    // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
    const measurementDate = record.member_health_measurementdate
      ? typeof record.member_health_measurementdate === "string"
        ? record.member_health_measurementdate
        : record.member_health_measurementdate.toISOString().split("T")[0]
      : null;

    // สร้าง path สำหรับรูปภาพแต่ละด้าน (ใช้ path จากฐานข้อมูลโดยตรง)
    const photos = {
      front: record.photo_front || null,
      side: record.photo_side || null,
      back: record.photo_back || null,
    };

    // นับจำนวนรูปภาพที่มี
    const photoCount = Object.values(photos).filter(
      (photo) => photo !== null
    ).length;

    return {
      health_id: record.member_health_id,
      member_id: record.member_id,
      measurement_date: measurementDate,
      measurement_date_formatted: measurementDate
        ? new Date(measurementDate).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null,
      photos: photos,
      photo_count: photoCount,
      has_photos: photoCount > 0,
    };
  } catch (error) {
    console.error("Error fetching photo by health ID:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ");
  }
}

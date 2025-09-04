"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลสุขภาพย้อนหลังตามช่วงที่เลือก (1 เดือน, 3 เดือน, 6 เดือน, 1 ปี, ทั้งหมด)
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} period - '1m' | '3m' | '6m' | '1y' | 'all' (ช่วงเวลา)
 * @returns {Promise<Array>} array ของข้อมูลวัดผลแต่ละรายการ
 */
export async function fetchAllHealthData(memberId, period = "all") {
  if (!memberId) throw new Error("กรุณาระบุรหัสสมาชิก");

  // กำหนดช่วงเวลา
  let dateCondition = "";
  if (period === "1m") {
    dateCondition =
      "AND member_health_measurementdate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  } else if (period === "3m") {
    dateCondition =
      "AND member_health_measurementdate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
  } else if (period === "6m") {
    dateCondition =
      "AND member_health_measurementdate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
  } else if (period === "1y") {
    dateCondition =
      "AND member_health_measurementdate >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
  } // 'all' ไม่ต้องใส่เงื่อนไข

  // Query
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
     WHERE member_id = ? ${dateCondition}
     ORDER BY member_health_measurementdate DESC, member_health_id DESC`,
    [memberId]
  );

  // Map ข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
  return records.map((rec) => ({
    member_health_id: rec.member_health_id,
    member_id: rec.member_id,
    measurement_date: rec.member_health_measurementdate
      ? typeof rec.member_health_measurementdate === "string"
        ? rec.member_health_measurementdate
        : rec.member_health_measurementdate.toISOString().split("T")[0]
      : null,
    weight: rec.member_health_weight,
    metrics: {
      bodyfat: rec.member_health_bodyfat,
      chest: rec.member_health_chest,
      waist: rec.member_health_waist,
      hip: rec.member_health_hip,
      arm: rec.member_health_arm,
      thigh: rec.member_health_thigh,
    },
    photos: {
      front: rec.photo_front,
      side: rec.photo_side,
      back: rec.photo_back,
    },
  }));
}

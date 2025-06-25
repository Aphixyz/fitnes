"use server";

import pool from "@/lib/db";

// ===== Fetch Member Health Data =====
// ดึงข้อมูลสุขภาพของ Member สำหรับ Trainer
export async function fetchHealthMemberData(memberId) {
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    // ดึงข้อมูลสุขภาพล่าสุดของ member
    const [healthData] = await pool.execute(
      `
      SELECT 
        mh.member_health_id,
        mh.member_id,
        mh.member_health_weight,
        mh.member_health_height,
        mh.member_health_bodyfat,
        mh.member_activity_level,
        mh.member_health_condition,
        mh.member_health_chest,
        mh.member_health_waist,
        mh.member_health_hip,
        mh.member_health_arm,
        mh.member_health_thigh,
        mh.member_health_measurementdate,
        m.member_firstname,
        m.member_lastname
      FROM member_health mh
      INNER JOIN member m ON mh.member_id = m.member_id
      WHERE mh.member_id = ?
      ORDER BY mh.member_health_measurementdate DESC
      LIMIT 1
    `,
      [memberId]
    );

    if (healthData.length === 0) {
      return {
        success: false,
        error: "No health data found for this member",
      };
    }

    return {
      success: true,
      data: healthData[0],
    };
  } catch (error) {
    console.error("Error fetching member health data:", error);
    return {
      success: false,
      error: "Failed to fetch health data",
    };
  }
}

// ===== Fetch Member Health History =====
// ดึงประวัติข้อมูลสุขภาพทั้งหมดของ Member
export async function fetchHealthMemberHistory(memberId) {
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    // ดึงข้อมูลสุขภาพทั้งหมดเรียงตามวันที่
    const [healthHistory] = await pool.execute(
      `
      SELECT 
        mh.member_health_id,
        mh.member_id,
        mh.member_health_weight,
        mh.member_health_height,
        mh.member_health_bodyfat,
        mh.member_health_chest,
        mh.member_health_waist,
        mh.member_health_hip,
        mh.member_health_arm,
        mh.member_health_thigh,
        mh.member_health_condition,
        mh.member_health_measurementdate,
        m.member_firstname,
        m.member_lastname
      FROM member_health mh
      INNER JOIN member m ON mh.member_id = m.member_id
      WHERE mh.member_id = ?
      ORDER BY mh.member_health_measurementdate DESC
    `,
      [memberId]
    );

    return {
      success: true,
      data: healthHistory,
    };
  } catch (error) {
    console.error("Error fetching member health history:", error);
    return {
      success: false,
      error: "Failed to fetch health history",
    };
  }
}

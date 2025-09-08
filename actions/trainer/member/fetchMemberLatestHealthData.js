"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล health ล่าสุดของ member ที่มีค่ามาแสดงเสมอ
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getMemberLatestHealthData(memberId) {
  try {
    if (!memberId) {
      throw new Error("memberId เป็น required field");
    }

    // ดึงข้อมูล health ล่าสุดที่มีค่าอย่างน้อย 1 ฟิลด์
    const [rows] = await pool.query(
      `
      SELECT 
        member_health_id,
        member_id,
        member_health_measurementdate AS measurementDate,
        member_health_height AS height,
        member_health_weight AS weight,
        member_health_chest AS chest,
        member_health_waist AS waist,
        member_health_hip AS hip,
        member_health_arm AS arm,
        member_health_thigh AS thigh,
        member_health_calf AS calf,
        member_health_neck AS neck,
        member_health_shoulder AS shoulder,
        member_health_bicep AS bicep,
        member_health_forearm AS forearm,
        member_health_wrist AS wrist,
        member_health_ankle AS ankle,
        member_health_bodyfat AS bodyfat,
        member_health_muscle AS muscle,
        member_health_bone AS bone,
        member_health_water AS water,
        member_health_visceralfat AS visceralfat,
        member_health_bmr AS bmr,
        member_health_bmi AS bmi,
        member_health_metabolicage AS metabolicage,
        member_health_photo_front,
        member_health_photo_side,
        member_health_photo_back
      FROM member_health
      WHERE member_id = ?
        AND (
          member_health_height IS NOT NULL OR
          member_health_weight IS NOT NULL OR
          member_health_chest IS NOT NULL OR
          member_health_waist IS NOT NULL OR
          member_health_hip IS NOT NULL OR
          member_health_arm IS NOT NULL OR
          member_health_thigh IS NOT NULL OR
          member_health_calf IS NOT NULL OR
          member_health_neck IS NOT NULL OR
          member_health_shoulder IS NOT NULL OR
          member_health_bicep IS NOT NULL OR
          member_health_forearm IS NOT NULL OR
          member_health_wrist IS NOT NULL OR
          member_health_ankle IS NOT NULL OR
          member_health_bodyfat IS NOT NULL OR
          member_health_muscle IS NOT NULL OR
          member_health_bone IS NOT NULL OR
          member_health_water IS NOT NULL OR
          member_health_visceralfat IS NOT NULL OR
          member_health_bmr IS NOT NULL OR
          member_health_bmi IS NOT NULL OR
          member_health_metabolicage IS NOT NULL
        )
      ORDER BY member_health_measurementdate DESC, member_health_id DESC
      LIMIT 1
      `,
      [memberId]
    );

    if (rows.length === 0) {
      return {
        success: true,
        data: {
          height: null,
          weight: null,
          chest: null,
          waist: null,
          hip: null,
          arm: null,
          thigh: null,
          calf: null,
          neck: null,
          shoulder: null,
          bicep: null,
          forearm: null,
          wrist: null,
          ankle: null,
          bodyfat: null,
          muscle: null,
          bone: null,
          water: null,
          visceralfat: null,
          bmr: null,
          bmi: null,
          metabolicage: null,
          measurementDate: null,
          photos: {
            front: null,
            side: null,
            back: null,
          },
        },
      };
    }

    const row = rows[0];
    return {
      success: true,
      data: {
        id: row.member_health_id,
        memberId: row.member_id,
        measurementDate: row.measurementDate,
        height: row.height,
        weight: row.weight,
        chest: row.chest,
        waist: row.waist,
        hip: row.hip,
        arm: row.arm,
        thigh: row.thigh,
        calf: row.calf,
        neck: row.neck,
        shoulder: row.shoulder,
        bicep: row.bicep,
        forearm: row.forearm,
        wrist: row.wrist,
        ankle: row.ankle,
        bodyfat: row.bodyfat,
        muscle: row.muscle,
        bone: row.bone,
        water: row.water,
        visceralfat: row.visceralfat,
        bmr: row.bmr,
        bmi: row.bmi,
        metabolicage: row.metabolicage,
        photos: {
          front: row.member_health_photo_front,
          side: row.member_health_photo_side,
          back: row.member_health_photo_back,
        },
      },
    };
  } catch (err) {
    console.error("Error getMemberLatestHealthData:", err);
    return { success: false, error: err.message };
  }
}

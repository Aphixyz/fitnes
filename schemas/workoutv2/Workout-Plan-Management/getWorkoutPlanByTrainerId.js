"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลแผนการออกกำลังกายทั้งหมดที่เทรนเนอร์สร้าง
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} ผลลัพธ์การดึงข้อมูล
 */
export async function getWorkoutPlanByTrainerId(trainerId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId) {
      throw new Error("กรุณาระบุรหัสเทรนเนอร์");
    }

    // ดึงข้อมูลแผนการออกกำลังกายทั้งหมดที่เทรนเนอร์สร้าง
    const [plans] = await db.query(
      `
      SELECT 
        wp.*,
        m.member_firstname, 
        m.member_lastname,
        COUNT(ws.session_id) AS session_count,
        (
          SELECT COUNT(DISTINCT exercise_id) 
          FROM workout_exercise we 
          JOIN workout_session ws2 ON we.session_id = ws2.session_id 
          WHERE ws2.workout_plan_id = wp.workout_plan_id
        ) AS exercise_count
      FROM 
        workout_plan wp
      LEFT JOIN 
        member m ON wp.member_id = m.member_id
      LEFT JOIN 
        workout_session ws ON wp.workout_plan_id = ws.workout_plan_id
      WHERE 
        wp.trainer_id = ?
      GROUP BY 
        wp.workout_plan_id
      ORDER BY 
        wp.created_at DESC
    `,
      [trainerId]
    );

    return {
      success: true,
      plans: plans.map((plan) => ({
        ...plan,
        member_name: `${plan.member_firstname || ""} ${
          plan.member_lastname || ""
        }`.trim(),
      })),
    };
  } catch (error) {
    console.error("Error fetching workout plans by trainer ID:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนการออกกำลังกาย",
    };
  }
}

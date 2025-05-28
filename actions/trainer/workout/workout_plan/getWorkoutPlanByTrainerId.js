// app/actions/workout-plan/getWorkoutPlanByTrainerId.js
"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลแผนการออกกำลังกายทั้งหมดที่เทรนเนอร์สร้าง
 * พร้อมสรุปจำนวน Sessions และ Exercises
 *
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<{ success: boolean; plans?: Array<any>; message?: string }>}
 */
export async function getWorkoutPlanByTrainerId(trainerId) {
  // ตรวจสอบอินพุตเบื้องต้น
  if (!trainerId || typeof trainerId !== "number") {
    return {
      success: false,
      message: "กรุณาระบุรหัสเทรนเนอร์ให้ถูกต้อง",
    };
  }

  try {
    // Query หลัก: join กับ member, workout_program, program_exercise
    const [rows] = await db.query(
      `
      SELECT
        wp.workout_plan_id,
        wp.trainer_id,
        wp.member_id,
        wp.plan_name,
        wp.plan_duration,
        wp.plan_startdate,
        wp.plan_enddate,
        wp.plan_status,
        wp.created_at,
        m.member_firstname,
        m.member_lastname,
        COUNT(DISTINCT wpgr.workout_program_id) AS session_count,
        COUNT(DISTINCT pe.program_exercise_id)   AS exercise_count
      FROM workout_plan AS wp
      LEFT JOIN member AS m
        ON m.member_id = wp.member_id
      LEFT JOIN workout_program AS wpgr
        ON wpgr.workout_plan_id = wp.workout_plan_id
      LEFT JOIN program_exercise AS pe
        ON pe.workout_program_id = wpgr.workout_program_id
      WHERE wp.trainer_id = ?
      GROUP BY wp.workout_plan_id
      ORDER BY wp.created_at DESC
      `,
      [trainerId]
    );

    // Map เพิ่ม field ชื่อเต็มของลูกค้า
    const plans = rows.map((plan) => ({
      ...plan,
      member_name: `${plan.member_firstname || ""} ${plan.member_lastname || ""}`.trim(),
    }));

    return { success: true, plans };
  } catch (error) {
    console.error("Error in getWorkoutPlanByTrainerId:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนการออกกำลังกาย",
    };
  }
}

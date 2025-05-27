"use server";

import { z } from "zod";
import pool from "@/lib/db";

// Schema สำหรับตรวจสอบ plan_id
const planIdSchema = z.object({
  plan_id: z.coerce.number().positive("ต้องระบุ plan_id"),
});

/**
 * ดึงข้อมูลท่าออกกำลังกายทั้งหมดของแผนการออกกำลังกาย
 * โดยรวม Session -> Exercises ตามลำดับ
 * @param {Object} data - ข้อมูลที่ต้องส่ง plan_id
 * @returns {Promise<Object>}
 */
export async function getPlanExercises(data) {
  try {
    // Validate Input
    const validatedData = planIdSchema.parse(data);
    const { plan_id } = validatedData;

    // ดึง sessions ที่ belong กับ plan
    const [sessions] = await pool.query(
      `SELECT 
        session_id,
        session_name,
        day_of_week,
        order_index
       FROM workout_session
       WHERE workout_plan_id = ?
       ORDER BY order_index ASC`,
      [plan_id]
    );

    if (!sessions.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบ session ในแผนการออกกำลังกายนี้",
      };
    }

    // สำหรับแต่ละ session ➔ ดึง exercises
    for (let session of sessions) {
      const [exercises] = await pool.query(
        `SELECT 
          workout_exercise_id,
          exercise_id,
          sets,
          reps,
          weight_kg,
          rest,
          duration,
          distance,
          notes,
          order_index
         FROM workout_exercise
         WHERE session_id = ?
         ORDER BY order_index ASC`,
        [session.session_id]
      );

      session.exercises = exercises;
    }

    // Return
    return {
      success: true,
      data: {
        plan_id,
        sessions, // sessions ที่มี exercises ซ้อนอยู่ข้างใน
      },
      message: "ดึงข้อมูลท่าออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("ข้อมูลไม่ถูกต้อง:", error.errors);
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบ plan_id",
      };
    }

    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลท่า:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลท่า กรุณาลองใหม่อีกครั้ง",
    };
  }
}
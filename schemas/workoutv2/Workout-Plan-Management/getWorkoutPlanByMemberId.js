"use server";

import { z } from "zod";
import pool from "@/lib/db";

// Schema Validation
const getPlansSchema = z.object({
  trainer_id: z.coerce.number().positive(),
  member_id: z.coerce.number().positive(),
  includeDetails: z.boolean().default(false),
});

export async function getWorkoutPlanByMemberId(data) {
  try {
    const validatedData = getPlansSchema.parse(data);
    const { trainer_id, member_id, includeDetails } = validatedData;

    // Check Authorization
    const [memberCheck] = await pool.query(
      "SELECT registration_id FROM registration WHERE trainer_id = ? AND member_id = ? AND registration_status = 1",
      [trainer_id, member_id]
    );

    if (!memberCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "สมาชิกนี้ไม่ได้อยู่ภายใต้การดูแลของคุณ",
      };
    }

    // Fetch Plans
    const [plans] = await pool.query(
      `SELECT wp.*, wt.template_name
       FROM workout_plan wp
       LEFT JOIN workout_template wt ON wp.template_id = wt.template_id
       WHERE wp.member_id = ? AND wp.trainer_id = ?
       ORDER BY wp.plan_startdate DESC`,
      [member_id, trainer_id]
    );

    if (includeDetails && plans.length > 0) {
      for (const plan of plans) {
        const [sessions] = await pool.query(
          `SELECT * FROM workout_session WHERE workout_plan_id = ? ORDER BY order_index`,
          [plan.workout_plan_id]
        );

        for (const session of sessions) {
          const [exercises] = await pool.query(
            `SELECT * FROM workout_exercise WHERE session_id = ? ORDER BY order_index`,
            [session.session_id]
          );
          session.exercises = exercises;
        }
        plan.sessions = sessions;
      }
    }

    return {
      success: true,
      data: plans,
      message: plans.length ? "ดึงข้อมูลสำเร็จ" : "ไม่พบแผนการออกกำลังกาย",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง",
      };
    }
    console.error("Error:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}

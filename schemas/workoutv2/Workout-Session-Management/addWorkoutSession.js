"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการเพิ่ม Session
const addSessionSchema = z.object({
  workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสแผน"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  session_name: z.string().min(1, "ต้องระบุชื่อเซสชัน"),
  day_of_week: z.string().min(1, "ต้องระบุวันในสัปดาห์"),
});

/**
 * เพิ่ม Session ใหม่เข้า Plan ที่มีอยู่
 */
export async function addWorkoutSession(data) {
  const connection = await pool.getConnection();

  try {
    const validatedData = addSessionSchema.parse(data);
    const { workout_plan_id, trainer_id, session_name, day_of_week } =
      validatedData;

    const [planCheck] = await connection.query(
      "SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );

    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "ไม่มีสิทธิ์เพิ่มเซสชันในแผนนี้",
      };
    }

    const [planStatusCheck] = await connection.query(
      "SELECT plan_status FROM workout_plan WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    if (
      planStatusCheck.length === 0 ||
      planStatusCheck[0].plan_status !== "active"
    ) {
      return {
        success: false,
        error: "plan_not_active",
        message: "แผนนี้ไม่อยู่ในสถานะแก้ไขได้",
      };
    }

    const [orderResult] = await connection.query(
      "SELECT MAX(order_index) as max_order FROM workout_session WHERE workout_plan_id = ?",
      [workout_plan_id]
    );
    const nextOrder =
      orderResult[0].max_order !== null ? orderResult[0].max_order + 1 : 0;

    await connection.beginTransaction();

    const [sessionResult] = await connection.query(
      `INSERT INTO workout_session (workout_plan_id, session_name, day_of_week, order_index)
       VALUES (?, ?, ?, ?)`,
      [workout_plan_id, session_name, day_of_week, nextOrder]
    );

    const sessionId = sessionResult.insertId;

    await connection.commit();

    // หา member เพื่อ revalidate
    const [planInfo] = await connection.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    if (planInfo.length > 0) {
      revalidatePath(`/trainer/${trainer_id}/members/${planInfo[0].member_id}`);
      revalidatePath(`/trainer/${trainer_id}/workout-plans/${workout_plan_id}`);
    }

    return {
      success: true,
      data: {
        session_id: sessionId,
        workout_plan_id,
        session_name,
        day_of_week,
        order_index: nextOrder,
      },
      message: "เพิ่มเซสชันสำเร็จ",
    };
  } catch (error) {
    await connection.rollback();

    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
      };
    }
    console.error("Database error:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาด",
    };
  } finally {
    connection.release();
  }
}

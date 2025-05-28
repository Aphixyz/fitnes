"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูล Exercise
const exerciseSchema = z.object({
  session_id: z.coerce.number().positive("ต้องระบุรหัสเซสชัน"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  exercise_id: z.string().min(1, "ต้องระบุรหัสท่าออกกำลังกาย"),
  sets: z.coerce.number().positive("จำนวนเซ็ตต้องมากกว่า 0"),
  reps: z.string().min(1, "ระบุจำนวนครั้ง"),
  rest: z.coerce.number().nonnegative().optional(),
  duration: z.coerce.number().nonnegative().optional(),
  distance: z.coerce.number().nonnegative().optional(),
  weight_kg: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * เพิ่ม Exercise ใหม่เข้า Session
 */
export async function addExerciseToSession(data) {
  const connection = await pool.getConnection();

  try {
    const validatedData = exerciseSchema.parse(data);
    const {
      session_id,
      trainer_id,
      exercise_id,
      sets,
      reps,
      rest,
      duration,
      distance,
      weight_kg,
      notes,
    } = validatedData;

    // ตรวจสอบว่า session เป็นของเทรนเนอร์จริง
    const [sessionCheck] = await connection.query(
      `SELECT ws.workout_session_id, wp.trainer_id 
       FROM workout_session ws
       JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.session_id = ?`,
      [session_id]
    );

    if (!sessionCheck.length || sessionCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "ไม่มีสิทธิ์เพิ่มท่าในเซสชันนี้",
      };
    }

    const [orderResult] = await connection.query(
      "SELECT MAX(order_index) as max_order FROM workout_exercise WHERE session_id = ?",
      [session_id]
    );
    const nextOrder =
      orderResult[0].max_order !== null ? orderResult[0].max_order + 1 : 0;

    await connection.beginTransaction();

    const [exerciseResult] = await connection.query(
      `INSERT INTO workout_exercise 
       (session_id, exercise_id, order_index, sets, reps, weight_kg, rest, duration, distance, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session_id,
        exercise_id,
        nextOrder,
        sets,
        reps,
        weight_kg || null,
        rest || null,
        duration || null,
        distance || null,
        notes || null,
      ]
    );

    await connection.commit();

    revalidatePath(`/trainer/${trainer_id}/workout-sessions/${session_id}`);

    return {
      success: true,
      data: {
        workout_exercise_id: exerciseResult.insertId,
        session_id,
        exercise_id,
        sets,
        reps,
        weight_kg,
        rest,
        duration,
        distance,
        notes,
      },
      message: "เพิ่มท่าออกกำลังกายสำเร็จ",
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

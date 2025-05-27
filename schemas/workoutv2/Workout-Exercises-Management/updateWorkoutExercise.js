"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Validation
const updateExerciseSchema = z.object({
  workout_exercise_id: z.coerce.number().positive(),
  trainer_id: z.coerce.number().positive(),
  sets: z.coerce.number().positive().optional(),
  reps: z.string().optional(),
  weight_kg: z.string().optional(),
  rest_seconds: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function updateWorkoutExercise(data) {
  try {
    const { workout_exercise_id, trainer_id, ...updateFields } =
      updateExerciseSchema.parse(data);

    // ตรวจสอบสิทธิ์
    const [exerciseCheck] = await pool.query(
      `SELECT we.session_id, wp.trainer_id, ws.workout_plan_id
       FROM workout_exercise we
       JOIN workout_session ws ON we.session_id = ws.session_id
       JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE we.workout_exercise_id = ?`,
      [workout_exercise_id]
    );

    if (!exerciseCheck.length || exerciseCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์แก้ไขท่านี้",
      };
    }

    const updateFieldsArray = Object.entries(updateFields).filter(
      ([, v]) => v !== undefined
    );
    if (!updateFieldsArray.length) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่มีข้อมูลที่ต้องการอัปเดต",
      };
    }

    const updateQuery = `
      UPDATE workout_exercise
      SET ${updateFieldsArray.map(([k]) => `${k} = ?`).join(", ")}
      WHERE workout_exercise_id = ?
    `;
    const updateValues = [
      ...updateFieldsArray.map(([, v]) => v),
      workout_exercise_id,
    ];

    await pool.query(updateQuery, updateValues);

    revalidatePath(
      `/trainer/${trainer_id}/workout-plans/${exerciseCheck[0].workout_plan_id}`
    );

    return {
      success: true,
      data: { workout_exercise_id, ...updateFields },
      message: "อัปเดตท่าออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "server_error",
      message: "เกิดข้อผิดพลาดในการอัปเดตท่าออกกำลังกาย",
    };
  }
}

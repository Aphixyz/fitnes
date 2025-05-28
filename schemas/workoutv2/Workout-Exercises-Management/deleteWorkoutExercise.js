"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

const deleteExerciseSchema = z.object({
  workout_exercise_id: z.coerce.number().positive(),
  trainer_id: z.coerce.number().positive(),
});

export async function deleteWorkoutExercise(data) {
  const connection = await pool.getConnection();

  try {
    const { workout_exercise_id, trainer_id } =
      deleteExerciseSchema.parse(data);

    const [exerciseCheck] = await connection.query(
      `SELECT we.session_id, ws.workout_plan_id, wp.trainer_id
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
        message: "คุณไม่มีสิทธิ์ลบท่าออกกำลังกายนี้",
      };
    }

    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM workout_exercise WHERE workout_exercise_id = ?`,
      [workout_exercise_id]
    );

    await connection.commit();

    revalidatePath(
      `/trainer/${trainer_id}/workout-plans/${exerciseCheck[0].workout_plan_id}`
    );

    return {
      success: true,
      data: { workout_exercise_id },
      message: "ลบท่าออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return {
      success: false,
      error: "server_error",
      message: "เกิดข้อผิดพลาดในการลบท่าออกกำลังกาย",
    };
  } finally {
    connection.release();
  }
}

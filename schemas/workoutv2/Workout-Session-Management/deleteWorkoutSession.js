"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

const deleteSessionSchema = z.object({
  session_id: z.coerce.number().positive(),
  trainer_id: z.coerce.number().positive(),
});

export async function deleteWorkoutSession(data) {
  const connection = await pool.getConnection();

  try {
    const { session_id, trainer_id } = deleteSessionSchema.parse(data);

    const [sessionCheck] = await connection.query(
      `SELECT ws.workout_plan_id, wp.trainer_id
       FROM workout_session ws
       JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.session_id = ?`,
      [session_id]
    );

    if (!sessionCheck.length || sessionCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ลบเซสชันนี้",
      };
    }

    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM workout_exercise WHERE session_id = ?`,
      [session_id]
    );
    await connection.query(`DELETE FROM workout_session WHERE session_id = ?`, [
      session_id,
    ]);

    await connection.commit();

    revalidatePath(
      `/trainer/${trainer_id}/workout-plans/${sessionCheck[0].workout_plan_id}`
    );

    return { success: true, data: { session_id }, message: "ลบเซสชันสำเร็จ" };
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return {
      success: false,
      error: "server_error",
      message: "เกิดข้อผิดพลาดในการลบเซสชัน",
    };
  } finally {
    connection.release();
  }
}

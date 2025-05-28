"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Validation
const updateSessionSchema = z.object({
  session_id: z.coerce.number().positive(),
  session_name: z.string().min(1).optional(),
  day_of_week: z.string().min(1).optional(),
  trainer_id: z.coerce.number().positive(),
});

export async function updateWorkoutSession(data) {
  try {
    const { session_id, trainer_id, ...updateFields } =
      updateSessionSchema.parse(data);

    // ตรวจสอบว่า session_id ถูกต้อง
    const [sessionCheck] = await pool.query(
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
        message: "คุณไม่มีสิทธิ์แก้ไขเซสชันนี้",
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
      UPDATE workout_session
      SET ${updateFieldsArray.map(([k]) => `${k} = ?`).join(", ")}
      WHERE session_id = ?
    `;
    const updateValues = [...updateFieldsArray.map(([, v]) => v), session_id];

    await pool.query(updateQuery, updateValues);

    revalidatePath(
      `/trainer/${trainer_id}/workout-plans/${sessionCheck[0].workout_plan_id}`
    );

    return {
      success: true,
      data: { session_id, ...updateFields },
      message: "อัปเดตเซสชันสำเร็จ",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "server_error",
      message: "เกิดข้อผิดพลาดในการอัปเดตเซสชัน",
    };
  }
}

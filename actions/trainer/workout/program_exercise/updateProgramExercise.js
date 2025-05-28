"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับ Validate ข้อมูลการอัปเดตท่าออกกำลังกายในโปรแกรม
const updateExerciseSchema = z.object({
  program_exercise_id: z.coerce.number().positive("ต้องระบุรหัสท่าออกกำลังกาย"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  rest: z.string().optional(),
  notes: z.string().optional(),
  order_index: z.number().int().nonnegative().optional(),
});

export async function updateProgramExercise(data) {
  const connection = await pool.getConnection();

  try {
    const validatedData = updateExerciseSchema.parse(data);
    const { program_exercise_id, trainer_id, ...updateFields } = validatedData;

    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่มีข้อมูลที่จะอัปเดต",
      };
    }

    // เช็คสิทธิ์ว่า trainer เป็นเจ้าของโปรแกรมนี้
    const [exerciseCheck] = await connection.query(
      `SELECT pe.workout_program_id, wp.workout_plan_id, wp.member_id 
       FROM program_exercise pe
       JOIN workout_program p ON pe.workout_program_id = p.workout_program_id
       JOIN workout_plan wp ON p.workout_plan_id = wp.workout_plan_id
       WHERE pe.program_exercise_id = ? AND wp.trainer_id = ?`,
      [program_exercise_id, trainer_id]
    );

    if (!exerciseCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์แก้ไขท่าออกกำลังกายนี้",
      };
    }

    const { workout_program_id, workout_plan_id, member_id } = exerciseCheck[0];

    // สร้าง query สำหรับอัปเดต
    let querySet = [];
    let queryParams = [];

    for (const [key, value] of Object.entries(updateFields)) {
      querySet.push(`${key} = ?`);
      queryParams.push(value);
    }

    queryParams.push(program_exercise_id); // สำหรับ WHERE

    // อัปเดตข้อมูล
    await connection.query(
      `UPDATE program_exercise SET ${querySet.join(
        ", "
      )} WHERE program_exercise_id = ?`,
      queryParams
    );

    // ดึงข้อมูลท่าออกกำลังกายที่อัปเดตแล้ว
    const [updatedExercise] = await connection.query(
      `SELECT pe.*, e.exercise_name 
       FROM program_exercise pe
       JOIN exercise e ON pe.exercise_id = e.exercise_id
       WHERE pe.program_exercise_id = ?`,
      [program_exercise_id]
    );

    // Revalidate path
    revalidatePath(
      `/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`
    );

    return {
      success: true,
      data: updatedExercise[0],
      message: "อัปเดตท่าออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      };
    }

    console.error("เกิดข้อผิดพลาด:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการอัปเดตท่าออกกำลังกาย กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }
}

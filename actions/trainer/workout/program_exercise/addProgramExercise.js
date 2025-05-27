"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับ Validate ข้อมูลการเพิ่มท่าออกกำลังกายในโปรแกรม
const addExerciseSchema = z.object({
  workout_program_id: z.coerce.number().positive("ต้องระบุรหัสโปรแกรม"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  exercise_id: z.coerce.number().positive("ต้องระบุรหัสท่าออกกำลังกาย"),
  order_index: z.number().int().optional(),
  rest: z.string().optional(),
  notes: z.string().optional(),
});

export async function addProgramExercise(data) {
  const connection = await pool.getConnection();

  try {
    const validatedData = addExerciseSchema.parse(data);
    const {
      workout_program_id,
      trainer_id,
      exercise_id,
      order_index,
      rest,
      notes,
    } = validatedData;

    // เช็คสิทธิ์ว่า trainer เป็นเจ้าของโปรแกรมนี้
    const [programCheck] = await connection.query(
      `SELECT wp.workout_plan_id, wp.member_id 
       FROM workout_program p
       JOIN workout_plan wp ON p.workout_plan_id = wp.workout_plan_id
       WHERE p.workout_program_id = ? AND wp.trainer_id = ?`,
      [workout_program_id, trainer_id]
    );

    if (!programCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์เพิ่มท่าออกกำลังกายในโปรแกรมนี้",
      };
    }

    const { workout_plan_id, member_id } = programCheck[0];

    // ตรวจสอบว่าท่าออกกำลังกายนี้มีอยู่จริง
    const [exerciseCheck] = await connection.query(
      "SELECT exercise_name FROM exercise WHERE exercise_id = ?",
      [exercise_id]
    );

    if (!exerciseCheck.length) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่พบท่าออกกำลังกายนี้ในระบบ",
      };
    }

    // หาค่า order_index ถ้าไม่มีการระบุมา (จะใส่ต่อจากค่าสูงสุดที่มีอยู่)
    let nextOrderIndex = 0;
    if (order_index === undefined) {
      const [maxOrder] = await connection.query(
        "SELECT MAX(order_index) as max_order FROM program_exercise WHERE workout_program_id = ?",
        [workout_program_id]
      );

      nextOrderIndex =
        maxOrder[0].max_order !== null ? maxOrder[0].max_order + 1 : 0;
    } else {
      nextOrderIndex = order_index;
    }

    // เพิ่มท่าออกกำลังกายในโปรแกรม
    const [exerciseResult] = await connection.query(
      `INSERT INTO program_exercise 
       (workout_program_id, exercise_id, order_index, rest, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        workout_program_id,
        exercise_id,
        nextOrderIndex,
        rest || null,
        notes || null,
      ]
    );

    const program_exercise_id = exerciseResult.insertId;

    // Revalidate paths
    revalidatePath(
      `/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`
    );

    return {
      success: true,
      data: {
        program_exercise_id,
        workout_program_id,
        exercise_id,
        exercise_name: exerciseCheck[0].exercise_name,
        order_index: nextOrderIndex,
        rest: rest || null,
        notes: notes || null,
      },
      message: "เพิ่มท่าออกกำลังกายสำเร็จ",
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
      message: "เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }
}

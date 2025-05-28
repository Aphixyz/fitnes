"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับ Validate ข้อมูลเซ็ตออกกำลังกาย
const exerciseSetSchema = z.object({
  program_exercise_id: z.coerce.number().positive("ต้องระบุรหัสท่าออกกำลังกาย"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  set_order: z.number().int().nonnegative("ลำดับเซ็ตต้องเป็นจำนวนเต็มไม่ติดลบ"),
  weight: z.number().optional(),
  reps: z.number().int().optional(),
  time: z.string().optional(), // สำหรับเวลาในรูปแบบ HH:MM:SS
  distance: z.number().optional()
});

export async function upsertProgramExerciseSet(data) {
  const connection = await pool.getConnection();
  
  try {
    const validatedData = exerciseSetSchema.parse(data);
    const { 
      program_exercise_id, 
      trainer_id, 
      set_order,
      weight,
      reps,
      time,
      distance
    } = validatedData;

    // เช็คสิทธิ์ว่า trainer เป็นเจ้าของท่าออกกำลังกายนี้
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

    // ตรวจสอบว่ามีเซ็ตนี้อยู่แล้วหรือไม่
    const [existingSet] = await connection.query(
      `SELECT program_exercise_set_id FROM program_exercise_set 
       WHERE program_exercise_id = ? AND set_order = ?`,
      [program_exercise_id, set_order]
    );

    let program_exercise_set_id;
    let isNewRecord = false;

    if (existingSet.length > 0) {
      // อัปเดตเซ็ตที่มีอยู่แล้ว
      program_exercise_set_id = existingSet[0].program_exercise_set_id;
      
      await connection.query(
        `UPDATE program_exercise_set 
         SET weight = ?, reps = ?, time = ?, distance = ?
         WHERE program_exercise_set_id = ?`,
        [
          weight !== undefined ? weight : null,
          reps !== undefined ? reps : null,
          time || null,
          distance !== undefined ? distance : null,
          program_exercise_set_id
        ]
      );
    } else {
      // สร้างเซ็ตใหม่
      isNewRecord = true;
      
      const [result] = await connection.query(
        `INSERT INTO program_exercise_set 
         (program_exercise_id, set_order, weight, reps, time, distance)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          program_exercise_id,
          set_order,
          weight !== undefined ? weight : null,
          reps !== undefined ? reps : null,
          time || null,
          distance !== undefined ? distance : null
        ]
      );
      
      program_exercise_set_id = result.insertId;
    }

    // ดึงข้อมูลเซ็ตล่าสุด
    const [updatedSet] = await connection.query(
      `SELECT * FROM program_exercise_set WHERE program_exercise_set_id = ?`,
      [program_exercise_set_id]
    );

    // Revalidate path
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`);

    return {
      success: true,
      data: updatedSet[0],
      isNewRecord,
      message: isNewRecord ? "เพิ่มเซ็ตสำเร็จ" : "อัปเดตเซ็ตสำเร็จ",
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
      message: "เกิดข้อผิดพลาดในการจัดการเซ็ต กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }
}
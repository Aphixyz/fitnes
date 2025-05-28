"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลโปรแกรมและท่าออกกำลังกาย
const exerciseSetSchema = z.object({
  set_order: z.number().int(),
  weight: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  time: z.string().nullable().optional(),
  distance: z.number().nullable().optional(),
});

const programExerciseSchema = z.object({
  exercise_id: z.number().int().positive(),
  order_index: z.number().int(),
  rest: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(exerciseSetSchema),
  // ถ้าเป็นรายการเดิม จะมี program_exercise_id
  program_exercise_id: z.number().int().positive().optional(),
});

const programSchema = z.object({
  workout_program_id: z.number().int().positive(),
  trainer_id: z.number().int().positive(),
  program_name: z.string().min(1, "ต้องระบุชื่อโปรแกรม"),
  program_note: z.string().optional(),
  exercises: z.array(programExerciseSchema),
});

export async function saveProgram(data) {
  const connection = await pool.getConnection();
  
  try {
    // ตรวจสอบข้อมูลที่ส่งมา
    const validatedData = programSchema.parse(data);
    const { workout_program_id, trainer_id, program_name, program_note, exercises } = validatedData;
    
    // ตรวจสอบสิทธิ์ของเทรนเนอร์
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
        message: "คุณไม่มีสิทธิ์แก้ไขโปรแกรมนี้",
      };
    }

    const { workout_plan_id, member_id } = programCheck[0];
    
    // เริ่ม transaction
    await connection.beginTransaction();
    
    // 1. อัพเดตข้อมูลโปรแกรม
    await connection.query(
      `UPDATE workout_program 
       SET program_name = ?, program_note = ? 
       WHERE workout_program_id = ?`,
      [program_name, program_note, workout_program_id]
    );
    
    // 2. ลบข้อมูลเซ็ตของท่าออกกำลังกายทั้งหมด (ลบลูกก่อน)
    await connection.query(
      `DELETE pes FROM program_exercise_set pes
       JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
       WHERE pe.workout_program_id = ?`,
      [workout_program_id]
    );
    
    // 3. ลบข้อมูลท่าออกกำลังกายทั้งหมด
    await connection.query(
      "DELETE FROM program_exercise WHERE workout_program_id = ?",
      [workout_program_id]
    );
    
    // 4. เพิ่มข้อมูลท่าออกกำลังกายใหม่ทั้งหมด
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      
      // 4.1 เพิ่มท่าออกกำลังกาย
      const [exerciseResult] = await connection.query(
        `INSERT INTO program_exercise 
         (workout_program_id, exercise_id, order_index, rest, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          workout_program_id,
          exercise.exercise_id,
          exercise.order_index || i,
          exercise.rest || null,
          exercise.notes || null,
        ]
      );
      
      const program_exercise_id = exerciseResult.insertId;
      
      // 4.2 เพิ่มเซ็ตของท่าออกกำลังกาย
      if (exercise.sets && exercise.sets.length > 0) {
        for (const set of exercise.sets) {
          await connection.query(
            `INSERT INTO program_exercise_set 
             (program_exercise_id, set_order, weight, reps, time, distance)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              program_exercise_id,
              set.set_order,
              set.weight !== undefined ? set.weight : null,
              set.reps !== undefined ? set.reps : null,
              set.time || null,
              set.distance !== undefined ? set.distance : null,
            ]
          );
        }
      }
    }
    
    // ยืนยัน transaction
    await connection.commit();
    
    // Revalidate paths
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`);
    
    return {
      success: true,
      message: "บันทึกโปรแกรมสำเร็จ",
    };
    
  } catch (error) {
    // ยกเลิก transaction ถ้าเกิดข้อผิดพลาด
    await connection.rollback();
    
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
      message: "เกิดข้อผิดพลาดในการบันทึกโปรแกรม กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }
}
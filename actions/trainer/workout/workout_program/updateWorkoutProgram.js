"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลโปรแกรมและท่าออกกำลังกาย
const exerciseSetSchema = z.object({
  program_exercise_set_id: z.number().int().positive().nullable().optional(),
  set: z.number().int().positive(), // client-side field name
  weight: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  time: z.string().nullable().optional(),
  distance: z.number().nullable().optional(),
});

const programExerciseSchema = z.object({
  program_exercise_id: z.number().int().positive().nullable().optional(),
  exercise_id: z.string().or(z.number().int().positive()),
  order_index: z.number().int(),
  rest: z.number().int().nullable().optional(),
  sets: z.array(exerciseSetSchema),
});

const programSchema = z.object({
  program_id: z.number().int().positive(),
  workout_plan_id: z.number().int().positive(),
  program_name: z.string().min(1, "ต้องระบุชื่อโปรแกรม"),
  program_note: z.string().nullable().optional(),
  exercises: z.array(programExerciseSchema).optional(),
});

// แปลงเวลาจากวินาทีเป็นรูปแบบ TIME ของ MySQL (HH:MM:SS)
function formatTimeFromSeconds(seconds) {
  if (!seconds) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export async function updateWorkoutProgram(payload) {
  try {
    // ตรวจสอบข้อมูลที่ส่งมา
    const validatedData = programSchema.parse(payload);
    const {
      program_id,
      workout_plan_id,
      program_name,
      program_note,
      exercises,
    } = validatedData;

    const connection = await db.getConnection();

    try {
      // เริ่ม transaction
      await connection.beginTransaction();

      // 1. อัพเดตข้อมูลโปรแกรม
      await connection.query(
        `UPDATE workout_program 
         SET program_name = ?, program_note = ? 
         WHERE workout_program_id = ?`,
        [program_name, program_note || null, program_id]
      );

      if (exercises && exercises.length > 0) {
        // 2. ลบข้อมูลเซ็ตของท่าออกกำลังกายทั้งหมด (ลบลูกก่อน)
        await connection.query(
          `DELETE pes FROM program_exercise_set pes
           JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
           WHERE pe.workout_program_id = ?`,
          [program_id]
        );

        // 3. ลบข้อมูลท่าออกกำลังกายทั้งหมด
        await connection.query(
          "DELETE FROM program_exercise WHERE workout_program_id = ?",
          [program_id]
        );

        // 4. เพิ่มข้อมูลท่าออกกำลังกายใหม่ทั้งหมด
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];

          // แปลงค่า rest เป็นรูปแบบ TIME ของ MySQL
          const restTime = formatTimeFromSeconds(exercise.rest);

          // 4.1 เพิ่มท่าออกกำลังกาย
          const [exerciseResult] = await connection.query(
            `INSERT INTO program_exercise 
             (workout_program_id, exercise_id, order_index, rest)
             VALUES (?, ?, ?, ?)`,
            [
              program_id,
              exercise.exercise_id,
              exercise.order_index || i,
              exercise.rest || null,
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
                  set.set, // ใช้ set ที่รับมาจาก client แต่บันทึกลงฟิลด์ set_order
                  set.weight !== undefined ? set.weight : null,
                  set.reps !== undefined ? set.reps : null,
                  set.time || null,
                  set.distance !== undefined ? set.distance : null,
                ]
              );
            }
          }
        }
      }

      // ยืนยัน transaction
      await connection.commit();

      // Revalidate paths
      revalidatePath(
        `/trainer/${payload.trainerId}/members/${payload.memberId}/workout-plan/${workout_plan_id}`
      );

      return {
        success: true,
        message: "บันทึกโปรแกรมสำเร็จ",
      };
    } catch (error) {
      // ยกเลิก transaction ถ้าเกิดข้อผิดพลาด
      await connection.rollback();
      console.error("SQL Error:", error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกโปรแกรม:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      };
    }

    return {
      success: false,
      error: "database_error",
      message: `เกิดข้อผิดพลาดในการบันทึกโปรแกรม: ${
        error.sqlMessage || error.message
      }`,
    };
  }
}

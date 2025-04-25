"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลท่าออกกำลังกายที่บันทึก
const exerciseLogSchema = z.object({
  exercise_id: z.string().min(1, "ต้องระบุรหัสท่าออกกำลังกาย"),
  exercise_order: z.coerce.number().int().nonnegative().default(0),
  sets_completed: z.coerce.number().int().nonnegative(),
  reps_per_set: z.string().default(""), // เช่น "10,8,12" หรือ "ทำไม่ไหว,8,10"
  weight_per_set: z.string().default(""), // เช่น "10,10,12.5" หรือ "-,-,5"
  duration_minutes: z.coerce.number().int().nonnegative().optional(),
  difficulty_rating: z.coerce.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

// Schema สำหรับตรวจสอบข้อมูลการบันทึกผลการออกกำลังกาย
const workoutLogSchema = z.object({
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"), // เพื่อตรวจสอบสิทธิ์
  workout_plan_id: z.coerce.number().positive().optional(), // ถ้าไม่ระบุ แสดงว่าเป็นการออกกำลังกายนอกแผน
  workout_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD")
    .default(() => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }),
  duration_minutes: z.coerce
    .number()
    .int()
    .positive("ระยะเวลาออกกำลังกายต้องมากกว่า 0 นาที"),
  intensity_level: z.coerce
    .number()
    .int()
    .min(1, "ระดับความหนักต้องอยู่ระหว่าง 1-10")
    .max(10, "ระดับความหนักต้องอยู่ระหว่าง 1-10"),
  completion_percentage: z.coerce
    .number()
    .int()
    .min(0, "เปอร์เซ็นต์การทำสำเร็จต้องอยู่ระหว่าง 0-100")
    .max(100, "เปอร์เซ็นต์การทำสำเร็จต้องอยู่ระหว่าง 0-100")
    .default(100),
  notes: z.string().optional(),
  exercises: z
    .array(exerciseLogSchema)
    .min(1, "ต้องมีข้อมูลท่าออกกำลังกายอย่างน้อย 1 ท่า"),
});

/**
 * บันทึกผลการออกกำลังกายของสมาชิก
 * @param {Object} data - ข้อมูลการออกกำลังกายที่ต้องการบันทึก
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function logWorkoutSession(data) {
  // สร้าง connection เพื่อทำ transaction
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = workoutLogSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      member_id,
      trainer_id,
      workout_plan_id,
      workout_date,
      duration_minutes,
      intensity_level,
      completion_percentage,
      notes,
      exercises,
    } = validatedData;

    // ตรวจสอบว่าสมาชิกนี้อยู่ภายใต้การดูแลของเทรนเนอร์คนนี้หรือไม่
    const [memberCheck] = await connection.query(
      "SELECT registration_id FROM registration WHERE trainer_id = ? AND member_id = ? AND registration_status = 1",
      [trainer_id, member_id]
    );

    if (!memberCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการบันทึกข้อมูลให้กับสมาชิกนี้",
      };
    }

    // ถ้ามีการระบุ workout_plan_id ให้ตรวจสอบว่าแผนนี้เป็นของสมาชิกคนนี้จริงๆ
    if (workout_plan_id) {
      const [planCheck] = await connection.query(
        "SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ? AND member_id = ? AND trainer_id = ?",
        [workout_plan_id, member_id, trainer_id]
      );

      if (!planCheck.length) {
        return {
          success: false,
          error: "not_found",
          message:
            "ไม่พบแผนการออกกำลังกายที่ระบุ หรือแผนดังกล่าวไม่ได้เป็นของสมาชิกนี้",
        };
      }
    }

    // เริ่มต้น transaction
    await connection.beginTransaction();

    // 1. สร้าง workout log
    const [logResult] = await connection.query(
      `INSERT INTO workout_log 
       (member_id, workout_plan_id, workout_date, duration_minutes, intensity_level, completion_percentage, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id,
        workout_plan_id || null,
        workout_date,
        duration_minutes,
        intensity_level,
        completion_percentage,
        notes || null,
      ]
    );

    const workoutLogId = logResult.insertId;

    // 2. สร้างบันทึกสำหรับแต่ละท่าออกกำลังกาย
    for (const exercise of exercises) {
      await connection.query(
        `INSERT INTO exercise_log 
         (workout_log_id, exercise_id, exercise_order, sets_completed, 
          reps_per_set, weight_per_set, duration_minutes, difficulty_rating, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workoutLogId,
          exercise.exercise_id,
          exercise.exercise_order,
          exercise.sets_completed,
          exercise.reps_per_set,
          exercise.weight_per_set,
          exercise.duration_minutes || null,
          exercise.difficulty_rating || null,
          exercise.notes || null,
        ]
      );
    }

    // Commit transaction
    await connection.commit();

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}`);
    revalidatePath(`/member/${member_id}/workout-logs`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        workout_log_id: workoutLogId,
        member_id,
        workout_plan_id,
        workout_date,
        duration_minutes,
        intensity_level,
        completion_percentage,
        exercises_count: exercises.length,
      },
      message: "บันทึกผลการออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    // Rollback transaction เมื่อเกิดข้อผิดพลาด
    await connection.rollback();

    // จัดการข้อผิดพลาดตามประเภท
    if (error instanceof z.ZodError) {
      console.error("ข้อมูลไม่ถูกต้อง:", error.errors);
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก",
      };
    }

    console.error("เกิดข้อผิดพลาดในการบันทึกผลการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการบันทึกผลการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  } finally {
    // ส่งคืน connection กลับไปยัง pool ไม่ว่าจะสำเร็จหรือไม่
    connection.release();
  }
}

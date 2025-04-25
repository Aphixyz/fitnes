"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลท่าออกกำลังกาย
const exerciseSchema = z.object({
  session_id: z.coerce.number().positive("ต้องระบุรหัสเซสชัน"),
  exercise_id: z.string().min(1, "ต้องระบุรหัสท่าออกกำลังกาย"),
  order_index: z.coerce.number().int().nonnegative().default(0),
  sets: z.coerce.number().int().positive("จำนวนเซ็ตต้องมากกว่า 0").default(3),
  reps: z.string().min(1, "ต้องระบุจำนวนครั้ง (เช่น 10, 8-12)").default("10"),
  rest_seconds: z.coerce
    .number()
    .int()
    .nonnegative("เวลาพักต้องไม่ติดลบ")
    .default(60),
  weight_suggestion: z.string().optional(),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
});

/**
 * เพิ่มท่าออกกำลังกายลงในเซสชัน
 * @param {Object} data - ข้อมูลท่าออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function addExerciseToSession(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = exerciseSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      session_id,
      exercise_id,
      order_index,
      sets,
      reps,
      rest_seconds,
      weight_suggestion,
      trainer_id,
    } = validatedData;

    // ตรวจสอบว่าเซสชันนี้เป็นของเทรนเนอร์คนนี้จริงๆ
    const [sessionCheck] = await pool.query(
      `SELECT wt.trainer_id 
       FROM template_session ts
       JOIN workout_template wt ON ts.template_id = wt.template_id
       WHERE ts.session_id = ?`,
      [session_id]
    );

    if (!sessionCheck.length || sessionCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการแก้ไขเซสชันนี้",
      };
    }

    // เพิ่มท่าออกกำลังกายใหม่
    const [result] = await pool.query(
      `INSERT INTO template_exercise 
       (session_id, exercise_id, order_index, sets, reps, rest_seconds, weight_suggestion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session_id,
        exercise_id,
        order_index,
        sets,
        reps,
        rest_seconds,
        weight_suggestion,
      ]
    );

    // ดึงข้อมูลเทมเพลตที่เชื่อมโยงกับเซสชันนี้เพื่อใช้ในการ revalidate
    const [templateInfo] = await pool.query(
      `SELECT ts.template_id
       FROM template_session ts
       WHERE ts.session_id = ?`,
      [session_id]
    );

    if (templateInfo.length > 0) {
      // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
      revalidatePath(
        `/trainer/${trainer_id}/workout-templates/${templateInfo[0].template_id}`
      );
    }

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        template_exercise_id: result.insertId,
        session_id,
        exercise_id,
        order_index,
        sets,
        reps,
        rest_seconds,
        weight_suggestion,
      },
      message: "เพิ่มท่าออกกำลังกายลงในเซสชันสำเร็จ",
    };
  } catch (error) {
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

    console.error("เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  }
}

"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการเพิ่มท่าออกกำลังกาย
const addExerciseSchema = z.object({
  session_id: z.coerce.number().positive("ต้องระบุรหัสเซสชัน"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  exercise_id: z.string().min(1, "ต้องระบุรหัสท่าออกกำลังกาย"),
  sets: z.coerce.number().int().positive("จำนวนเซ็ตต้องมากกว่า 0"),
  reps: z.string().min(1, "ต้องระบุจำนวนครั้ง"),
  rest_seconds: z.coerce.number().int().nonnegative().default(60),
  notes: z.string().optional(),
});

/**
 * เพิ่มท่าออกกำลังกายใหม่ให้กับเซสชันที่มีอยู่
 * @param {Object} data - ข้อมูลสำหรับเพิ่มท่าออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function addWorkoutExercise(data) {
  // สร้าง connection เพื่อทำ transaction
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = addExerciseSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      session_id,
      trainer_id,
      exercise_id,
      sets,
      reps,
      rest_seconds,
      notes,
    } = validatedData;

    // ตรวจสอบว่าเซสชันนี้อยู่ภายใต้แผนที่เป็นของเทรนเนอร์คนนี้หรือไม่
    const [sessionCheck] = await connection.query(
      `SELECT ws.session_id, wp.trainer_id, wp.workout_plan_id, wp.member_id, wp.plan_status
       FROM workout_session ws
       JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.session_id = ?`,
      [session_id]
    );

    if (!sessionCheck.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบเซสชันนี้",
      };
    }

    if (sessionCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการแก้ไขเซสชันนี้",
      };
    }

    if (sessionCheck[0].plan_status !== "active") {
      return {
        success: false,
        error: "plan_not_active",
        message: "แผนการออกกำลังกายนี้ไม่ได้อยู่ในสถานะที่สามารถแก้ไขได้",
      };
    }

    // หาลำดับของท่าออกกำลังกายล่าสุดในเซสชันนี้
    const [orderResult] = await connection.query(
      "SELECT MAX(order_index) as max_order FROM workout_exercise WHERE session_id = ?",
      [session_id]
    );

    const nextOrder =
      orderResult[0].max_order !== null ? orderResult[0].max_order + 1 : 0;

    // เริ่มต้น transaction
    await connection.beginTransaction();

    // เพิ่มท่าออกกำลังกาย
    const [exerciseResult] = await connection.query(
      `INSERT INTO workout_exercise 
       (session_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session_id,
        exercise_id,
        nextOrder,
        sets,
        reps,
        rest_seconds,
        notes || null,
      ]
    );

    const workoutExerciseId = exerciseResult.insertId;

    // Commit transaction
    await connection.commit();

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(
      `/trainer/${trainer_id}/members/${sessionCheck[0].member_id}`
    );
    revalidatePath(
      `/trainer/${trainer_id}/workout-plans/${sessionCheck[0].workout_plan_id}`
    );

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        workout_exercise_id: workoutExerciseId,
        session_id,
        exercise_id,
        order_index: nextOrder,
        sets,
        reps,
        rest_seconds,
        notes: notes || null,
      },
      message: "เพิ่มท่าออกกำลังกายสำเร็จ",
    };
  } catch (error) {
    // Rollback transaction เมื่อเกิดข้อผิดพลาด
    if (connection) await connection.rollback();

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
  } finally {
    // ส่งคืน connection กลับไปยัง pool ไม่ว่าจะสำเร็จหรือไม่
    if (connection) connection.release();
  }
}

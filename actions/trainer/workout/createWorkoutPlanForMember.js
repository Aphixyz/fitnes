"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการสร้างแผนออกกำลังกายใหม่
const createPlanSchema = z.object({
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  plan_name: z.string().min(1, "ต้องระบุชื่อแผนการออกกำลังกาย"),
  // ลดความเข้มงวดของรูปแบบวันที่ลง เพื่อให้ frontend สามารถส่งข้อมูลได้ง่ายขึ้น
  plan_startdate: z.string().min(1, "ต้องระบุวันที่เริ่มต้น"),
  plan_enddate: z.string().min(1, "ต้องระบุวันที่สิ้นสุด"),
  sessions: z
    .array(
      z.object({
        session_name: z.string().min(1, "ต้องระบุชื่อเซสชัน"),
        // ลดความเข้มงวดของวันในสัปดาห์ลง ไม่จำเป็นต้องตรงกับรายการที่กำหนด
        day_of_week: z.string().min(1, "ต้องระบุวันในสัปดาห์"),
        exercises: z
          .array(
            z.object({
              exercise_id: z.string().min(1, "ต้องระบุรหัสท่าออกกำลังกาย"),
              sets: z.coerce.number().int().positive("จำนวนเซ็ตต้องมากกว่า 0"),
              reps: z.string().min(1, "ต้องระบุจำนวนครั้ง"),
              rest_seconds: z.coerce.number().int().nonnegative().default(60),
              notes: z.string().optional(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .min(1, "ต้องมีอย่างน้อย 1 เซสชัน"),
});

/**
 * สร้างแผนออกกำลังกายใหม่ให้กับสมาชิก
 * @param {Object} data - ข้อมูลสำหรับสร้างแผนออกกำลังกายและเซสชันพร้อมท่าออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function createWorkoutPlanForMember(data) {
  // สร้าง connection เพื่อทำ transaction
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = createPlanSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      trainer_id,
      member_id,
      plan_name,
      plan_startdate,
      plan_enddate,
      sessions,
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
        message: "สมาชิกนี้ไม่ได้อยู่ภายใต้การดูแลของคุณ",
      };
    }

    // เริ่มต้น transaction
    await connection.beginTransaction();

    // 1. สร้าง workout plan
    const [planResult] = await connection.query(
      `INSERT INTO workout_plan 
       (trainer_id, member_id, plan_name, plan_startdate, plan_enddate, plan_status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [trainer_id, member_id, plan_name, plan_startdate, plan_enddate]
    );

    const workoutPlanId = planResult.insertId;

    // 2. สร้างเซสชันและท่าออกกำลังกาย
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];

      // สร้างเซสชัน
      const [sessionResult] = await connection.query(
        `INSERT INTO workout_session 
         (workout_plan_id, session_name, day_of_week, order_index)
         VALUES (?, ?, ?, ?)`,
        [workoutPlanId, session.session_name, session.day_of_week, i]
      );

      const sessionId = sessionResult.insertId;

      // สร้างท่าออกกำลังกายในเซสชัน
      if (session.exercises && session.exercises.length > 0) {
        for (let j = 0; j < session.exercises.length; j++) {
          const exercise = session.exercises[j];

          await connection.query(
            `INSERT INTO workout_exercise 
             (session_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              sessionId,
              exercise.exercise_id,
              j,
              exercise.sets,
              exercise.reps,
              exercise.rest_seconds,
              exercise.notes || null,
            ]
          );
        }
      }
    }

    // Commit transaction
    await connection.commit();

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        workout_plan_id: workoutPlanId,
        trainer_id,
        member_id,
        plan_name,
        plan_startdate,
        plan_enddate,
        plan_status: "active",
      },
      message: "สร้างแผนการออกกำลังกายสำเร็จ",
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

    console.error("เกิดข้อผิดพลาดในการสร้างแผนการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการสร้างแผนการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  } finally {
    // ส่งคืน connection กลับไปยัง pool ไม่ว่าจะสำเร็จหรือไม่
    connection.release();
  }
}

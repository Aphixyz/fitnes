"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการสร้างแผนออกกำลังกายจากเทมเพลต
const copyTemplateToPlanSchema = z.object({
  template_id: z.coerce.number().positive("ต้องระบุรหัสเทมเพลต"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  plan_name: z.string().min(1, "ต้องระบุชื่อแผนการออกกำลังกาย"),
  plan_startdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"),
  plan_enddate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"),
});

/**
 * สร้างแผนออกกำลังกายจากเทมเพลตที่มีอยู่แล้ว
 * @param {Object} data - ข้อมูลสำหรับสร้างแผนออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function copyTemplateToPlan(data) {
  // สร้าง connection เพื่อทำ transaction
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = copyTemplateToPlanSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      template_id,
      trainer_id,
      member_id,
      plan_name,
      plan_startdate,
      plan_enddate,
    } = validatedData;

    // ตรวจสอบว่าเทมเพลตนี้เป็นของเทรนเนอร์คนนี้จริงๆ
    const [templateCheck] = await connection.query(
      "SELECT trainer_id FROM workout_template WHERE template_id = ?",
      [template_id]
    );

    if (!templateCheck.length || templateCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการใช้เทมเพลตนี้",
      };
    }

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
       (template_id, trainer_id, member_id, plan_name, plan_startdate, plan_enddate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        template_id,
        trainer_id,
        member_id,
        plan_name,
        plan_startdate,
        plan_enddate,
      ]
    );

    const workoutPlanId = planResult.insertId;

    // 2. คัดลอกเซสชันทั้งหมดจาก template
    const [sessions] = await connection.query(
      "SELECT * FROM template_session WHERE template_id = ? ORDER BY order_index",
      [template_id]
    );

    // แมปรหัสเซสชันเก่ากับรหัสเซสชันใหม่เพื่อใช้ในการคัดลอกท่าออกกำลังกาย
    const sessionMap = new Map();

    // สร้างเซสชันใหม่ในแผนออกกำลังกาย
    for (const session of sessions) {
      const [sessionResult] = await connection.query(
        `INSERT INTO workout_session 
         (workout_plan_id, session_name, day_of_week, order_index)
         VALUES (?, ?, ?, ?)`,
        [
          workoutPlanId,
          session.session_name,
          session.day_of_week,
          session.order_index,
        ]
      );

      // เก็บการแมปรหัสเซสชันเก่ากับใหม่
      sessionMap.set(session.session_id, sessionResult.insertId);

      // 3. คัดลอกท่าออกกำลังกายในแต่ละเซสชัน
      const [exercises] = await connection.query(
        "SELECT * FROM template_exercise WHERE session_id = ? ORDER BY order_index",
        [session.session_id]
      );

      // สร้างท่าออกกำลังกายใหม่ในแต่ละเซสชัน
      for (const exercise of exercises) {
        await connection.query(
          `INSERT INTO workout_exercise 
           (session_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionResult.insertId,
            exercise.exercise_id,
            exercise.order_index,
            exercise.sets,
            exercise.reps,
            exercise.rest_seconds,
            exercise.weight_suggestion, // เอาคำแนะนำเกี่ยวกับน้ำหนักไปใส่ในโน้ตแทน
          ]
        );
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
        template_id,
        trainer_id,
        member_id,
        plan_name,
        plan_startdate,
        plan_enddate,
        plan_status: "active",
      },
      message: "สร้างแผนการออกกำลังกายจากเทมเพลตสำเร็จ",
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

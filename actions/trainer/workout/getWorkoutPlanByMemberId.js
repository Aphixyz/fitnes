"use server";

import { z } from "zod";
import pool from "@/lib/db";

// Schema สำหรับตรวจสอบข้อมูล
const getPlansSchema = z.object({
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  includeDetails: z.boolean().default(false),
});

/**
 * ดึงข้อมูลแผนการออกกำลังกายทั้งหมดของสมาชิก
 * @param {Object} data - ข้อมูลสำหรับการค้นหาแผนออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function getWorkoutPlanByMemberId(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = getPlansSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const { trainer_id, member_id, includeDetails } = validatedData;

    // ตรวจสอบว่าสมาชิกนี้อยู่ภายใต้การดูแลของเทรนเนอร์คนนี้หรือไม่
    const [memberCheck] = await pool.query(
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

    // 1. ดึงข้อมูลแผนการออกกำลังกาย
    const [plans] = await pool.query(
      `SELECT wp.*, wt.template_name
       FROM workout_plan wp
       LEFT JOIN workout_template wt ON wp.template_id = wt.template_id
       WHERE wp.member_id = ? AND wp.trainer_id = ?
       ORDER BY wp.plan_startdate DESC`,
      [member_id, trainer_id]
    );

    // 2. ถ้าต้องการข้อมูลเซสชันและท่าออกกำลังกายในแต่ละแผน
    if (includeDetails && plans.length > 0) {
      // วนลูปแต่ละแผนเพื่อดึงรายละเอียด
      for (const plan of plans) {
        // 2.1 ดึงข้อมูลเซสชัน
        const [sessions] = await pool.query(
          `SELECT * FROM workout_session 
           WHERE workout_plan_id = ? 
           ORDER BY order_index`,
          [plan.workout_plan_id]
        );

        // 2.2 วนลูปแต่ละเซสชันเพื่อดึงท่าออกกำลังกาย
        for (const session of sessions) {
          const [exercises] = await pool.query(
            `SELECT * FROM workout_exercise 
             WHERE session_id = ? 
             ORDER BY order_index`,
            [session.session_id]
          );

          // เพิ่มข้อมูลท่าออกกำลังกายลงในเซสชัน
          session.exercises = exercises;
        }

        // เพิ่มข้อมูลเซสชันลงในแผน
        plan.sessions = sessions;
      }
    }

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: plans,
      message:
        plans.length > 0
          ? "ดึงข้อมูลแผนการออกกำลังกายสำเร็จ"
          : "ไม่พบแผนการออกกำลังกายของสมาชิกนี้",
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

    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลแผนการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message:
        "เกิดข้อผิดพลาดในการดึงข้อมูลแผนการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  }
}

"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการลบแผนออกกำลังกาย
const deletePlanSchema = z.object({
  workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสแผนการออกกำลังกาย"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  force_delete: z.boolean().default(false), // เพิ่มตัวเลือกในการบังคับลบแม้มีข้อมูลลงทะเบียนเชื่อมโยง
});

/**
 * ลบแผนการออกกำลังกาย
 * @param {Object} data - ข้อมูลสำหรับการลบแผนออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function deleteWorkoutPlan(data) {
  // สร้าง connection เพื่อทำ transaction
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = deletePlanSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const { workout_plan_id, trainer_id, force_delete } = validatedData;

    // ตรวจสอบว่าแผนนี้เป็นของเทรนเนอร์คนนี้จริงๆ
    const [planCheck] = await connection.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );

    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการลบแผนการออกกำลังกายนี้",
      };
    }

    const memberId = planCheck[0].member_id;

    // ตรวจสอบว่ามีการบันทึกการออกกำลังกาย (workout_log) ที่เชื่อมโยงกับแผนนี้หรือไม่
    const [logCheck] = await connection.query(
      "SELECT COUNT(*) AS log_count FROM workout_log WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    const hasLogs = logCheck[0].log_count > 0;

    // ถ้ามีการบันทึกการออกกำลังกายและไม่ได้บังคับลบ
    if (hasLogs && !force_delete) {
      return {
        success: false,
        error: "has_related_data",
        message:
          "มีการบันทึกผลการออกกำลังกายที่เกี่ยวข้องกับแผนนี้ ยืนยันการลบอีกครั้งหากต้องการลบข้อมูลทั้งหมด",
        has_logs: true,
        log_count: logCheck[0].log_count,
      };
    }

    // เริ่มต้น transaction
    await connection.beginTransaction();

    // 1. ลบข้อมูลการบันทึกการออกกำลังกาย (logs) ที่เกี่ยวข้อง (เฉพาะกรณีบังคับลบ)
    if (force_delete && hasLogs) {
      // ดึงรายการ workout_log_id
      const [logIds] = await connection.query(
        "SELECT workout_log_id FROM workout_log WHERE workout_plan_id = ?",
        [workout_plan_id]
      );

      // ลบข้อมูลการบันทึกท่าออกกำลังกาย
      for (const log of logIds) {
        await connection.query(
          "DELETE FROM exercise_log WHERE workout_log_id = ?",
          [log.workout_log_id]
        );
      }

      // ลบข้อมูลการบันทึกการออกกำลังกาย
      await connection.query(
        "DELETE FROM workout_log WHERE workout_plan_id = ?",
        [workout_plan_id]
      );
    }

    // 2. ลบข้อมูลท่าออกกำลังกายในแต่ละเซสชัน
    // ดึงรายการ session_id
    const [sessionIds] = await connection.query(
      "SELECT session_id FROM workout_session WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    // ลบข้อมูลท่าออกกำลังกาย
    for (const session of sessionIds) {
      await connection.query(
        "DELETE FROM workout_exercise WHERE session_id = ?",
        [session.session_id]
      );
    }

    // 3. ลบข้อมูลเซสชัน
    await connection.query(
      "DELETE FROM workout_session WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    // 4. ลบข้อมูลแผนการออกกำลังกาย
    await connection.query(
      "DELETE FROM workout_plan WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    // Commit transaction
    await connection.commit();

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/members/${memberId}`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        workout_plan_id,
        deleted: true,
        logs_deleted: hasLogs,
      },
      message: "ลบแผนการออกกำลังกายสำเร็จ",
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

    console.error("เกิดข้อผิดพลาดในการลบแผนการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการลบแผนการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  } finally {
    // ส่งคืน connection กลับไปยัง pool ไม่ว่าจะสำเร็จหรือไม่
    connection.release();
  }
}

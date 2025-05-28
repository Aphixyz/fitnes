"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลเซสชัน
const sessionSchema = z.object({
  template_id: z.coerce.number().positive("ต้องระบุรหัสเทมเพลต"),
  session_name: z.string().min(1, "ต้องระบุชื่อเซสชัน"),
  // ลดความเข้มงวดของวันในสัปดาห์ลง ให้รับค่าสตริงใดๆ ได้
  day_of_week: z.string().min(1, "ต้องระบุวันในสัปดาห์"),
  order_index: z.coerce.number().int().nonnegative().default(0),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"), // ใช้สำหรับตรวจสอบสิทธิ์เท่านั้น
});

/**
 * เพิ่มเซสชันลงในเทมเพลตแผนการออกกำลังกาย
 * @param {Object} data - ข้อมูลเซสชัน
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function addSessionToTemplate(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = sessionSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const { template_id, session_name, day_of_week, order_index, trainer_id } =
      validatedData;

    // ตรวจสอบว่าเทมเพลตนี้เป็นของเทรนเนอร์คนนี้จริงๆ
    const [templateCheck] = await pool.query(
      "SELECT trainer_id FROM workout_template WHERE template_id = ?",
      [template_id]
    );

    if (!templateCheck.length || templateCheck[0].trainer_id !== trainer_id) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการแก้ไขเทมเพลตนี้",
      };
    }

    // เพิ่มเซสชันใหม่โดยใช้วันภาษาไทยโดยตรง
    const [result] = await pool.query(
      `INSERT INTO template_session 
       (template_id, session_name, day_of_week, order_index)
       VALUES (?, ?, ?, ?)`,
      [template_id, session_name, day_of_week, order_index]
    );

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/workout-templates/${template_id}`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        session_id: result.insertId,
        template_id,
        session_name,
        day_of_week,
        order_index,
      },
      message: "เพิ่มเซสชันลงในเทมเพลตสำเร็จ",
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

    console.error("เกิดข้อผิดพลาดในการเพิ่มเซสชัน:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการเพิ่มเซสชัน กรุณาลองใหม่อีกครั้ง",
    };
  }
}

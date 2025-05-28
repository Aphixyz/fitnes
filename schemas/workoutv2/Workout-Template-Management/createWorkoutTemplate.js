"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลที่รับเข้ามา
const workoutTemplateSchema = z.object({
  template_name: z.string().min(1, "ต้องระบุชื่อเทมเพลตแผนการออกกำลังกาย"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  description: z.string().optional(),
  difficulty_level: z.string().optional().nullable(),
  is_public: z
    .union([z.boolean(), z.coerce.number().min(0).max(1), z.enum(["0", "1"])])
    .transform((value) => {
      // แปลงเป็น 0 หรือ 1 เสมอ
      if (value === true || value === 1 || value === "1") return 1;
      return 0;
    })
    .default(0),
});

/**
 * สร้างเทมเพลตแผนการออกกำลังกายใหม่
 * @param {Object} data - ข้อมูลของเทมเพลตแผนการออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function createWorkoutTemplate(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = workoutTemplateSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      template_name,
      trainer_id,
      description,
      difficulty_level,
      is_public,
    } = validatedData;

    // สร้างคำสั่ง SQL และป้องกัน SQL Injection ด้วย Prepared Statement
    const [result] = await pool.query(
      `INSERT INTO workout_template 
       (trainer_id, template_name, description, difficulty_level, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [
        trainer_id,
        template_name,
        description || null,
        difficulty_level || null,
        is_public,
      ]
    );

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/workout-templates`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        template_id: result.insertId,
        trainer_id,
        template_name,
        description: description || null,
        difficulty_level: difficulty_level || null,
        is_public,
      },
      message: "สร้างเทมเพลตแผนการออกกำลังกายสำเร็จ",
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

    console.error("เกิดข้อผิดพลาดในการสร้างเทมเพลตแผนการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการสร้างเทมเพลต กรุณาลองใหม่อีกครั้ง",
    };
  }
}

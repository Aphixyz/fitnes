"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับตรวจสอบข้อมูลการอัปเดตแผนออกกำลังกาย
const updatePlanSchema = z.object({
  workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสแผนการออกกำลังกาย"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  plan_name: z.string().min(1, "ต้องระบุชื่อแผนการออกกำลังกาย").optional(),
  plan_startdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD")
    .optional(),
  plan_enddate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD")
    .optional(),
  plan_status: z
    .enum(["active", "completed", "cancelled", "paused"])
    .optional(),
});

/**
 * อัปเดตข้อมูลแผนการออกกำลังกาย
 * @param {Object} data - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function updateWorkoutPlan(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = updatePlanSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const { workout_plan_id, trainer_id, ...updateFields } = validatedData;

    // ตรวจสอบว่าแผนนี้เป็นของเทรนเนอร์คนนี้จริงๆ
    const [planCheck] = await pool.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );

    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการแก้ไขแผนการออกกำลังกายนี้",
      };
    }

    // สร้างคำสั่ง SQL สำหรับอัปเดตเฉพาะข้อมูลที่ต้องการเปลี่ยน
    let updateQuery = "UPDATE workout_plan SET ";
    const updateValues = [];
    let hasUpdate = false;

    // สร้างส่วนของคำสั่ง SET ตามข้อมูลที่ส่งมา
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined) {
        if (hasUpdate) {
          updateQuery += ", ";
        }
        updateQuery += `${key} = ?`;
        updateValues.push(value);
        hasUpdate = true;
      }
    }

    // ถ้าไม่มีข้อมูลที่ต้องอัปเดต
    if (!hasUpdate) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่มีข้อมูลที่ต้องการอัปเดต",
      };
    }

    // เพิ่มเงื่อนไขในการอัปเดต
    updateQuery += " WHERE workout_plan_id = ? AND trainer_id = ?";
    updateValues.push(workout_plan_id, trainer_id);

    // ทำการอัปเดตข้อมูล
    const [result] = await pool.query(updateQuery, updateValues);

    // ถ้าไม่มีการแก้ไขข้อมูลจริงๆ
    if (result.affectedRows === 0) {
      return {
        success: false,
        error: "not_modified",
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
      };
    }

    // Revalidate เพื่อให้ข้อมูลอัพเดทในหน้าที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainer_id}/members/${planCheck[0].member_id}`);

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        workout_plan_id,
        ...updateFields,
      },
      message: "อัปเดตแผนการออกกำลังกายสำเร็จ",
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

    console.error("เกิดข้อผิดพลาดในการอัปเดตแผนการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message:
        "เกิดข้อผิดพลาดในการอัปเดตแผนการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  }
}

"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema สำหรับ Validate ข้อมูลการอัปเดต Workout Plan
const updatePlanSchema = z.object({
  workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสโปรแกรม"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  plan_name: z.string().min(1, "ต้องระบุชื่อโปรแกรม").optional(),
  plan_duration: z.coerce
    .number()
    .nonnegative("ระยะเวลาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป")
    .optional(),
  plan_startdate: z.string().min(1, "ต้องระบุวันเริ่มต้น").optional(),
  plan_enddate: z.string().optional().nullable(),
  plan_note: z.string().optional().nullable(),
  plan_status: z
    .enum(["active", "inactive", "completed", "archived"])
    .optional(),
});

export async function updateWorkoutPlan(data) {
  const connection = await pool.getConnection();

  try {
    const validatedData = updatePlanSchema.parse(data);
    const { workout_plan_id, trainer_id, ...updateFields } = validatedData;

    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่มีข้อมูลที่จะอัปเดต",
      };
    }

    // เช็คสิทธิ์ว่า trainer เป็นเจ้าของ workout plan
    const [planCheck] = await connection.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );

    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์แก้ไขโปรแกรมนี้",
      };
    }

    const member_id = planCheck[0].member_id;

    // ดึงข้อมูลแผนเดิมเพื่อใช้ในการคำนวณ
    const [existingPlan] = await connection.query(
      "SELECT plan_startdate, plan_duration FROM workout_plan WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    const plan_startdate =
      updateFields.plan_startdate || existingPlan[0].plan_startdate;
    const plan_duration =
      updateFields.plan_duration !== undefined
        ? updateFields.plan_duration
        : existingPlan[0].plan_duration;

    // คำนวณวันสิ้นสุดใหม่ถ้าจำเป็น
    if (
      (updateFields.plan_startdate ||
        updateFields.plan_duration !== undefined) &&
      !updateFields.plan_enddate
    ) {
      // ถ้ามีการเปลี่ยนวันเริ่มหรือระยะเวลา แต่ไม่ได้กำหนดวันสิ้นสุดใหม่โดยตรง
      if (plan_duration > 0) {
        const startDate = new Date(plan_startdate);
        startDate.setDate(startDate.getDate() + plan_duration * 7);
        updateFields.plan_enddate = startDate.toISOString().split("T")[0];
      } else {
        // กรณีไม่กำหนดระยะเวลา
        updateFields.plan_enddate = null;
      }
    }

    // สร้าง query สำหรับอัปเดต
    let querySet = [];
    let queryParams = [];

    for (const [key, value] of Object.entries(updateFields)) {
      querySet.push(`${key} = ?`);
      queryParams.push(value);
    }

    queryParams.push(workout_plan_id); // สำหรับ WHERE

    // อัปเดตข้อมูล
    await connection.query(
      `UPDATE workout_plan SET ${querySet.join(
        ", "
      )} WHERE workout_plan_id = ?`,
      queryParams
    );

    // Revalidate path
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}/workout-plan`);
    revalidatePath(
      `/trainer/${trainer_id}/members/${member_id}/workout-plan/${workout_plan_id}`
    );

    return {
      success: true,
      message: "อัปเดตโปรแกรมสำเร็จ",
      data: {
        workout_plan_id,
        ...updateFields,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      };
    }

    console.error("เกิดข้อผิดพลาด:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการอัปเดตโปรแกรม กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }
}

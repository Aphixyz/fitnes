"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema Validation
const updatePlanSchema = z.object({
  workout_plan_id: z.coerce.number().positive(),
  trainer_id: z.coerce.number().positive(),
  plan_name: z.string().min(1).optional(),
  plan_startdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  plan_enddate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  plan_status: z
    .enum(["active", "completed", "cancelled", "paused"])
    .optional(),
});

export async function updateWorkoutPlan(data) {
  try {
    const validatedData = updatePlanSchema.parse(data);
    const { workout_plan_id, trainer_id, ...updateFields } = validatedData;

    const [planCheck] = await pool.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );

    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ในการแก้ไข",
      };
    }

    // Build dynamic update
    const updateFieldsArray = Object.entries(updateFields).filter(
      ([, v]) => v !== undefined
    );
    if (!updateFieldsArray.length) {
      return {
        success: false,
        error: "validation_error",
        message: "ไม่มีข้อมูลที่ต้องการอัปเดต",
      };
    }

    const updateQuery = `
      UPDATE workout_plan
      SET ${updateFieldsArray
        .map(([k]) => `${k} = ?`)
        .join(", ")}, updated_at = NOW()
      WHERE workout_plan_id = ? AND trainer_id = ?
    `;
    const updateValues = [
      ...updateFieldsArray.map(([, v]) => v),
      workout_plan_id,
      trainer_id,
    ];

    const [result] = await pool.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return {
        success: false,
        error: "not_modified",
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
      };
    }

    revalidatePath(`/trainer/${trainer_id}/members/${planCheck[0].member_id}`);
    revalidatePath(`/trainer/${trainer_id}/workout-plans`);

    return {
      success: true,
      data: { workout_plan_id, ...updateFields },
      message: "อัปเดตแผนสำเร็จ",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง",
      };
    }
    console.error("Error:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการอัปเดต",
    };
  }
}

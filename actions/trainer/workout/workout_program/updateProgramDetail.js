"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema เฉพาะสำหรับตรวจสอบข้อมูลรายละเอียดโปรแกรม
const programDetailSchema = z.object({
  program_id: z.number().int().positive(),
  workout_plan_id: z.number().int().positive(),
  trainerId: z.string().or(z.number()),
  memberId: z.string().or(z.number()),
  program_name: z.string().min(1, "ต้องระบุชื่อโปรแกรม"),
  program_note: z.string().nullable().optional(),
});

export async function updateProgramDetail(payload) {
  try {
    // ตรวจสอบข้อมูลที่ส่งมา
    const validatedData = programDetailSchema.parse(payload);
    const {
      program_id,
      workout_plan_id,
      trainerId,
      memberId,
      program_name,
      program_note,
    } = validatedData;

    // อัพเดตข้อมูลโปรแกรมเฉพาะส่วน detail
    const [result] = await db.query(
      `UPDATE workout_program 
       SET program_name = ?, program_note = ? 
       WHERE workout_program_id = ?`,
      [program_name, program_note || null, program_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("ไม่พบโปรแกรมที่ต้องการอัพเดต");
    }

    // Revalidate paths
    revalidatePath(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${workout_plan_id}`
    );

    return {
      success: true,
      message: "บันทึกรายละเอียดโปรแกรมสำเร็จ",
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกรายละเอียดโปรแกรม:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      };
    }

    return {
      success: false,
      error: "database_error",
      message: `เกิดข้อผิดพลาดในการบันทึกรายละเอียดโปรแกรม: ${
        error.sqlMessage || error.message
      }`,
    };
  }
}

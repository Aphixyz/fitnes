"use server";

import { z } from "zod";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Schema Validation
const deletePlanSchema = z.object({
  workout_plan_id: z.coerce.number().positive(),
  trainer_id: z.coerce.number().positive(),
  force_delete: z.boolean().default(false),
});

export async function deleteWorkoutPlan(data) {
  const connection = await pool.getConnection();
  try {
    const { workout_plan_id, trainer_id, force_delete } =
      deletePlanSchema.parse(data);

    const [planCheck] = await connection.query(
      "SELECT member_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?",
      [workout_plan_id, trainer_id]
    );
    if (!planCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์ลบแผนนี้",
      };
    }
    const memberId = planCheck[0].member_id;

    const [logCheck] = await connection.query(
      "SELECT COUNT(*) AS log_count FROM workout_log WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    if (logCheck[0].log_count > 0 && !force_delete) {
      return {
        success: false,
        error: "has_related_data",
        message: "มีข้อมูลการออกกำลังกาย กรุณายืนยันการลบ",
        has_logs: true,
        log_count: logCheck[0].log_count,
      };
    }

    await connection.beginTransaction();

    if (force_delete && logCheck[0].log_count > 0) {
      const [logIds] = await connection.query(
        "SELECT workout_log_id FROM workout_log WHERE workout_plan_id = ?",
        [workout_plan_id]
      );

      if (logIds.length > 0) {
        for (const log of logIds) {
          await connection.query(
            "DELETE FROM exercise_log WHERE workout_log_id = ?",
            [log.workout_log_id]
          );
        }
      }
      await connection.query(
        "DELETE FROM workout_log WHERE workout_plan_id = ?",
        [workout_plan_id]
      );
    }

    const [sessionIds] = await connection.query(
      "SELECT session_id FROM workout_session WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    if (sessionIds.length > 0) {
      for (const session of sessionIds) {
        await connection.query(
          "DELETE FROM workout_exercise WHERE session_id = ?",
          [session.session_id]
        );
      }
    }

    await connection.query(
      "DELETE FROM workout_session WHERE workout_plan_id = ?",
      [workout_plan_id]
    );
    await connection.query(
      "DELETE FROM workout_plan WHERE workout_plan_id = ?",
      [workout_plan_id]
    );

    await connection.commit();

    revalidatePath(`/trainer/${trainer_id}/members/${memberId}`);
    revalidatePath(`/trainer/${trainer_id}/workout-plans`);

    return {
      success: true,
      data: { workout_plan_id, deleted: true },
      message: "ลบแผนสำเร็จ",
    };
  } catch (error) {
    await connection.rollback();
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
      message: "เกิดข้อผิดพลาดในการลบ",
    };
  } finally {
    connection.release();
  }
}

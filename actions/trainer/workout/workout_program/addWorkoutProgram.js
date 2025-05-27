"use server";

import pool from "@/lib/db";
import { z } from "zod";

// Schema สำหรับ Validate input
const schema = z.object({
  workout_plan_id: z.coerce.number().positive("ต้องระบุรหัสแผน"),
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
});

export async function addWorkoutProgram({ workout_plan_id, trainer_id }) {
  const validated = schema.parse({ workout_plan_id, trainer_id });
  const conn = await pool.getConnection();
  try {
    // หาลำดับใหม่
    const [[{ max_order }]] = await conn.query(
      "SELECT COALESCE(MAX(order_index),-1) as max_order FROM workout_program WHERE workout_plan_id = ?",
      [validated.workout_plan_id]
    );
    const order_index = max_order + 1;

    // สร้างโปรแกรมย่อยใหม่
    const [res] = await conn.query(
      `INSERT INTO workout_program
         (workout_plan_id, program_name, program_note, order_index)
       VALUES (?, 'โปรแกรมใหม่', '', ?)`,
      [validated.workout_plan_id, order_index]
    );
    const newId = res.insertId;

    return { success: true, data: { workout_program_id: newId } };
  } finally {
    conn.release();
  }
}

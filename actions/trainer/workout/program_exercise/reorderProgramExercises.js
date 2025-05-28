"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workout_program_id: z.coerce.number().positive(),
  newOrder: z.array(z.coerce.number().positive()), // id ตามลำดับใหม่
});

export async function reorderProgramExercises(input) {
  const { workout_program_id, newOrder } = schema.parse(input);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    for (let i = 0; i < newOrder.length; i++) {
      await conn.query(
        `UPDATE program_exercise SET order_index = ? WHERE program_exercise_id = ?`,
        [i, newOrder[i]]
      );
    }
    await conn.commit();

    /* plan_id เพื่อ revalidate */
    const [[plan]] = await db.query(
      `SELECT workout_plan_id FROM workout_program WHERE workout_program_id = ?`,
      [workout_program_id]
    );
    revalidatePath(`/workout-plans/${plan.workout_plan_id}`);
    return { success: true };
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return { success: false };
  } finally {
    conn.release();
  }
}

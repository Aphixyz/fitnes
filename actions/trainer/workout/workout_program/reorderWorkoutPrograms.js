"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workout_plan_id: z.coerce.number().positive(),
  newOrder: z.array(z.coerce.number().positive()), // array of workout_program_id ตามลำดับใหม่
});

export async function reorderWorkoutPrograms(input) {
  const { workout_plan_id, newOrder } = schema.parse(input);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    for (let i = 0; i < newOrder.length; i++) {
      await conn.query(
        `UPDATE workout_program SET order_index = ? WHERE workout_program_id = ?`,
        [i, newOrder[i]]
      );
    }
    await conn.commit();
    revalidatePath(`/workout-plans/${workout_plan_id}`);
    return { success: true };
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return { success: false };
  } finally {
    conn.release();
  }
}

"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workout_program_id: z.coerce.number().positive(),
});

export async function deleteWorkoutProgram({ workout_program_id }) {
  const { workout_program_id: id } = schema.parse({ workout_program_id });

  /* หา plan_id เพื่อ revalidate */
  const [[found]] = await db.query(
    `SELECT workout_plan_id FROM workout_program WHERE workout_program_id = ?`,
    [id]
  );
  if (!found) return { deleted: false };

  const [res] = await db.query(
    `DELETE FROM workout_program WHERE workout_program_id = ?`,
    [id]
  );

  if (res.affectedRows)
    revalidatePath(`/workout-plans/${found.workout_plan_id}`);
  return { deleted: !!res.affectedRows };
}

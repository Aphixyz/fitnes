"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z
  .object({
    workout_program_id: z.coerce.number().positive(),
    program_name: z.string().min(1).optional(),
    program_note: z.string().optional(),
  })
  .refine((d) => Object.keys(d).length > 1, { message: "no fields" });

export async function updateWorkoutProgram(payload) {
  const { workout_program_id, ...fields } = schema.parse(payload);

  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  vals.push(workout_program_id);

  const [res] = await db.query(
    `UPDATE workout_program SET ${sets.join(
      ", "
    )} WHERE workout_program_id = ?`,
    vals
  );

  if (res.affectedRows) {
    /* รู้ plan_id เพื่อ revalidate */
    const [[p]] = await db.query(
      `SELECT workout_plan_id FROM workout_program WHERE workout_program_id = ?`,
      [workout_program_id]
    );
    revalidatePath(`/workout-plans/${p.workout_plan_id}`);
  }

  return { updated: res.affectedRows };
}

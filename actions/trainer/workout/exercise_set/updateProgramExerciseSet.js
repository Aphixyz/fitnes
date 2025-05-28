"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z
  .object({
    program_exercise_set_id: z.coerce.number().positive(),
    weight: z.coerce.number().nullable().optional(),
    reps: z.coerce.number().int().nullable().optional(),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/)
      .nullable()
      .optional(),
    distance: z.coerce.number().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 1, { message: "no fields" });

export async function updateProgramExerciseSet(payload) {
  const { program_exercise_set_id, ...fields } = schema.parse(payload);

  const sets = [],
    vals = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  vals.push(program_exercise_set_id);

  const [res] = await db.query(
    `UPDATE program_exercise_set SET ${sets.join(", ")}
      WHERE program_exercise_set_id = ?`,
    vals
  );

  if (res.affectedRows) {
    const [[info]] = await db.query(
      `SELECT wp.workout_plan_id
         FROM program_exercise_set ps
         JOIN program_exercise pe  ON ps.program_exercise_id = pe.program_exercise_id
         JOIN workout_program wp2  ON pe.workout_program_id = wp2.workout_program_id
         JOIN workout_plan    wp   ON wp.workout_plan_id = wp2.workout_plan_id
        WHERE ps.program_exercise_set_id = ?`,
      [program_exercise_set_id]
    );
    revalidatePath(`/workout-plans/${info.workout_plan_id}`);
  }
  return { updated: res.affectedRows };
}

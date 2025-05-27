"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  program_exercise_id: z.coerce.number().positive(),
  set_order: z.coerce.number().int().nonnegative(),
  weight: z.coerce.number().nullable().optional(),
  reps: z.coerce.number().int().nullable().optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  distance: z.coerce.number().nullable().optional(),
});

export async function addProgramExerciseSet(dataRaw) {
  const d = schema.parse(dataRaw);

  const [res] = await db.query(
    `INSERT INTO program_exercise_set
      (program_exercise_id,set_order,weight,reps,time,distance)
     VALUES (?,?,?,?,?,?)`,
    [
      d.program_exercise_id,
      d.set_order,
      d.weight ?? null,
      d.reps ?? null,
      d.time ?? null,
      d.distance ?? null,
    ]
  );

  /* หา plan_id เพื่อ revalidate */
  const [[info]] = await db.query(
    `SELECT wp.workout_plan_id
       FROM program_exercise pe
       JOIN workout_program wp2 ON pe.workout_program_id = wp2.workout_program_id
       JOIN workout_plan wp ON wp.workout_plan_id = wp2.workout_plan_id
      WHERE pe.program_exercise_id = ?`,
    [d.program_exercise_id]
  );
  revalidatePath(`/workout-plans/${info.workout_plan_id}`);

  return { success: true, program_exercise_set_id: res.insertId };
}

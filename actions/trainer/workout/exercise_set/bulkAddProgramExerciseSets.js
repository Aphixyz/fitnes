"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const row = z.object({
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

const schema = z.object({
  program_exercise_id: z.coerce.number().positive(),
  sets: z.array(row).min(1),
});

export async function bulkAddProgramExerciseSets(inputRaw) {
  const { program_exercise_id, sets } = schema.parse(inputRaw);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    for (const s of sets) {
      await conn.query(
        `INSERT INTO program_exercise_set
          (program_exercise_id,set_order,weight,reps,time,distance)
         VALUES (?,?,?,?,?,?)`,
        [
          program_exercise_id,
          s.set_order,
          s.weight ?? null,
          s.reps ?? null,
          s.time ?? null,
          s.distance ?? null,
        ]
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  /* revalidate */
  const [[info]] = await db.query(
    `SELECT wp.workout_plan_id
       FROM program_exercise pe
       JOIN workout_program wp2 ON pe.workout_program_id = wp2.workout_program_id
       JOIN workout_plan wp ON wp.workout_plan_id = wp2.workout_plan_id
      WHERE pe.program_exercise_id = ?`,
    [program_exercise_id]
  );
  revalidatePath(`/workout-plans/${info.workout_plan_id}`);
  return { success: true };
}

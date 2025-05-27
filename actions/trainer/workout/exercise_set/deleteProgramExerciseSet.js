"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  program_exercise_set_id: z.coerce.number().positive(),
});

export async function deleteProgramExerciseSet({ program_exercise_set_id }) {
  const { program_exercise_set_id: id } = schema.parse({
    program_exercise_set_id,
  });

  const [[info]] = await db.query(
    `SELECT wp.workout_plan_id
       FROM program_exercise_set ps
       JOIN program_exercise pe  ON ps.program_exercise_id = pe.program_exercise_id
       JOIN workout_program wp2  ON pe.workout_program_id = wp2.workout_program_id
       JOIN workout_plan    wp   ON wp.workout_plan_id = wp2.workout_plan_id
      WHERE ps.program_exercise_set_id = ?`,
    [id]
  );
  if (!info) return { deleted: false };

  const [res] = await db.query(
    `DELETE FROM program_exercise_set WHERE program_exercise_set_id = ?`,
    [id]
  );
  if (res.affectedRows)
    revalidatePath(`/workout-plans/${info.workout_plan_id}`);
  return { deleted: !!res.affectedRows };
}

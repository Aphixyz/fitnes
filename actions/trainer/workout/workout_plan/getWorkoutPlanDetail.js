"use server";

import db from "@/lib/db";
import { z } from "zod";

const idSchema = z.object({ plan_id: z.coerce.number().positive() });

export async function getWorkoutPlanDetail({ plan_id }) {
  const { plan_id: id } = idSchema.parse({ plan_id });

  const [[plan]] = await db.query(
    `SELECT * FROM workout_plan WHERE workout_plan_id = ?`,
    [id]
  );
  if (!plan) return null;

  const [programs] = await db.query(
    `SELECT * FROM workout_program
      WHERE workout_plan_id = ?
      ORDER BY order_index`,
    [id]
  );

  for (const p of programs) {
    const [exs] = await db.query(
      `SELECT * FROM program_exercise
        WHERE workout_program_id = ?
        ORDER BY order_index`,
      [p.workout_program_id]
    );

    for (const ex of exs) {
      const [sets] = await db.query(
        `SELECT * FROM program_exercise_set
          WHERE program_exercise_id = ?
          ORDER BY set_order`,
        [ex.program_exercise_id]
      );
      ex.sets = sets;
    }
    p.exercises = exs;
  }

  plan.programs = programs;
  return plan;
}

"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  trainer_id: z.coerce.number().positive(),
  member_id: z.coerce.number().positive(),
  plan_name: z.string().min(1),
  plan_duration: z.coerce.number().int().positive(),
  plan_startdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plan_enddate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function createWorkoutPlan(dataRaw) {
  const data = schema.parse(dataRaw);
  const conn = await db.getConnection();

  try {
    const [res] = await conn.query(
      `INSERT INTO workout_plan
        (trainer_id,member_id,plan_name,plan_duration,plan_startdate,plan_enddate)
       VALUES (?,?,?,?,?,?)`,
      [
        data.trainer_id,
        data.member_id,
        data.plan_name,
        data.plan_duration,
        data.plan_startdate,
        data.plan_enddate,
      ]
    );

    revalidatePath(`/trainer/${data.trainer_id}/workout-plans`);
    return { success: true, workout_plan_id: res.insertId };
  } catch (err) {
    console.error(err);
    return { success: false, error: "database_error" };
  } finally {
    conn.release();
  }
}

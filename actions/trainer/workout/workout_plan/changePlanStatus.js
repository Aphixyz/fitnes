"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  plan_id: z.coerce.number().positive(),
  status: z.enum(["active", "completed"]),
});

export async function changePlanStatus(input) {
  const { plan_id, status } = schema.parse(input);
  const [res] = await db.query(
    `UPDATE workout_plan SET plan_status = ? WHERE workout_plan_id = ?`,
    [status, plan_id]
  );
  if (res.affectedRows) revalidatePath(`/workout-plans/${plan_id}`);
  return { updated: res.affectedRows };
}

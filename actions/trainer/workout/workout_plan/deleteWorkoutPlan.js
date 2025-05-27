"use server";

import db from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({ plan_id: z.coerce.number().positive() });

export async function deleteWorkoutPlan({ plan_id }) {
  const { plan_id: id } = schema.parse({ plan_id });
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      `DELETE FROM workout_plan WHERE workout_plan_id = ?`,
      [id]
    );
    await conn.commit();
    if (res.affectedRows) revalidatePath("/trainer");
    return { deleted: !!res.affectedRows };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { deleted: false };
  } finally {
    conn.release();
  }
}

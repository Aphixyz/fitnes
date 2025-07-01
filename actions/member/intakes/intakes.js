"use server";

import pool from "@/lib/db";

export async function getMemberIntake(
  memberId,
  date = new Date().toISOString().slice(0, 10)
) {
  const [[intake]] = await pool.query(
    `SELECT
         COALESCE(SUM(calories),0) AS calories,
         COALESCE(SUM(protein),0)  AS protein,
         COALESCE(SUM(carb),0)     AS carb,
         COALESCE(SUM(fat),0)      AS fat
       FROM intake_logs
       WHERE member_id = ? AND date = ?`,
    [memberId, date]
  );
  return intake; // { calories, protein, carb, fat }
}
 
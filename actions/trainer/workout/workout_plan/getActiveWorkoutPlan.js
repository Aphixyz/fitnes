"use server";

import db from "@/lib/db";

export async function getActiveWorkoutPlan(memberId) {
  if (!memberId) {
    throw new Error("กรุณาระบุรหัสสมาชิก");
  }

  const [result] = await db.query(
    `SELECT * FROM workout_plan 
     WHERE member_id = ? AND plan_status = 'active' 
     ORDER BY plan_startdate DESC 
     LIMIT 1`,
    [memberId]
  );

  if (!result || result.length === 0) {
    console.error("No active workout plan found for member:", memberId);
    return null;
  }

  return result[0];
}
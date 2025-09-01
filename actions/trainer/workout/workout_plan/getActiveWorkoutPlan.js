"use server";

import db from "@/lib/db";

export async function getActiveWorkoutPlan(memberId) {
  if (!memberId) {
    throw new Error("กรุณาระบุรหัสสมาชิก");
  }

  const [result] = await db.query(
    `SELECT 
       wp.*,
       COUNT(wpr.workout_program_id) as program_count
     FROM workout_plan wp
     LEFT JOIN workout_program wpr ON wp.workout_plan_id = wpr.workout_plan_id
     WHERE wp.member_id = ? AND wp.plan_status = 'active' 
     GROUP BY wp.workout_plan_id
     ORDER BY wp.plan_startdate DESC 
     LIMIT 1`,
    [memberId]
  );

  if (!result || result.length === 0) {
    console.error("No active workout plan found for member:", memberId);
    return null;
  }

  return result[0];
}
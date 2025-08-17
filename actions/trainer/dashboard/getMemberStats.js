"use server";

import db from "@/lib/db";

/**
 * Get member statistics including health metrics and workout data
 * @param {number} memberId - Member ID
 * @returns {Object} Member stats data
 */
export async function getMemberStats(memberId) {
  if (!memberId) {
    throw new Error("กรุณาระบุรหัสสมาชิก");
  }

  try {
    // Get latest health metrics (weight and body fat)
    const [healthResult] = await db.query(
      `SELECT 
         member_health_weight as weight,
         member_health_bodyfat as body_fat
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    // Get workout statistics (total volume and total reps)
    const [workoutResult] = await db.query(
      `SELECT 
         SUM(CASE 
           WHEN els.weight IS NOT NULL AND els.reps IS NOT NULL 
           THEN els.weight * els.reps 
           ELSE 0 
         END) as total_volume,
         SUM(CASE 
           WHEN els.reps IS NOT NULL 
           THEN els.reps 
           ELSE 0 
         END) as total_reps
       FROM exercise_log_set els
       INNER JOIN exercise_log el ON els.exercise_log_id = el.exercise_log_id
       WHERE el.member_id = ?`,
      [memberId]
    );

    const healthData = healthResult?.[0] || null;
    const workoutData = workoutResult?.[0] || { total_volume: 0, total_reps: 0 };

    return {
      success: true,
      data: {
        // Health metrics
        weight: healthData?.weight || null,
        bodyFat: healthData?.body_fat || null,
        
        // Workout statistics
        totalVolume: parseFloat(workoutData.total_volume) || 0,
        totalReps: parseInt(workoutData.total_reps) || 0,
        
        // Meta information
        hasHealthData: !!healthData,
        hasWorkoutData: workoutData.total_reps > 0
      }
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ",
      data: null
    };
  }
}
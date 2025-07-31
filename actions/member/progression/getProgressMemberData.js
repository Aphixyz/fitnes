"use server";

import pool from "@/lib/db.js";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription.js";

/**
 * ตรวจสอบสิทธิ์การเข้าถึงข้อมูลตาม subscription
 * @param {number} memberId - ไอดีสมาชิก
 * @returns {Promise<Object>} ข้อมูล subscription และสิทธิ์
 */
async function checkSubscription(memberId) {
  // ใช้ isActiveSubscription function แทนการเขียน query เอง
  const result = await isActiveSubscription(memberId);

  return {
    subscription: result.data?.registration || null,
    hasAccess: result.isActive,
    message: result.message,
  };
}

/**
 * รวบรวมข้อมูลพัฒนาการครบทุกด้านสำหรับ Progress Dashboard
 * @param {number} memberId - ไอดีสมาชิก
 * @param {number|null} logId - ไอดีของ workout log (optional)
 * @returns {Promise<Object>} ข้อมูลพัฒนาการครบทุกด้าน
 */
export async function getProgressMemberData(memberId, logId = null) {
  try {
    // Validate inputs
    if (!memberId) {
      throw new Error("Missing required parameter: memberId");
    }

    // ตรวจสอบสิทธิ์ subscription ก่อน
    const { subscription, hasAccess, message } = await checkSubscription(
      memberId
    );

    // Derive date range from active subscription
    const fromDate = subscription?.registration_startdate;
    const toDate = subscription?.registration_enddate;

    if (!hasAccess) {
      return {
        error: "Subscription required",
        message: message,
        subscription: subscription,
        data: null,
      };
    }

    // รวบรวมข้อมูลทั้งหมดแบบ parallel
    const [
      fitnessGoal,
      weightTrend,
      nutritionTrend,
      workoutCalendar,
      exerciseSummary,
      photos,
      workoutSummary,
      workoutLogCount,
      workoutLogDetail,
      // weightHistory,
      intakeOverview,
    ] = await Promise.all([
      getFitnessGoalData(memberId),
      getWeightTrendData(memberId, fromDate, toDate),
      getNutritionTrendData(memberId, fromDate, toDate),
      getWorkoutCalendarData(memberId, fromDate, toDate),
      getExerciseSummaryData(memberId, fromDate, toDate),
      getProgressPhotosData(memberId),
      getWorkoutSummary(memberId, fromDate, toDate),
      getWorkoutLogCount(memberId, fromDate, toDate),
      getWorkoutLogDetail(memberId, logId),
      // getWeightHistory(memberId, 30),
      getIntakeOverview(memberId, fromDate, toDate),
    ]);

    // Log data for debugging purposes
    // console.log("Progress Member Data:", {
    //   workoutLogDetail,
    // });

    return {
      success: true,
      subscription,
      data: {
        fitnessGoal,
        weightTrend,
        nutritionTrend,
        workoutCalendar,
        exerciseSummary,
        photos,
        workoutSummary,
        workoutLogCount,
        workoutLogDetail,
        // weightHistory,
        intakeOverview,
      },
    };
  } catch (error) {
    console.error("Error in getProgressMemberData:", error);
    throw new Error(`Failed to fetch progress data: ${error.message}`);
  }
}

/**
 * 1. ข้อมูล Fitness Goal ล่าสุด
 */
async function getFitnessGoalData(memberId) {
  const query = `
    SELECT 
      fitness_goal_id,
      fitness_goal_type as goalType,
      fitness_goal_targetweight as targetWeight,
      fitness_training_frequency as frequency,
      fitness_experience_level as experienceLevel,
      fitness_desired_time as desiredTime,
      fitness_goal_startdate as startDate,
      fitness_goal_enddate as endDate,
      fitness_goal_status as status,
      create_at
    FROM fitness_goal
    WHERE member_id = ?
    ORDER BY create_at DESC
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [memberId]);
  return rows[0] || null;
}

/**
 * 2. ข้อมูล Weight Trend & Metrics (Historical)
 */
async function getWeightTrendData(memberId, fromDate, toDate) {
  const query = `
    SELECT 
      member_health_id,
      member_health_measurementdate as date,
      member_health_weight as weight,
      member_health_bodyfat as bodyfat,
      member_health_chest as chest,
      member_health_waist as waist,
      member_health_hip as hip,
      member_health_arm as arm,
      member_health_thigh as thigh,
      photo_front,
      photo_side,
      photo_back
    FROM member_health
    WHERE member_id = ? 
      AND member_health_measurementdate BETWEEN ? AND ?
    ORDER BY member_health_measurementdate ASC
  `;

  const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
  return rows;
}

/**
 * 3. ข้อมูล Nutrition Trend รายสัปดาห์ (Aggregate)
 */
async function getNutritionTrendData(memberId, fromDate, toDate) {
  const query = `
    SELECT 
      YEARWEEK(date, 1) as week,
      COUNT(DISTINCT date) as daysLogged,
      SUM(calories) as caloriesSum,
      SUM(protein) as proteinSum,
      SUM(carb) as carbSum,
      SUM(fat) as fatSum,
      AVG(calories) as caloriesAvg,
      AVG(protein) as proteinAvg,
      AVG(carb) as carbAvg,
      AVG(fat) as fatAvg,
      MIN(date) as weekStart,
      MAX(date) as weekEnd
    FROM intake_logs
    WHERE member_id = ? 
      AND date BETWEEN ? AND ?
    GROUP BY YEARWEEK(date, 1)
    ORDER BY week ASC
  `;

  const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
  return rows;
}

/**
 * 4. ข้อมูล Workout Calendar - วันที่มีการออกกำลังกาย
 */
async function getWorkoutCalendarData(memberId, fromDate, toDate) {
  const query = `
    SELECT DISTINCT 
      log_date as date,
      COUNT(*) as workoutCount
    FROM exercise_log
    WHERE member_id = ? 
      AND log_date BETWEEN ? AND ?
    GROUP BY log_date
    ORDER BY log_date ASC
  `;

  const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
  return rows;
}

/**
 * 5. ข้อมูล Exercise Summary รายสัปดาห์ (Aggregate)
 */
async function getExerciseSummaryData(memberId, fromDate, toDate) {
  const query = `
    SELECT 
      YEARWEEK(el.log_date, 1) as week,
      COUNT(DISTINCT el.log_date) as workoutDays,
      COUNT(DISTINCT el.exercise_log_id) as totalWorkouts,
      SUM(COALESCE(els.weight * els.reps, 0)) as totalVolume,
      SUM(COALESCE(els.reps, 0)) as totalReps,
      SUM(COALESCE(els.time, 0)) as totalDuration,
      AVG(COALESCE(els.weight * els.reps, 0)) as avgVolume,
      AVG(COALESCE(els.reps, 0)) as avgReps,
      AVG(COALESCE(els.time, 0)) as avgDuration,
      MIN(el.log_date) as weekStart,
      MAX(el.log_date) as weekEnd
    FROM exercise_log el
    LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
    WHERE el.member_id = ? 
      AND el.log_date BETWEEN ? AND ?
    GROUP BY YEARWEEK(el.log_date, 1)
    ORDER BY week ASC
  `;

  const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
  return rows;
}

/**
 * 6. ข้อมูล Progress Photos ล่าสุด
 */
async function getProgressPhotosData(memberId) {
  const query = `
    SELECT 
      member_health_id,
      member_health_measurementdate as date,
      photo_front as latestFrontPhoto,
      photo_side as latestSidePhoto,
      photo_back as latestBackPhoto
    FROM member_health
    WHERE member_id = ? 
      AND (photo_front IS NOT NULL OR photo_side IS NOT NULL OR photo_back IS NOT NULL)
    ORDER BY member_health_measurementdate DESC
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [memberId]);
  return (
    rows[0] || {
      latestFrontPhoto: null,
      latestSidePhoto: null,
      latestBackPhoto: null,
    }
  );
}

/**
 ข้อมูล Workout Log Count (Aggregate)
 */
async function getWorkoutLogCount(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscription(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view workout statistics");
    }

    const query = `
      SELECT 
        COUNT(*) as totalWorkouts,
        COUNT(DISTINCT workout_program_id) as workout_program_id
      FROM exercise_log
      WHERE member_id = ? 
        AND log_date BETWEEN ? AND ?
    `;

    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error in getWorkoutLogCount:", error);
    throw new Error(`Failed to fetch workout count: ${error.message}`);
  }
}

async function getWorkoutSummary(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscription(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view workout summary");
    }

    const query = `
    SELECT
      el.exercise_log_id,
      el.log_date,
      wpr.program_name         AS ProgramName,
      COUNT(DISTINCT pes.program_exercise_id)  
                            AS totalExercises,
      SUM(COALESCE(els.weight,0) * COALESCE(els.reps,0))
                            AS totalVolume,
      SUM(COALESCE(els.distance,0)) 
                            AS totalDistance,
      SUM(COALESCE(els.time,'00:00:00'))
                            AS totalTimeSeconds
    FROM exercise_log el
    JOIN workout_plan wp 
      ON el.workout_plan_id    = wp.workout_plan_id
    JOIN workout_program wpr 
      ON el.workout_program_id = wpr.workout_program_id
    JOIN program_exercise pe 
      ON wpr.workout_program_id = pe.workout_program_id
    JOIN program_exercise_set pes 
      ON pe.program_exercise_id = pes.program_exercise_id
    LEFT JOIN exercise_log_set els 
      ON el.exercise_log_id          = els.exercise_log_id
     AND pes.program_exercise_set_id = els.program_exercise_set_id
    WHERE el.member_id = ?
      AND el.log_date BETWEEN ? AND ?
    GROUP BY el.exercise_log_id, el.log_date, wp.plan_name
    ORDER BY el.log_date DESC
  `;
    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
    return rows;
  } catch (error) {
    console.error("Error in getWorkoutSummary:", error);
    throw new Error(`Failed to fetch workout summary: ${error.message}`);
  }
}

/**
 ข้อมูล Workout Log Detail สำหรับวันเฉพาะ
 */
async function getWorkoutLogDetail(memberId, logId) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscription(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view workout details");
    }

    // ถ้าไม่มี logId ให้ return array เปล่า
    if (!logId || logId === null || logId === undefined) {
      return [];
    }

    const query = `
      SELECT
        el.exercise_log_id,
        el.log_date,
        wpr.program_name       AS programName,
        pe.exercise_id AS exerciseName,
        pes.set_order,
        pes.weight         AS planned_weight,
        pes.reps           AS planned_reps,
        pes.time           AS planned_time,
        pes.distance       AS planned_distance,
        els.weight         AS actual_weight,
        els.reps           AS actual_reps,
        els.time           AS actual_time,
        els.distance       AS actual_distance
      FROM exercise_log el
      JOIN workout_plan wp 
        ON el.workout_plan_id    = wp.workout_plan_id
      JOIN workout_program wpr 
        ON el.workout_program_id = wpr.workout_program_id
      JOIN program_exercise pe 
        ON wpr.workout_program_id = pe.workout_program_id
      JOIN program_exercise_set pes 
        ON pe.program_exercise_id = pes.program_exercise_id
      LEFT JOIN exercise_log_set els 
        ON el.exercise_log_id          = els.exercise_log_id
      AND pes.program_exercise_set_id = els.program_exercise_set_id
      WHERE el.member_id = ?
        AND el.exercise_log_id = ?
      ORDER BY pes.set_order
    `;
    const [rows] = await pool.execute(query, [memberId, logId]);
    return rows;
  } catch (error) {
    console.error("Error in getWorkoutLogDetail:", error);
    throw new Error(`Failed to fetch workout detail: ${error.message}`);
  }
}

/**
 * 8. ข้อมูล Weight History (Historical)
 */
// async function getWeightHistory(memberId, limit = 30) {
//   try {
//     // ตรวจสอบสิทธิ์ subscription
//     const { hasAccess } = await checkSubscription(memberId);
//     if (!hasAccess) {
//       throw new Error("Subscription required to view weight history");
//     }

//     const query = `
//       SELECT
//         member_health_id,
//         member_health_measurementdate as date,
//         member_health_weight as weight,
//         member_health_bodyfat as bodyfat,
//         member_health_chest as chest,
//         member_health_waist as waist,
//         member_health_hip as hip,
//         member_health_arm as arm,
//         member_health_thigh as thigh,
//         photo_front,
//         photo_side,
//         photo_back
//       FROM member_health
//       WHERE member_id = ?
//       ORDER BY member_health_measurementdate DESC
//       LIMIT ?
//     `;

//     const [rows] = await pool.execute(query, [memberId, limit]);
//     return rows;
//   } catch (error) {
//     console.error("Error in getWeightHistory:", error);
//     throw new Error(`Failed to fetch weight history: ${error.message}`);
//   }
// }

/**
 * 9. ข้อมูล Intake Overview (Aggregate)
 */
async function getIntakeOverview(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscription(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view intake overview");
    }

    const query = `
      SELECT 
        COUNT(DISTINCT date) as totalDays,
        SUM(calories) as totalCalories,
        SUM(protein) as totalProtein,
        SUM(carb) as totalCarb,
        SUM(fat) as totalFat,
        AVG(calories) as avgCalories,
        AVG(protein) as avgProtein,
        AVG(carb) as avgCarb,
        AVG(fat) as avgFat,
        MIN(calories) as minCalories,
        MAX(calories) as maxCalories,
        MIN(protein) as minProtein,
        MAX(protein) as maxProtein
      FROM intake_logs
      WHERE member_id = ? 
        AND date BETWEEN ? AND ?
    `;

    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error in getIntakeOverview:", error);
    throw new Error(`Failed to fetch intake overview: ${error.message}`);
  }
}

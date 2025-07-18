"use server";

import pool from "@/lib/db.js";

/**
 * ตรวจสอบสิทธิ์การเข้าถึงข้อมูลตาม subscription
 */
async function checkSubscriptionRights(memberId) {
  const query = `
    SELECT 
      r.registration_id,
      r.registration_startdate as startDate,
      r.registration_enddate as endDate,
      p.packages_name as packageName,
      p.packages_duration_months as durationMonths,
      p.packages_price as price,
      CASE 
        WHEN r.registration_enddate >= CURDATE() THEN true 
        ELSE false 
      END as isActive,
      CASE 
        WHEN r.registration_enddate >= CURDATE() THEN 'active'
        WHEN r.registration_enddate < CURDATE() THEN 'expired'
        ELSE 'unknown'
      END as status
    FROM registration r
    JOIN packages p ON r.packages_id = p.packages_id
    WHERE r.member_id = ?
    ORDER BY r.registration_startdate DESC
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [memberId]);
  const subscription = rows[0] || null;

  return {
    subscription,
    hasAccess: subscription?.isActive || false,
    message: subscription?.isActive
      ? "Subscription active"
      : subscription
      ? "Subscription expired"
      : "No subscription found",
  };
}

/**
 * Weight Trend Analysis - แนวโน้มน้ำหนักและสถิติ
 * @param {number} memberId - ไอดีสมาชิก
 * @param {string} fromDate - วันที่เริ่มต้น
 * @param {string} toDate - วันที่สิ้นสุด
 */
export async function getWeightTrendAnalysis(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view weight trend");
    }

    const query = `
      SELECT 
        member_health_measurementdate as date,
        member_health_weight as weight,
        member_health_bodyfat as bodyfat,
        member_health_chest as chest,
        member_health_waist as waist,
        member_health_hip as hip,
        member_health_arm as arm,
        member_health_thigh as thigh,
        -- คำนวณการเปลี่ยนแปลงจากครั้งก่อน
        LAG(member_health_weight) OVER (ORDER BY member_health_measurementdate) as prevWeight,
        member_health_weight - LAG(member_health_weight) OVER (ORDER BY member_health_measurementdate) as weightChange,
        -- คำนวณ BMI (ถ้ามีส่วนสูง)
        CASE 
          WHEN member_health_height IS NOT NULL THEN 
            ROUND(member_health_weight / POWER(member_health_height/100, 2), 1)
          ELSE NULL 
        END as bmi
      FROM member_health
      WHERE member_id = ? 
        AND member_health_measurementdate BETWEEN ? AND ?
      ORDER BY member_health_measurementdate ASC
    `;

    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);

    // คำนวณสถิติเพิ่มเติม
    const weights = rows.map((r) => r.weight).filter((w) => w !== null);
    const weightChanges = rows
      .map((r) => r.weightChange)
      .filter((w) => w !== null);

    const stats = {
      totalMeasurements: rows.length,
      currentWeight: weights.length > 0 ? weights[weights.length - 1] : null,
      startWeight: weights.length > 0 ? weights[0] : null,
      totalChange:
        weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0,
      avgWeightChange:
        weightChanges.length > 0
          ? weightChanges.reduce((a, b) => a + b, 0) / weightChanges.length
          : 0,
      minWeight: weights.length > 0 ? Math.min(...weights) : null,
      maxWeight: weights.length > 0 ? Math.max(...weights) : null,
      avgWeight:
        weights.length > 0
          ? weights.reduce((a, b) => a + b, 0) / weights.length
          : null,
    };

    return {
      success: true,
      data: rows,
      stats,
      trend:
        stats.totalChange > 0
          ? "gain"
          : stats.totalChange < 0
          ? "loss"
          : "stable",
    };
  } catch (error) {
    console.error("Error in getWeightTrendAnalysis:", error);
    throw new Error(`Failed to fetch weight trend: ${error.message}`);
  }
}

/**
 * Intake Overview - สรุปการบริโภคอาหาร
 * @param {number} memberId - ไอดีสมาชิก
 * @param {string} fromDate - วันที่เริ่มต้น
 * @param {string} toDate - วันที่สิ้นสุด
 */
export async function getIntakeOverview(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view intake overview");
    }

    const query = `
      SELECT 
        -- สถิติรวม
        COUNT(DISTINCT date) as totalDays,
        SUM(calories) as totalCalories,
        SUM(protein) as totalProtein,
        SUM(carb) as totalCarb,
        SUM(fat) as totalFat,
        
        -- สถิติเฉลี่ย
        AVG(calories) as avgCalories,
        AVG(protein) as avgProtein,
        AVG(carb) as avgCarb,
        AVG(fat) as avgFat,
        
        -- สถิติ min/max
        MIN(calories) as minCalories,
        MAX(calories) as maxCalories,
        MIN(protein) as minProtein,
        MAX(protein) as maxProtein,
        MIN(carb) as minCarb,
        MAX(carb) as maxCarb,
        MIN(fat) as minFat,
        MAX(fat) as maxFat,
        
        -- สัดส่วน macro
        ROUND((SUM(protein * 4) / SUM(calories)) * 100, 1) as proteinRatio,
        ROUND((SUM(carb * 4) / SUM(calories)) * 100, 1) as carbRatio,
        ROUND((SUM(fat * 9) / SUM(calories)) * 100, 1) as fatRatio,
        
        -- วันที่มีการบันทึก
        MIN(date) as firstDate,
        MAX(date) as lastDate
      FROM intake_logs
      WHERE member_id = ? 
        AND date BETWEEN ? AND ?
    `;

    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);
    const overview = rows[0] || null;

    // คำนวณ compliance rate
    const totalDaysInRange =
      Math.ceil(
        (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)
      ) + 1;
    const complianceRate = overview
      ? (overview.totalDays / totalDaysInRange) * 100
      : 0;

    return {
      success: true,
      data: overview,
      complianceRate: Math.round(complianceRate),
      totalDaysInRange,
    };
  } catch (error) {
    console.error("Error in getIntakeOverview:", error);
    throw new Error(`Failed to fetch intake overview: ${error.message}`);
  }
}

/**
 * Workout Calendar - วันที่มีการฝึกซ้อม
 * @param {number} memberId - ไอดีสมาชิก
 * @param {string} fromDate - วันที่เริ่มต้น
 * @param {string} toDate - วันที่สิ้นสุด
 */
export async function getWorkoutCalendar(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view workout calendar");
    }

    const query = `
      SELECT 
        log_date as date,
        COUNT(*) as workoutCount,
        COUNT(DISTINCT workout_program_id) as programCount,
        SUM(COALESCE(els.weight * els.reps, 0)) as totalVolume,
        SUM(COALESCE(els.reps, 0)) as totalReps,
        SUM(COALESCE(els.time, 0)) as totalDuration
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? 
        AND el.log_date BETWEEN ? AND ?
      GROUP BY log_date
      ORDER BY log_date ASC
    `;

    const [rows] = await pool.execute(query, [memberId, fromDate, toDate]);

    // สร้าง calendar array
    const calendar = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const workout = rows.find((w) => w.date === dateStr);

      calendar.push({
        date: dateStr,
        hasWorkout: !!workout,
        workoutCount: workout?.workoutCount || 0,
        programCount: workout?.programCount || 0,
        totalVolume: workout?.totalVolume || 0,
        totalReps: workout?.totalReps || 0,
        totalDuration: workout?.totalDuration || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      success: true,
      data: calendar,
      stats: {
        totalWorkoutDays: rows.length,
        totalWorkouts: rows.reduce((sum, r) => sum + r.workoutCount, 0),
        totalVolume: rows.reduce((sum, r) => sum + r.totalVolume, 0),
        totalReps: rows.reduce((sum, r) => sum + r.totalReps, 0),
        totalDuration: rows.reduce((sum, r) => sum + r.totalDuration, 0),
      },
    };
  } catch (error) {
    console.error("Error in getWorkoutCalendar:", error);
    throw new Error(`Failed to fetch workout calendar: ${error.message}`);
  }
}

/**
 * Past Workouts - ประวัติการฝึกซ้อม
 * @param {number} memberId - ไอดีสมาชิก
 * @param {number} limit - จำนวนรายการที่ต้องการ
 */
export async function getPastWorkouts(memberId, limit = 20) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view past workouts");
    }

    const query = `
      SELECT 
        el.exercise_log_id,
        el.log_date,
        wp.plan_name,
        wpr.program_name,
        COUNT(DISTINCT pe.exercise_id) as exerciseCount,
        SUM(COALESCE(els.weight * els.reps, 0)) as totalVolume,
        SUM(COALESCE(els.reps, 0)) as totalReps,
        SUM(COALESCE(els.time, 0)) as totalDuration,
        COUNT(DISTINCT els.exercise_log_set_id) as setCount
      FROM exercise_log el
      JOIN workout_plan wp ON el.workout_plan_id = wp.workout_plan_id
      JOIN workout_program wpr ON el.workout_program_id = wpr.workout_program_id
      JOIN program_exercise pe ON wpr.workout_program_id = pe.workout_program_id
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ?
      GROUP BY el.exercise_log_id, el.log_date, wp.plan_name, wpr.program_name
      ORDER BY el.log_date DESC
      LIMIT ?
    `;

    const [rows] = await pool.execute(query, [memberId, limit]);

    return {
      success: true,
      data: rows,
      total: rows.length,
    };
  } catch (error) {
    console.error("Error in getPastWorkouts:", error);
    throw new Error(`Failed to fetch past workouts: ${error.message}`);
  }
}

/**
 * Weight Calendar - ปฏิทินการบันทึกน้ำหนัก
 * @param {number} memberId - ไอดีสมาชิก
 * @param {string} fromDate - วันที่เริ่มต้น
 * @param {string} toDate - วันที่สิ้นสุด
 */
export async function getWeightCalendar(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view weight calendar");
    }

    const query = `
      SELECT 
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

    // สร้าง calendar array
    const calendar = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const measurement = rows.find((r) => r.date === dateStr);

      calendar.push({
        date: dateStr,
        hasMeasurement: !!measurement,
        weight: measurement?.weight || null,
        bodyfat: measurement?.bodyfat || null,
        chest: measurement?.chest || null,
        waist: measurement?.waist || null,
        hip: measurement?.hip || null,
        arm: measurement?.arm || null,
        thigh: measurement?.thigh || null,
        hasPhotos: !!(
          measurement?.photo_front ||
          measurement?.photo_side ||
          measurement?.photo_back
        ),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      success: true,
      data: calendar,
      measurements: rows,
      stats: {
        totalMeasurements: rows.length,
        measurementDays: rows.length,
        daysWithPhotos: rows.filter(
          (r) => r.photo_front || r.photo_side || r.photo_back
        ).length,
      },
    };
  } catch (error) {
    console.error("Error in getWeightCalendar:", error);
    throw new Error(`Failed to fetch weight calendar: ${error.message}`);
  }
}

/**
 * Weight History - ประวัติการบันทึกน้ำหนัก
 * @param {number} memberId - ไอดีสมาชิก
 * @param {number} limit - จำนวนรายการที่ต้องการ
 */
export async function getWeightHistory(memberId, limit = 30) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view weight history");
    }

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
        photo_back,
        create_at,
        -- คำนวณการเปลี่ยนแปลง
        LAG(member_health_weight) OVER (ORDER BY member_health_measurementdate DESC) as prevWeight,
        member_health_weight - LAG(member_health_weight) OVER (ORDER BY member_health_measurementdate DESC) as weightChange
      FROM member_health
      WHERE member_id = ?
      ORDER BY member_health_measurementdate DESC
      LIMIT ?
    `;

    const [rows] = await pool.execute(query, [memberId, limit]);

    return {
      success: true,
      data: rows,
      total: rows.length,
    };
  } catch (error) {
    console.error("Error in getWeightHistory:", error);
    throw new Error(`Failed to fetch weight history: ${error.message}`);
  }
}

/**
 * Weekly Statistics - สถิติรายสัปดาห์
 * @param {number} memberId - ไอดีสมาชิก
 * @param {string} fromDate - วันที่เริ่มต้น
 * @param {string} toDate - วันที่สิ้นสุด
 */
export async function getWeeklyStatistics(memberId, fromDate, toDate) {
  try {
    // ตรวจสอบสิทธิ์ subscription
    const { hasAccess } = await checkSubscriptionRights(memberId);
    if (!hasAccess) {
      throw new Error("Subscription required to view weekly statistics");
    }

    // ดึงข้อมูล nutrition และ workout พร้อมกัน
    const [nutritionStats, workoutStats] = await Promise.all([
      // Nutrition stats
      pool.execute(
        `
        SELECT 
          YEARWEEK(date, 1) as week,
          COUNT(DISTINCT date) as daysLogged,
          SUM(calories) as totalCalories,
          SUM(protein) as totalProtein,
          SUM(carb) as totalCarb,
          SUM(fat) as totalFat,
          AVG(calories) as avgCalories,
          AVG(protein) as avgProtein,
          AVG(carb) as avgCarb,
          AVG(fat) as avgFat,
          MIN(date) as weekStart,
          MAX(date) as weekEnd
        FROM intake_logs
        WHERE member_id = ? 
          AND date BETWEEN ? AND ?
        GROUP BY YEARWEEK(date, 1)
        ORDER BY week ASC
      `,
        [memberId, fromDate, toDate]
      ),

      // Workout stats
      pool.execute(
        `
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
      `,
        [memberId, fromDate, toDate]
      ),
    ]);

    // รวมข้อมูล
    const nutritionData = nutritionStats[0];
    const workoutData = workoutStats[0];

    // สร้าง weekly summary
    const weeklySummary = [];
    const allWeeks = new Set([
      ...nutritionData.map((n) => n.week),
      ...workoutData.map((w) => w.week),
    ]);

    for (const week of Array.from(allWeeks).sort()) {
      const nutrition = nutritionData.find((n) => n.week === week);
      const workout = workoutData.find((w) => w.week === week);

      weeklySummary.push({
        week,
        nutrition: nutrition || null,
        workout: workout || null,
        weekStart: nutrition?.weekStart || workout?.weekStart,
        weekEnd: nutrition?.weekEnd || workout?.weekEnd,
      });
    }

    return {
      success: true,
      data: weeklySummary,
      nutritionStats: nutritionData,
      workoutStats: workoutData,
    };
  } catch (error) {
    console.error("Error in getWeeklyStatistics:", error);
    throw new Error(`Failed to fetch weekly statistics: ${error.message}`);
  }
}

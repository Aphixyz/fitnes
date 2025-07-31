"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลความคืบหน้าโดยรวมของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} days - จำนวนวันย้อนหลัง (ค่าเริ่มต้น 30 วัน)
 * @returns {Promise<Object>} ข้อมูลความคืบหน้าโดยรวม
 */
export async function getProgressAnalytics(memberId, days = 30) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ดึงข้อมูลสถิติการออกกำลังกาย
    const [workoutStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT el.log_date) as total_workout_days,
        COUNT(DISTINCT el.workout_plan_id) as active_plans,
        SUM(CASE WHEN els.weight IS NOT NULL THEN els.weight * els.reps ELSE 0 END) as total_volume,
        AVG(CASE WHEN els.reps IS NOT NULL THEN els.reps ELSE NULL END) as avg_reps,
        COUNT(els.exercise_log_set_id) as total_sets
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? AND el.log_date >= ?
    `, [memberId, startDate]);

    // ดึงข้อมูลโภชนาการ
    const [nutritionStats] = await pool.query(`
      SELECT 
        COUNT(*) as logged_days,
        AVG(calories) as avg_calories,
        AVG(protein) as avg_protein,
        AVG(carb) as avg_carbs,
        AVG(fat) as avg_fat,
        SUM(calories) as total_calories
      FROM intake_logs 
      WHERE member_id = ? AND date >= ?
    `, [memberId, startDate]);

    // ดึงข้อมูลน้ำหนักและการเปลี่ยนแปลง
    const [weightProgress] = await pool.query(`
      SELECT 
        member_health_weight as current_weight,
        member_health_measurementdate as measurement_date
      FROM member_health 
      WHERE member_id = ? 
      ORDER BY member_health_measurementdate DESC 
      LIMIT 2
    `, [memberId]);

    // คำนวณการเปลี่ยนแปลงน้ำหนัก
    let weightChange = null;
    if (weightProgress.length >= 2 && weightProgress[0].current_weight && weightProgress[1].current_weight) {
      weightChange = {
        current: weightProgress[0].current_weight,
        previous: weightProgress[1].current_weight,
        change: weightProgress[0].current_weight - weightProgress[1].current_weight,
        change_percentage: ((weightProgress[0].current_weight - weightProgress[1].current_weight) / weightProgress[1].current_weight * 100).toFixed(1)
      };
    }

    // ดึงข้อมูลเป้าหมายปัจจุบัน
    const [currentGoals] = await pool.query(`
      SELECT 
        fitness_goal_type,
        fitness_goal_targetweight,
        fitness_goal_startdate,
        fitness_goal_enddate,
        fitness_goal_status
      FROM fitness_goal 
      WHERE member_id = ? AND fitness_goal_status = 'active'
      ORDER BY create_at DESC 
      LIMIT 1
    `, [memberId]);

    // คำนวณความคืบหน้าตามเป้าหมาย
    let goalProgress = null;
    if (currentGoals.length > 0 && weightChange) {
      const goal = currentGoals[0];
      if (goal.fitness_goal_targetweight && weightChange.current) {
        const startWeight = weightChange.previous || weightChange.current;
        const targetWeight = goal.fitness_goal_targetweight;
        const currentWeight = weightChange.current;
        
        const totalChange = Math.abs(targetWeight - startWeight);
        const currentChange = Math.abs(currentWeight - startWeight);
        const progressPercentage = totalChange > 0 ? (currentChange / totalChange * 100).toFixed(1) : 0;
        
        goalProgress = {
          type: goal.fitness_goal_type,
          start_weight: startWeight,
          current_weight: currentWeight,
          target_weight: targetWeight,
          progress_percentage: Math.min(progressPercentage, 100),
          remaining: Math.abs(targetWeight - currentWeight),
          days_remaining: Math.ceil((new Date(goal.fitness_goal_enddate) - new Date()) / (1000 * 60 * 60 * 24))
        };
      }
    }

    // ดึงข้อมูลการออกกำลังกายในสัปดาห์ที่ผ่านมา
    const [weeklyActivity] = await pool.query(`
      SELECT 
        DATE(el.log_date) as workout_date,
        COUNT(DISTINCT el.workout_program_id) as programs_completed,
        COUNT(els.exercise_log_set_id) as total_sets,
        SUM(CASE WHEN els.weight IS NOT NULL THEN els.weight * els.reps ELSE 0 END) as daily_volume
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(el.log_date)
      ORDER BY workout_date DESC
    `, [memberId]);

    return {
      success: true,
      data: {
        period_days: days,
        workout_stats: workoutStats[0] || {},
        nutrition_stats: nutritionStats[0] || {},
        weight_progress: weightChange,
        goal_progress: goalProgress,
        weekly_activity: weeklyActivity || [],
        current_goals: currentGoals[0] || null
      },
      message: "ดึงข้อมูลความคืบหน้าเรียบร้อยแล้ว"
    };

  } catch (error) {
    console.error("Error fetching progress analytics:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ดึงข้อมูลกราฟน้ำหนักตามช่วงระยะเวลา
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} months - จำนวนเดือนย้อนหลัง
 * @returns {Promise<Object>} ข้อมูลกราฟน้ำหนัก
 */
export async function getWeightChartData(memberId, months = 6) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [weightData] = await pool.query(`
      SELECT 
        member_health_weight as weight,
        member_health_measurementdate as date,
        member_health_bodyfat as body_fat
      FROM member_health 
      WHERE member_id = ? 
        AND member_health_measurementdate >= ? 
        AND member_health_weight IS NOT NULL
      ORDER BY member_health_measurementdate ASC
    `, [memberId, startDate]);

    return {
      success: true,
      data: weightData.map(item => ({
        date: item.date,
        weight: parseFloat(item.weight),
        body_fat: item.body_fat ? parseFloat(item.body_fat) : null
      })),
      message: "ดึงข้อมูลกราฟน้ำหนักเรียบร้อยแล้ว"
    };

  } catch (error) {
    console.error("Error fetching weight chart data:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ดึงข้อมูลกราฟ Total Volume การออกกำลังกาย
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} weeks - จำนวนสัปดาห์ย้อนหลัง
 * @returns {Promise<Object>} ข้อมูลกราฟ Total Volume
 */
export async function getVolumeChartData(memberId, weeks = 12) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const [volumeData] = await pool.query(`
      SELECT 
        YEARWEEK(el.log_date, 1) as week_year,
        DATE(DATE_SUB(el.log_date, INTERVAL WEEKDAY(el.log_date) DAY)) as week_start,
        SUM(CASE WHEN els.weight IS NOT NULL AND els.reps IS NOT NULL 
            THEN els.weight * els.reps ELSE 0 END) as weekly_volume,
        COUNT(DISTINCT el.log_date) as workout_days,
        COUNT(els.exercise_log_set_id) as total_sets
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? AND el.log_date >= ?
      GROUP BY YEARWEEK(el.log_date, 1), week_start
      ORDER BY week_start ASC
    `, [memberId, startDate]);

    return {
      success: true,
      data: volumeData.map(item => ({
        week_start: item.week_start,
        weekly_volume: parseFloat(item.weekly_volume || 0),
        workout_days: parseInt(item.workout_days || 0),
        total_sets: parseInt(item.total_sets || 0)
      })),
      message: "ดึงข้อมูลกราฟ Volume เรียบร้อยแล้ว"
    };

  } catch (error) {
    console.error("Error fetching volume chart data:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ดึงข้อมูลสถิติโภชนาการรายสัปดาห์
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} weeks - จำนวนสัปดาห์ย้อนหลัง
 * @returns {Promise<Object>} ข้อมูลโภชนาการรายสัปดาห์
 */
export async function getNutritionChartData(memberId, weeks = 8) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const [nutritionData] = await pool.query(`
      SELECT 
        YEARWEEK(date, 1) as week_year,
        DATE(DATE_SUB(date, INTERVAL WEEKDAY(date) DAY)) as week_start,
        AVG(calories) as avg_calories,
        AVG(protein) as avg_protein,
        AVG(carb) as avg_carbs,
        AVG(fat) as avg_fat,
        COUNT(*) as logged_days
      FROM intake_logs 
      WHERE member_id = ? AND date >= ?
      GROUP BY YEARWEEK(date, 1), week_start
      ORDER BY week_start ASC
    `, [memberId, startDate]);

    // ดึงข้อมูลเป้าหมายโภชนาการ (ถ้ามี)
    const [macroTargets] = await pool.query(`
      SELECT 
        calorie_target,
        protein_ratio,
        carb_ratio,
        fat_ratio
      FROM macro_plan 
      WHERE member_id = ? AND plan_status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [memberId]);

    let targets = null;
    if (macroTargets.length > 0) {
      const target = macroTargets[0];
      targets = {
        calories: target.calorie_target,
        protein: target.calorie_target * (target.protein_ratio / 100) / 4, // 1g protein = 4 calories
        carbs: target.calorie_target * (target.carb_ratio / 100) / 4, // 1g carb = 4 calories  
        fat: target.calorie_target * (target.fat_ratio / 100) / 9 // 1g fat = 9 calories
      };
    }

    return {
      success: true,
      data: {
        weekly_data: nutritionData.map(item => ({
          week_start: item.week_start,
          avg_calories: parseFloat(item.avg_calories || 0),
          avg_protein: parseFloat(item.avg_protein || 0),
          avg_carbs: parseFloat(item.avg_carbs || 0),
          avg_fat: parseFloat(item.avg_fat || 0),
          logged_days: parseInt(item.logged_days || 0)
        })),
        targets: targets
      },
      message: "ดึงข้อมูลโภชนาการรายสัปดาห์เรียบร้อยแล้ว"
    };

  } catch (error) {
    console.error("Error fetching nutrition chart data:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
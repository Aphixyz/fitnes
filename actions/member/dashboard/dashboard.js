"use server";

import db from "@/lib/db";
import {
  calculateDailyTargets,
  calculateWeeklyTargets,
  calculateMonthlyTargets,
  createMacroCardsData,
  isMacroPlanActive,
} from "./TargetCalculator";

/**
 * ดึงข้อมูล Dashboard สำหรับสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูล dashboard
 */
export async function getDashboardData(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ดึงข้อมูลสมาชิก
    const [memberData] = await db.query(
      `SELECT 
        member_id,
        member_firstname,
        member_lastname,
        member_gender,
        member_dob,
        member_email,
        member_profileimage
       FROM member 
       WHERE member_id = ?`,
      [memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    const member = memberData[0];

    // ดึงข้อมูลสุขภาพล่าสุด
    const [healthData] = await db.query(
      `SELECT 
        member_health_weight,
        member_health_height,
        member_health_bodyfat,
        member_activity_level,
        member_health_measurementdate
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!healthData || healthData.length === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพ กรุณาทำ onboarding ก่อน");
    }

    const health = healthData[0];

    // ดึงข้อมูล macro plan ที่ active
    const [macroPlanData] = await db.query(
      `SELECT 
        macro_plan_id,
        trainer_id,
        protein_ratio,
        carb_ratio,
        fat_ratio,
        start_date,
        end_date,
        plan_status,
        created_at
       FROM macro_plan 
       WHERE member_id = ? AND plan_status = 'active'
       AND CURDATE() BETWEEN start_date AND end_date
       ORDER BY created_at DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!macroPlanData || macroPlanData.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการที่ active กรุณาติดต่อเทรนเนอร์");
    }

    const macroPlan = macroPlanData[0];

    // ตรวจสอบว่า macro plan active หรือไม่
    if (!isMacroPlanActive(macroPlan)) {
      throw new Error("แผนโภชนาการหมดอายุแล้ว กรุณาติดต่อเทรนเนอร์");
    }

    // รวมข้อมูล member profile
    const memberProfile = {
      ...member,
      ...health,
    };

    // คำนวณ targets
    const dailyTargets = calculateDailyTargets(memberProfile, macroPlan);
    if (!dailyTargets.success) {
      throw new Error(dailyTargets.message);
    }

    const weeklyTargets = calculateWeeklyTargets(dailyTargets);
    const monthlyTargets = calculateMonthlyTargets(dailyTargets);

    // สร้าง macro cards data
    const targets = {
      daily: dailyTargets.daily,
      weekly: weeklyTargets.weekly,
      monthly: monthlyTargets.monthly,
    };

    // ดึงข้อมูลเทรนเนอร์ (ถ้ามี)
    let trainerInfo = null;
    if (macroPlan.trainer_id) {
      const [trainerData] = await db.query(
        `SELECT 
          trainer_firstname,
          trainer_lastname,
          trainer_specialization
         FROM trainer 
         WHERE trainer_id = ?`,
        [macroPlan.trainer_id]
      );

      if (trainerData && trainerData.length > 0) {
        trainerInfo = trainerData[0];
      }
    }

    return {
      success: true,
      data: {
        member: {
          id: member.member_id,
          name: `${member.member_firstname} ${member.member_lastname}`,
          email: member.member_email,
          gender: member.member_gender,
          dateOfBirth: member.member_dob,
          profileImage: member.member_profileimage,
        },
        health: {
          weight: health.member_health_weight,
          height: health.member_health_height,
          bodyFat: health.member_health_bodyfat,
          activityLevel: health.member_activity_level,
          lastMeasurement: health.member_health_measurementdate,
        },
        macroPlan: {
          id: macroPlan.macro_plan_id,
          ratios: {
            protein: macroPlan.protein_ratio,
            carb: macroPlan.carb_ratio,
            fat: macroPlan.fat_ratio,
          },
          period: {
            startDate: macroPlan.start_date,
            endDate: macroPlan.end_date,
          },
          status: macroPlan.plan_status,
        },
        targets,
        calculations: dailyTargets.calculations,
        trainer: trainerInfo,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล dashboard",
    };
  }
}

/**
 * ดึงข้อมูล macro cards สำหรับ period ที่เลือก
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} period - "daily" | "weekly" | "monthly"
 * @returns {Promise<Object>} macro cards data
 */
export async function getMacroCardsData(memberId, period = "daily") {
  try {
    const dashboardData = await getDashboardData(memberId);

    if (!dashboardData.success) {
      throw new Error(dashboardData.message);
    }

    const macroCards = createMacroCardsData(dashboardData.data.targets, period);

    return {
      success: true,
      data: {
        period,
        cards: macroCards,
        calculations: dashboardData.data.calculations,
      },
    };
  } catch (error) {
    console.error("Error getting macro cards data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล macro cards",
    };
  }
}

/**
 * ดึงข้อมูลแผนของวันที่ระบุ (Workout + Nutrition)
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} targetDate - วันที่ต้องการดู (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Object>} แผนของวันที่ระบุ
 */
export async function getTodaysPlans(memberId, targetDate = null) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const today = targetDate || new Date().toISOString().split('T')[0];

    // ดึงข้อมูล workout plan ที่ active
    const [workoutPlanData] = await db.query(
      `SELECT 
        wp.workout_plan_id,
        wp.plan_name,
        wp.weekly_target,
        wp.plan_note,
        COUNT(wpr.workout_program_id) as total_programs,
        COALESCE(
          (SELECT COUNT(*) 
           FROM exercise_log el 
           WHERE el.workout_plan_id = wp.workout_plan_id 
           AND el.member_id = ? 
           AND DATE(el.log_date) = ?), 0
        ) as completed_today
       FROM workout_plan wp
       LEFT JOIN workout_program wpr ON wp.workout_plan_id = wpr.workout_plan_id
       WHERE wp.member_id = ? 
       AND wp.plan_status = 'active'
       AND CURDATE() BETWEEN wp.plan_startdate AND wp.plan_enddate
       GROUP BY wp.workout_plan_id
       ORDER BY wp.created_at DESC
       LIMIT 1`,
      [memberId, today, memberId]
    );

    // ดึงข้อมูล macro plan ที่ active
    const [macroPlanData] = await db.query(
      `SELECT 
        mp.macro_plan_id,
        mp.protein_ratio,
        mp.carb_ratio,
        mp.fat_ratio,
        mp.calorie_target,
        COALESCE(
          (SELECT SUM(il.calories) 
           FROM intake_logs il 
           WHERE il.member_id = ? 
           AND il.date = ?), 0
        ) as consumed_calories_today,
        COALESCE(
          (SELECT SUM(il.protein) 
           FROM intake_logs il 
           WHERE il.member_id = ? 
           AND il.date = ?), 0
        ) as consumed_protein_today
       FROM macro_plan mp
       WHERE mp.member_id = ? 
       AND mp.plan_status = 'active'
       AND CURDATE() BETWEEN mp.start_date AND mp.end_date
       ORDER BY mp.created_at DESC
       LIMIT 1`,
      [memberId, today, memberId, today, memberId]
    );

    return {
      success: true,
      data: {
        workout: workoutPlanData.length > 0 ? {
          ...workoutPlanData[0],
          progress: workoutPlanData[0].total_programs > 0 
            ? Math.round((workoutPlanData[0].completed_today / workoutPlanData[0].total_programs) * 100)
            : 0
        } : null,
        nutrition: macroPlanData.length > 0 ? macroPlanData[0] : null,
        date: today
      }
    };
  } catch (error) {
    console.error("Error getting today's plans:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนวันนี้"
    };
  }
}

/**
 * ดึงข้อมูลความก้าวหน้าล่าสุด (Progress Overview)
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูลความก้าวหน้า
 */
export async function getProgressOverview(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ดึงข้อมูลน้ำหนัก 30 วันล่าสุด
    const [weightData] = await db.query(
      `SELECT 
        member_health_weight as weight,
        member_health_measurementdate as date
       FROM member_health 
       WHERE member_id = ? 
       AND member_health_weight IS NOT NULL
       AND member_health_measurementdate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY member_health_measurementdate DESC`,
      [memberId]
    );

    // ดึงข้อมูล workout logs 7 วันล่าสุด
    const [workoutData] = await db.query(
      `SELECT 
        DATE(log_date) as date,
        COUNT(DISTINCT workout_program_id) as completed_programs
       FROM exercise_log
       WHERE member_id = ?
       AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(log_date)
       ORDER BY date DESC`,
      [memberId]
    );

    // ดึงข้อมูล nutrition logs 7 วันล่าสุด
    const [nutritionData] = await db.query(
      `SELECT 
        date,
        calories,
        protein,
        carb,
        fat
       FROM intake_logs
       WHERE member_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY date DESC`,
      [memberId]
    );

    // คำนวณสถิติ
    const weightTrend = weightData.length >= 2 
      ? weightData[0].weight - weightData[weightData.length - 1].weight
      : 0;

    const workoutStreak = calculateWorkoutStreak(workoutData);
    const avgDailyCalories = nutritionData.length > 0
      ? nutritionData.reduce((sum, day) => sum + (day.calories || 0), 0) / nutritionData.length
      : 0;

    return {
      success: true,
      data: {
        weight: {
          current: weightData.length > 0 ? weightData[0].weight : 0,
          trend: weightTrend,
          history: weightData.slice(0, 7)
        },
        workout: {
          streak: workoutStreak,
          weeklyCompletions: workoutData.length,
          history: workoutData
        },
        nutrition: {
          avgDailyCalories: Math.round(avgDailyCalories),
          history: nutritionData.slice(0, 7)
        }
      }
    };
  } catch (error) {
    console.error("Error getting progress overview:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลความก้าวหน้า"
    };
  }
}

// Helper function to calculate workout streak
function calculateWorkoutStreak(workoutData) {
  if (!workoutData || workoutData.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasWorkout = workoutData.some(w => w.date === dateStr);
    if (hasWorkout) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * ดึงข้อมูลโภชนาการของวันที่ระบุ (Daily Nutrition Display)
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} targetDate - วันที่ต้องการดู (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Object>} ข้อมูลโภชนาการของวันที่ระบุ
 */
export async function getTodaysNutrition(memberId, targetDate = null) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const today = targetDate || new Date().toISOString().split('T')[0];

    // ดึงข้อมูล macro plan ที่ active
    const [macroPlanData] = await db.query(
      `SELECT 
        mp.macro_plan_id,
        mp.protein_ratio,
        mp.carb_ratio,
        mp.fat_ratio,
        mp.calorie_target
       FROM macro_plan mp
       WHERE mp.member_id = ? 
       AND mp.plan_status = 'active'
       AND CURDATE() BETWEEN mp.start_date AND mp.end_date
       ORDER BY mp.created_at DESC
       LIMIT 1`,
      [memberId]
    );

    if (!macroPlanData || macroPlanData.length === 0) {
      return {
        success: false,
        message: "ไม่พบแผนโภชนาการที่ active"
      };
    }

    // ดึงข้อมูลการบริโภคของวันนี้
    const [consumptionData] = await db.query(
      `SELECT 
        COALESCE(SUM(calories), 0) as consumed_calories_today,
        COALESCE(SUM(protein), 0) as consumed_protein_today,
        COALESCE(SUM(carb), 0) as consumed_carb_today,
        COALESCE(SUM(fat), 0) as consumed_fat_today
       FROM intake_logs
       WHERE member_id = ? AND date = ?`,
      [memberId, today]
    );

    // ดึงข้อมูลสุขภาพล่าสุดเพื่อคำนวณ targets
    const dashboardData = await getDashboardData(memberId);
    let targets = null;
    
    if (dashboardData.success) {
      targets = dashboardData.data.targets;
    }

    const nutrition = {
      ...macroPlanData[0],
      ...consumptionData[0]
    };

    return {
      success: true,
      data: {
        nutrition,
        targets,
        date: today
      }
    };
  } catch (error) {
    console.error("Error getting today's nutrition:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลโภชนาการวันนี้"
    };
  }
}

/**
 * ดึงข้อมูลการออกกำลังกายสำหรับ Motivation Display
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} targetDate - วันที่ต้องการดู (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Object>} ข้อมูลการออกกำลังกาย
 */
export async function getWorkoutMotivationData(memberId, targetDate = null) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const today = targetDate ? new Date(targetDate) : new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    // ดึงข้อมูล workout plans ที่ active
    const [activePlansData] = await db.query(
      `SELECT 
        wp.workout_plan_id,
        wp.plan_name,
        wp.weekly_target,
        wp.plan_note
       FROM workout_plan wp
       WHERE wp.member_id = ? 
       AND wp.plan_status = 'active'
       AND CURDATE() BETWEEN wp.plan_startdate AND wp.plan_enddate
       ORDER BY wp.created_at DESC`,
      [memberId]
    );

    if (!activePlansData || activePlansData.length === 0) {
      return {
        success: false,
        message: "ไม่มีแผนการออกกำลังกายที่ active"
      };
    }

    const planIds = activePlansData.map(p => p.workout_plan_id);

    // ดึงข้อมูลการออกกำลังกายในสัปดาห์นี้
    const [thisWeekWorkouts] = await db.query(
      `SELECT 
        DATE(log_date) as date,
        COUNT(DISTINCT workout_program_id) as programs_completed
       FROM exercise_log
       WHERE member_id = ?
       AND workout_plan_id IN (${planIds.map(() => '?').join(',')})
       AND DATE(log_date) >= ?
       GROUP BY DATE(log_date)
       ORDER BY date DESC`,
      [memberId, ...planIds, startOfWeekStr]
    );

    // คำนวณ streak (วันติดต่อกัน)
    const currentStreak = calculateWorkoutStreak(thisWeekWorkouts);

    // ดึงโปรแกรมที่พร้อมบันทึก
    const [availablePrograms] = await db.query(
      `SELECT 
        wpr.workout_program_id,
        wpr.program_name,
        wpr.program_note,
        wp.plan_name,
        COUNT(pe.program_exercise_id) as exercise_count
       FROM workout_program wpr
       JOIN workout_plan wp ON wpr.workout_plan_id = wp.workout_plan_id
       LEFT JOIN program_exercise pe ON wpr.workout_program_id = pe.workout_program_id
       WHERE wp.member_id = ? 
       AND wp.plan_status = 'active'
       AND CURDATE() BETWEEN wp.plan_startdate AND wp.plan_enddate
       GROUP BY wpr.workout_program_id, wpr.program_name, wpr.program_note, wp.plan_name
       ORDER BY wpr.order_index ASC`,
      [memberId]
    );

    // คำนวณเป้าหมายรวม
    const totalWeeklyTarget = activePlansData.reduce((sum, plan) => sum + (plan.weekly_target || 0), 0);
    const thisWeekWorkoutCount = thisWeekWorkouts.length;

    return {
      success: true,
      data: {
        overview: {
          currentStreak,
          thisWeekWorkouts: thisWeekWorkoutCount,
          totalPrograms: availablePrograms.length
        },
        goals: {
          weeklyTarget: totalWeeklyTarget,
          progress: totalWeeklyTarget > 0 ? Math.min(100, (thisWeekWorkoutCount / totalWeeklyTarget) * 100) : 0
        },
        availablePrograms: availablePrograms.map(program => ({
          workout_program_id: program.workout_program_id,
          program_name: program.program_name,
          program_note: program.program_note,
          plan_name: program.plan_name,
          exercise_count: program.exercise_count
        })),
        activePlans: activePlansData
      }
    };
  } catch (error) {
    console.error("Error getting workout motivation data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการออกกำลังกาย"
    };
  }
}

/**
 * ดึงสถิติสรุปสำหรับ dashboard
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} สถิติสรุป
 */
export async function getDashboardStats(memberId) {
  try {
    const dashboardData = await getDashboardData(memberId);

    if (!dashboardData.success) {
      throw new Error(dashboardData.message);
    }

    const { data } = dashboardData;

    // คำนวณ BMI
    const heightInM = data.health.height / 100;
    const bmi = data.health.weight / (heightInM * heightInM);

    // กำหนดสถานะ BMI
    let bmiStatus = "ปกติ";
    if (bmi < 18.5) bmiStatus = "น้ำหนักน้อย";
    else if (bmi >= 25) bmiStatus = "น้ำหนักเกิน";
    else if (bmi >= 30) bmiStatus = "อ้วน";

    // คำนวณวันที่เหลือของแผน
    const today = new Date();
    const endDate = new Date(data.macroPlan.period.endDate);
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    );

    return {
      success: true,
      data: {
        bmi: {
          value: Math.round(bmi * 10) / 10,
          status: bmiStatus,
        },
        planProgress: {
          daysRemaining,
          totalDays: Math.ceil(
            (endDate - new Date(data.macroPlan.period.startDate)) /
              (1000 * 60 * 60 * 24)
          ),
        },
        lastUpdate: data.health.lastMeasurement,
        tdee: data.calculations.tdee,
        bmr: data.calculations.bmr,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงสถิติ",
    };
  }
}

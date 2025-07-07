"use server";

import pool from "@/lib/db";
import {
  calculateDailyTargets,
  calculateWeeklyTargets,
  calculateMonthlyTargets,
  isMacroPlanActive,
} from "../../macro-engine/macro-engine";
import {
  validateMacroRatios,
  translateGoalType,
  translateExperienceLevel,
} from "@/utils/macro-utils";

/**
 * สร้าง macro cards data สำหรับ UI display
 * @param {Object} targets - daily/weekly/monthly targets
 * @param {string} period - "daily" | "weekly" | "monthly"
 * @returns {Array} macro cards data
 */
export async function createMacroCardsData(targets, period = "daily") {
  const data = targets[period];

  if (!data) return [];

  return [
    {
      id: "calories",
      name: "Calories",
      value: data.kcal,
      unit: "kcal",
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      progressColor: "bg-orange-500",
      icon: "🔥",
    },
    {
      id: "protein",
      name: "Protein",
      value: data.protein_g,
      unit: "g",
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      progressColor: "bg-red-500",
      icon: "🥩",
    },
    {
      id: "carbs",
      name: "Carbs",
      value: data.carb_g,
      unit: "g",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      progressColor: "bg-green-500",
      icon: "🍞",
    },
    {
      id: "fat",
      name: "Fat",
      value: data.fat_g,
      unit: "g",
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
      progressColor: "bg-yellow-500",
      icon: "🥑",
    },
  ];
}

/**
 * คำนวณเปอร์เซ็นต์ความสำเร็จ
 * @param {number} consumed - ปริมาณที่บริโภคแล้ว
 * @param {number} target - เป้าหมาย
 * @returns {number} เปอร์เซ็นต์ (0-100)
 */
export async function calculateProgress(consumed, target) {
  if (!target || target === 0) return 0;
  return Math.min(Math.round((consumed / target) * 100), 100);
}

/**
 * ตรวจสอบความถูกต้องของ macro ratios
 * @param {number} protein - เปอร์เซ็นต์โปรตีน
 * @param {number} carb - เปอร์เซ็นต์คาร์บ
 * @param {number} fat - เปอร์เซ็นต์ไขมัน
 * @returns {Object} validation result
 */
export async function validateMacroRatiosInput(protein, carb, fat) {
  return validateMacroRatios(protein, carb, fat);
}

/**
 * แปลง goal type เป็นภาษาไทย
 * @param {string} goalType - ประเภทเป้าหมาย
 * @returns {string} ชื่อเป้าหมายภาษาไทย
 */
export async function getGoalTypeDisplayName(goalType) {
  return translateGoalType(goalType);
}

/**
 * แปลง experience level เป็นภาษาไทย
 * @param {string} level - ระดับประสบการณ์
 * @returns {string} ระดับประสบการณ์ภาษาไทย
 */
export async function getExperienceLevelDisplayName(level) {
  return translateExperienceLevel(level);
}

/**
 * ดึงข้อมูลและคำนวณ Macro Data สำหรับสมาชิก
 * ใช้ macro-engine.js เป็น Single Source of Truth
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูล macro ที่คำนวณแล้ว
 */
export async function getMemberMacroData(memberId) {
  const connection = await pool.getConnection();

  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ดึงข้อมูลสมาชิก
    const [memberData] = await connection.query(
      `SELECT member_id, member_firstname, member_lastname, member_gender, member_dob, member_email
       FROM member WHERE member_id = ?`,
      [memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    const member = memberData[0];

    // ดึงข้อมูลสุขภาพล่าสุด
    const [healthData] = await connection.query(
      `SELECT member_health_weight, member_health_height, member_health_bodyfat,
              member_activity_level, member_health_measurementdate
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!healthData || healthData.length === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพ กรุณาเพิ่มข้อมูลสุขภาพก่อน");
    }

    const health = healthData[0];

    // ดึงข้อมูลเป้าหมายที่ active
    const [goalData] = await connection.query(
      `SELECT fitness_goal_type, fitness_goal_targetweight, fitness_experience_level 
       FROM fitness_goal 
       WHERE member_id = ? AND fitness_goal_status = 'active' 
       ORDER BY fitness_goal_id DESC 
       LIMIT 1`,
      [memberId]
    );

    // ดึงข้อมูล macro plan ที่ active (บังคับต้องมี)
    const [macroPlanData] = await connection.query(
      `SELECT macro_plan_id, trainer_id, protein_ratio, carb_ratio, fat_ratio, 
              start_date, end_date, plan_status, created_at
       FROM macro_plan 
       WHERE member_id = ? AND plan_status = 'active'
       AND CURDATE() BETWEEN start_date AND end_date
       ORDER BY created_at DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!macroPlanData || macroPlanData.length === 0) {
      throw new Error(
        "ไม่พบแผนโภชนาการที่ active กรุณาให้เทรนเนอร์สร้างแผนโภชนาการก่อน"
      );
    }

    const macroPlan = macroPlanData[0];

    // ตรวจสอบว่า macro plan ยัง active อยู่หรือไม่
    if (!(await isMacroPlanActive(macroPlan))) {
      throw new Error("แผนโภชนาการหมดอายุแล้ว กรุณาให้เทรนเนอร์ปรับแผนใหม่");
    }

    // รวมข้อมูล member profile สำหรับ macro-engine
    const memberProfile = {
      member_id: member.member_id,
      member_firstname: member.member_firstname,
      member_lastname: member.member_lastname,
      member_gender: member.member_gender,
      member_dob: member.member_dob,
      member_health_weight: health.member_health_weight,
      member_health_height: health.member_health_height,
      member_health_bodyfat: health.member_health_bodyfat,
      member_activity_level: health.member_activity_level,
    };

    // 🎯 ใช้ macro-engine.js แยก functions
    const dailyTargets = await calculateDailyTargets(memberProfile, macroPlan);
    if (!dailyTargets.success) {
      throw new Error(dailyTargets.message);
    }

    const weeklyTargets = await calculateWeeklyTargets(dailyTargets);
    const monthlyTargets = await calculateMonthlyTargets(dailyTargets);

    // รวมข้อมูล targets
    const targets = {
      daily: dailyTargets.daily,
      weekly: weeklyTargets.weekly,
      monthly: monthlyTargets.monthly,
    };

    // ดึงข้อมูลเทรนเนอร์ (ถ้ามี)
    let trainerInfo = null;
    if (macroPlan.trainer_id) {
      const [trainerData] = await connection.query(
        `SELECT trainer_firstname, trainer_lastname, trainer_specialization
         FROM trainer WHERE trainer_id = ?`,
        [macroPlan.trainer_id]
      );

      if (trainerData && trainerData.length > 0) {
        trainerInfo = trainerData[0];
      }
    }

    // ดึงข้อมูลการบริโภคอาหารวันนี้ (mock data ก่อน - เตรียมไว้สำหรับอนาคต)
    const today = new Date().toISOString().split("T")[0];
    const foodConsumed = 0; // TODO: ดึงจาก nutrition_log table เมื่อมีข้อมูล
    const exerciseBurned = 0; // TODO: ดึงจาก workout_log table เมื่อมีข้อมูล

    return {
      success: true,
      data: {
        member: {
          id: member.member_id,
          name: `${member.member_firstname} ${member.member_lastname}`,
          email: member.member_email || null,
          gender: member.member_gender,
          dateOfBirth: member.member_dob,
        },
        health: {
          weight: health.member_health_weight,
          height: health.member_health_height,
          bodyFat: health.member_health_bodyfat,
          activityLevel: health.member_activity_level,
          lastMeasurement: health.member_health_measurementdate,
        },
        // ใช้ข้อมูลจาก macro-engine
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
        // Daily intake data
        daily_intake: {
          food_consumed: foodConsumed,
          exercise_burned: exerciseBurned,
          remaining: dailyTargets.daily.kcal - foodConsumed + exerciseBurned,
        },
        // Backward compatibility - ข้อมูลเดิมที่ CaloriesCard ต้องการ
        macros: {
          calories: dailyTargets.daily.kcal,
          protein_g: dailyTargets.daily.protein_g,
          carb_g: dailyTargets.daily.carb_g,
          fat_g: dailyTargets.daily.fat_g,
          ratios: {
            protein: macroPlan.protein_ratio,
            carb: macroPlan.carb_ratio,
            fat: macroPlan.fat_ratio,
          },
        },
        goal: goalData.length > 0 ? goalData[0] : null,
      },
      message: "ดึงข้อมูล Macro สำเร็จ",
    };
  } catch (error) {
    console.error("Error getting member macro data:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล Macro",
    };
  } finally {
    connection.release();
  }
}

/**
 * ดึงข้อมูล macro targets สำหรับ period ที่เลือก
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} period - "daily" | "weekly" | "monthly"
 * @returns {Promise<Object>} macro targets data
 */
export async function getMemberMacroTargets(memberId, period = "daily") {
  try {
    const macroData = await getMemberMacroData(memberId);

    if (!macroData.success) {
      throw new Error(macroData.message);
    }

    const targets = macroData.data.targets[period];

    if (!targets) {
      throw new Error("ไม่พบข้อมูล targets สำหรับ period ที่เลือก");
    }

    return {
      success: true,
      data: {
        period,
        targets,
        calculations: macroData.data.calculations,
        macroPlan: macroData.data.macroPlan,
      },
    };
  } catch (error) {
    console.error("Error getting member macro targets:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล macro targets",
    };
  }
}

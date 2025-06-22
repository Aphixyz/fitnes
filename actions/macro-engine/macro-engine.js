"use server";

import { calcAge, calcBMR, calcTDEE } from "@/utils/macro-utils";

/**
 * คำนวณ Daily Macro Targets จาก macro plan ที่บันทึกใน DB
 *
 * @param {Object} memberProfile - ข้อมูลสมาชิก
 * @param {Object} macroPlan - แผน macro ที่ active จาก DB
 * @returns {Object} daily targets และ calculations
 */
export async function calculateDailyTargets(memberProfile, macroPlan) {
  try {
    // คำนวณ basic metrics
    const age = calcAge(memberProfile.member_dob);
    const bmr = calcBMR(
      memberProfile.member_health_weight,
      memberProfile.member_health_height,
      memberProfile.member_gender,
      age
    );
    const tdee = calcTDEE(bmr, memberProfile.member_activity_level);

    // คำนวณ macro grams จาก ratios ที่บันทึกใน DB
    const daily = {
      kcal: tdee,
      protein_g: Math.round((tdee * macroPlan.protein_ratio) / 100 / 4),
      carb_g: Math.round((tdee * macroPlan.carb_ratio) / 100 / 4),
      fat_g: Math.round((tdee * macroPlan.fat_ratio) / 100 / 9),
    };

    return {
      success: true,
      daily,
      calculations: {
        bmr,
        tdee,
        age,
        ratios: {
          protein: macroPlan.protein_ratio,
          carb: macroPlan.carb_ratio,
          fat: macroPlan.fat_ratio,
        },
      },
    };
  } catch (error) {
    console.error("Error calculating daily targets:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการคำนวณ",
    };
  }
}

/**
 * คำนวณ Weekly Macro Targets
 * @param {Object} dailyTargets - ผลจาก calculateDailyTargets()
 * @returns {Object} weekly targets
 */
export async function calculateWeeklyTargets(dailyTargets) {
  if (!dailyTargets.success) {
    return { success: false, message: "ไม่สามารถคำนวณ weekly targets ได้" };
  }

  const weekly = {
    kcal: dailyTargets.daily.kcal * 7,
    protein_g: dailyTargets.daily.protein_g * 7,
    carb_g: dailyTargets.daily.carb_g * 7,
    fat_g: dailyTargets.daily.fat_g * 7,
  };

  return {
    success: true,
    weekly,
  };
}

/**
 * คำนวณ Monthly Macro Targets (30 วัน)
 * @param {Object} dailyTargets - ผลจาก calculateDailyTargets()
 * @returns {Object} monthly targets
 */
export async function calculateMonthlyTargets(dailyTargets) {
  if (!dailyTargets.success) {
    return { success: false, message: "ไม่สามารถคำนวณ monthly targets ได้" };
  }

  const monthly = {
    kcal: dailyTargets.daily.kcal * 30,
    protein_g: dailyTargets.daily.protein_g * 30,
    carb_g: dailyTargets.daily.carb_g * 30,
    fat_g: dailyTargets.daily.fat_g * 30,
  };

  return {
    success: true,
    monthly,
  };
}

/**
 * ตรวจสอบสถานะ macro plan ว่า active หรือไม่
 * @param {Object} macroPlan - macro plan object จาก DB
 * @returns {boolean} true ถ้า active
 */
export async function isMacroPlanActive(macroPlan) {
  if (!macroPlan) return false;

  const today = new Date();
  const startDate = new Date(macroPlan.start_date);
  const endDate = new Date(macroPlan.end_date);

  return (
    macroPlan.plan_status === "active" && today >= startDate && today <= endDate
  );
}

/**
 * Target Calculator สำหรับคำนวณ Daily และ Weekly Macro Targets
 * ใช้ข้อมูลจาก macro_plan และ member profile
 */

import {
  calcAge,
  calcBMR,
  calcTDEE,
  mapActivityFactor,
} from "@/utils/macro-utils";

/**
 * คำนวณ Daily Macro Targets
 * @param {Object} memberProfile - ข้อมูลสมาชิก
 * @param {Object} macroPlan - แผน macro ที่ active
 * @returns {Object} daily targets
 */
export function calculateDailyTargets(memberProfile, macroPlan) {
  try {
    // คำนวณ TDEE
    const age = calcAge(memberProfile.member_dob);
    const bmr = calcBMR(
      memberProfile.member_health_weight,
      memberProfile.member_health_height,
      memberProfile.member_gender,
      age
    );
    const tdee = calcTDEE(bmr, memberProfile.member_activity_level);

    // คำนวณ macro grams จาก ratios
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
 * @param {Object} dailyTargets - daily targets
 * @returns {Object} weekly targets
 */
export function calculateWeeklyTargets(dailyTargets) {
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
 * @param {Object} dailyTargets - daily targets
 * @returns {Object} monthly targets
 */
export function calculateMonthlyTargets(dailyTargets) {
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
 * สร้าง macro data สำหรับ dashboard
 * @param {Object} targets - daily/weekly/monthly targets
 * @param {string} period - "daily" | "weekly" | "monthly"
 * @returns {Array} macro cards data
 */
export function createMacroCardsData(targets, period = "daily") {
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
 * คำนวณเปอร์เซ็นต์ความสำเร็จ (สำหรับอนาคต - เมื่อมีข้อมูล consumption)
 * @param {number} consumed - ปริมาณที่บริโภคแล้ว
 * @param {number} target - เป้าหมาย
 * @returns {number} เปอร์เซ็นต์ (0-100)
 */
export function calculateProgress(consumed, target) {
  if (!target || target === 0) return 0;
  return Math.min(Math.round((consumed / target) * 100), 100);
}

/**
 * ตรวจสอบสถานะ macro plan ว่า active หรือไม่
 * @param {Object} macroPlan - macro plan object
 * @returns {boolean} true ถ้า active
 */
export function isMacroPlanActive(macroPlan) {
  if (!macroPlan) return false;

  const today = new Date();
  const startDate = new Date(macroPlan.start_date);
  const endDate = new Date(macroPlan.end_date);

  return (
    macroPlan.plan_status === "active" && today >= startDate && today <= endDate
  );
}

"use server";

import db from "@/lib/db";

/**
 * Get member nutrition data for a specific date
 * @param {number} memberId - Member ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Nutrition data including macro plan targets and intake data
 */
export async function getMemberNutritionData(memberId, date) {
  if (!memberId || !date) {
    throw new Error("กรุณาระบุรหัสสมาชิกและวันที่");
  }

  try {
    // Get active macro plan for the member
    const [macroPlanResult] = await db.query(
      `SELECT 
         mp.macro_plan_id,
         mp.calorie_target,
         mp.protein_ratio,
         mp.carb_ratio,
         mp.fat_ratio,
         mp.start_date,
         mp.end_date,
         mp.plan_status
       FROM macro_plan mp
       WHERE mp.member_id = ? 
         AND mp.plan_status = 'active'
         AND ? BETWEEN mp.start_date AND mp.end_date
       ORDER BY mp.created_at DESC
       LIMIT 1`,
      [memberId, date]
    );

    // Get intake data for the specific date
    const [intakeResult] = await db.query(
      `SELECT 
         calories,
         protein,
         carb,
         fat
       FROM intake_logs
       WHERE member_id = ? AND date = ?`,
      [memberId, date]
    );

    const macroPlan = macroPlanResult?.[0] || null;
    const intakeData = intakeResult?.[0] || null;

    // Calculate macro targets from percentages if macro plan exists
    let targets = {
      calories: 0,
      protein: 0,
      carb: 0,
      fat: 0
    };

    if (macroPlan && macroPlan.calorie_target) {
      const totalCalories = macroPlan.calorie_target;
      targets = {
        calories: totalCalories,
        // Protein: 4 cal/g, Carb: 4 cal/g, Fat: 9 cal/g
        protein: Math.round((totalCalories * (macroPlan.protein_ratio / 100)) / 4),
        carb: Math.round((totalCalories * (macroPlan.carb_ratio / 100)) / 4),
        fat: Math.round((totalCalories * (macroPlan.fat_ratio / 100)) / 9)
      };
    }

    // Get actual intake values
    const intake = {
      calories: intakeData?.calories || 0,
      protein: intakeData?.protein || 0,
      carb: intakeData?.carb || 0,
      fat: intakeData?.fat || 0
    };

    return {
      success: true,
      data: {
        date,
        hasMacroPlan: !!macroPlan,
        hasIntakeData: !!intakeData,
        macroPlan: macroPlan ? {
          id: macroPlan.macro_plan_id,
          calorie_target: macroPlan.calorie_target,
          protein_ratio: macroPlan.protein_ratio,
          carb_ratio: macroPlan.carb_ratio,
          fat_ratio: macroPlan.fat_ratio
        } : null,
        targets,
        intake,
        // Calculate adherence percentage
        adherencePercentage: targets.calories > 0 ? 
          Math.round((intake.calories / targets.calories) * 100) : 0
      }
    };
  } catch (error) {
    console.error("Error fetching member nutrition data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลโภชนาการ",
      data: null
    };
  }
}
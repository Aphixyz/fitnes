"use server";

import db from "@/lib/db";
import {
  calcAge,
  calcBMR,
  calcTDEE,
  adjustCaloriesForGoal,
  getDefaultMacroRatios,
  calcMacroGrams,
  mapActivityFactor,
} from "@/utils/macro-utils";

/**
 * คำนวณและแนะนำ Macro Plan
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ผลลัพธ์การคำนวณ Macro
 */
export async function suggestMacroPlan(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ดึงข้อมูลสมาชิก
    const [memberData] = await db.query(
      `SELECT member_gender, member_dob FROM member WHERE member_id = ?`,
      [memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    const member = memberData[0];

    // ดึงข้อมูลสุขภาพล่าสุด
    const [healthData] = await db.query(
      `SELECT member_health_weight, member_health_height, member_activity_level 
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!healthData || healthData.length === 0) {
      throw new Error("ไม่พบข้อมูลสุขภาพ");
    }

    const health = healthData[0];

    // ดึงข้อมูลเป้าหมายที่ active
    const [goalData] = await db.query(
      `SELECT fitness_goal_type, fitness_goal_targetweight, fitness_experience_level 
       FROM fitness_goal 
       WHERE member_id = ? AND fitness_goal_status = 'active' 
       ORDER BY fitness_goal_id DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!goalData || goalData.length === 0) {
      throw new Error("ไม่พบข้อมูลเป้าหมาย");
    }

    const goal = goalData[0];

    // คำนวณอายุ
    const age = member.member_dob ? calcAge(member.member_dob) : 25; // default age ถ้าไม่มีข้อมูล

    // คำนวณ BMR
    const bmr = calcBMR(
      health.member_health_weight,
      health.member_health_height,
      member.member_gender || "male",
      age
    );

    // คำนวณ TDEE
    const tdee = calcTDEE(bmr, health.member_activity_level);

    // ปรับ calories ตามเป้าหมาย
    let goalTypeForCalc = "maintain_weight";
    if (goal.fitness_goal_type === "ลดน้ำหนัก") goalTypeForCalc = "lose_weight";
    else if (goal.fitness_goal_type === "เพิ่มกล้ามเนื้อ")
      goalTypeForCalc = "gain_muscle";

    const adjustedCalories = adjustCaloriesForGoal(tdee, goalTypeForCalc);

    // คำนวณ Macro Ratios
    const experienceLevel = goal.fitness_experience_level || "beginner";
    const macroRatios = getDefaultMacroRatios(goalTypeForCalc, experienceLevel);

    // คำนวณ Macro Grams
    const macroGrams = calcMacroGrams(adjustedCalories, macroRatios);

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // ปิด macro plan เก่าที่ active อยู่ (ถ้ามี)
      await db.query(
        `UPDATE macro_plan 
         SET plan_status = 'inactive' 
         WHERE member_id = ? AND plan_status = 'active'`,
        [memberId]
      );

      // สร้าง macro plan ใหม่
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 3);

      const [macroPlanResult] = await db.query(
        `INSERT INTO macro_plan 
         (trainer_id, member_id, protein_ratio, carb_ratio, fat_ratio, 
          start_date, end_date, plan_status, created_at) 
         SELECT r.trainer_id, ?, ?, ?, ?, ?, ?, 'active', NOW()
         FROM registration r 
         WHERE r.member_id = ? AND r.registration_status = 'active' 
         LIMIT 1`,
        [
          memberId,
          macroRatios.protein,
          macroRatios.carb,
          macroRatios.fat,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
          memberId,
        ]
      );

      await db.query("COMMIT");

      return {
        success: true,
        macro_plan_id: macroPlanResult.insertId,
        calculations: {
          bmr: bmr,
          tdee: tdee,
          adjusted_calories: adjustedCalories,
          macro_ratios: macroRatios,
          macro_grams: macroGrams,
        },
        message: "คำนวณและสร้าง Macro Plan สำเร็จ",
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error suggesting macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการคำนวณ Macro Plan",
    };
  }
}

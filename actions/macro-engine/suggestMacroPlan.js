"use server";

import pool from "@/lib/db";
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
 * สร้าง Macro Plan ใหม่ในฐานข้อมูล
 * ใช้ร่วมกับ suggestMacroRatios()
 *
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง Macro Plan
 */
export async function suggestMacroPlan(memberId) {
  const connection = await pool.getConnection();

  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    await connection.query("START TRANSACTION");

    // ดึงข้อมูลสมาชิก
    const [memberData] = await connection.query(
      `SELECT member_gender, member_dob FROM member WHERE member_id = ?`,
      [memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    const member = memberData[0];

    // ดึงข้อมูลสุขภาพล่าสุด
    const [healthData] = await connection.query(
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
    const [goalData] = await connection.query(
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

    // รวมข้อมูล member profile
    const memberProfile = {
      member_gender: member.member_gender,
      member_dob: member.member_dob,
      member_health_weight: health.member_health_weight,
      member_health_height: health.member_health_height,
      member_activity_level: health.member_activity_level,
    };

    // ใช้ suggestMacroRatios เพื่อคำนวณ
    const suggestion = await suggestMacroRatios(memberProfile, goal);
    if (!suggestion.success) {
      throw new Error(suggestion.message);
    }

    const macroRatios = suggestion.suggested;

    // ปิด macro plan เก่าที่ active อยู่ (ถ้ามี)
    await connection.query(
      `UPDATE macro_plan 
         SET plan_status = 'inactive' 
         WHERE member_id = ? AND plan_status = 'active'`,
      [memberId]
    );

    // สร้าง macro plan ใหม่
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 3);

    // ดึง trainer_id จาก registration ที่ active
    const [registrationData] = await connection.query(
      `SELECT trainer_id FROM registration 
       WHERE member_id = ? AND registration_status = 'active' 
       LIMIT 1`,
      [memberId]
    );

    if (!registrationData || registrationData.length === 0) {
      throw new Error(
        "ไม่พบการลงทะเบียนที่ active กรุณาติดต่อเทรนเนอร์เพื่อลงทะเบียน"
      );
    }

    const trainerId = registrationData[0].trainer_id;

    const [macroPlanResult] = await connection.query(
      `INSERT INTO macro_plan 
         (trainer_id, member_id, calorie_target, protein_ratio, carb_ratio, fat_ratio, 
          start_date, end_date, plan_status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        trainerId,
        memberId,
        macroRatios.target_calories,
        macroRatios.protein_ratio,
        macroRatios.carb_ratio,
        macroRatios.fat_ratio,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ]
    );

    await connection.query("COMMIT");

    return {
      success: true,
      macro_plan_id: macroPlanResult.insertId,
      calculations: suggestion.calculations,
      suggested: suggestion.suggested,
      adjusted_calories: macroRatios.target_calories,
      message: "คำนวณและสร้าง Macro Plan สำเร็จ",
    };
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Error suggesting macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการคำนวณ Macro Plan",
    };
  } finally {
    connection.release();
  }
}

/**
 * แนะนำ Macro Ratios สำหรับสร้างแผนใหม่
 * ใช้เมื่อยังไม่มี active macro plan ใน DB
 *
 * @param {Object} memberProfile - ข้อมูลสมาชิก
 * @param {Object} fitnessGoal - เป้าหมายการออกกำลังกาย
 * @returns {Object} suggested macro plan
 */
export async function suggestMacroRatios(memberProfile, fitnessGoal) {
  try {
    // แปลง goal type เป็นรูปแบบที่ใช้ใน utils
    let goalTypeForCalc = "maintain_weight";
    if (fitnessGoal) {
      if (fitnessGoal.fitness_goal_type === "ลดน้ำหนัก") {
        goalTypeForCalc = "lose_weight";
      } else if (fitnessGoal.fitness_goal_type === "เพิ่มกล้ามเนื้อ") {
        goalTypeForCalc = "gain_muscle";
      }
    }

    const experienceLevel = fitnessGoal?.fitness_experience_level || "beginner";
    const macroRatios = getDefaultMacroRatios(goalTypeForCalc, experienceLevel);

    // คำนวณ basic metrics
    const age = calcAge(memberProfile.member_dob);
    const bmr = calcBMR(
      memberProfile.member_health_weight,
      memberProfile.member_health_height,
      memberProfile.member_gender,
      age
    );
    const tdee = calcTDEE(bmr, memberProfile.member_activity_level);
    const adjustedCalories = adjustCaloriesForGoal(tdee, goalTypeForCalc);

    // คำนวณ macro grams
    const macroGrams = calcMacroGrams(adjustedCalories, macroRatios);

    return {
      success: true,
      suggested: {
        protein_ratio: macroRatios.protein,
        carb_ratio: macroRatios.carb,
        fat_ratio: macroRatios.fat,
        target_calories: adjustedCalories,
        macro_grams: macroGrams,
      },
      calculations: {
        bmr,
        tdee,
        adjusted_calories: adjustedCalories,
        goal_type: goalTypeForCalc,
        experience_level: experienceLevel,
      },
    };
  } catch (error) {
    console.error("Error suggesting macro ratios:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการแนะนำ macro ratios",
    };
  }
}

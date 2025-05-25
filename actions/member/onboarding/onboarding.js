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
} from "@/utils/nutrition-utils";

/**
 * บันทึกข้อมูลส่วนตัวจาก Step 1: Personal Profile
 * @param {number} memberId - รหัสสมาชิก
 * @param {Object} personalData - ข้อมูลส่วนตัว (weight, height, body fat %)
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึก
 */
export async function savePersonalProfile(memberId, personalData) {
  try {
    if (!memberId || !personalData) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const {
      member_health_weight,
      member_health_height,
      member_health_bodyfat,
    } = personalData;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!member_health_weight || !member_health_height) {
      throw new Error("กรุณากรอกน้ำหนักและส่วนสูงให้ครบถ้วน");
    }

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // บันทึกข้อมูลสุขภาพ (Upsert pattern)
      // ตรวจสอบว่ามีข้อมูลวันนี้แล้วหรือไม่
      const [existingHealth] = await db.query(
        `SELECT member_health_id FROM member_health 
         WHERE member_id = ? AND member_health_measurementdate = CURDATE()`,
        [memberId]
      );

      let healthResult;
      if (existingHealth.length > 0) {
        // อัพเดทข้อมูลที่มีอยู่
        [healthResult] = await db.query(
          `UPDATE member_health 
           SET member_health_weight = ?, member_health_height = ?, member_health_bodyfat = ?, update_at = NOW()
           WHERE member_health_id = ?`,
          [
            member_health_weight,
            member_health_height,
            member_health_bodyfat || null,
            existingHealth[0].member_health_id,
          ]
        );
        healthResult.insertId = existingHealth[0].member_health_id;
      } else {
        // สร้างข้อมูลใหม่
        [healthResult] = await db.query(
          `INSERT INTO member_health 
           (member_id, member_health_weight, member_health_height, member_health_bodyfat, member_health_measurementdate) 
           VALUES (?, ?, ?, ?, CURDATE())`,
          [
            memberId,
            member_health_weight,
            member_health_height,
            member_health_bodyfat || null,
          ]
        );
      }

      await db.query("COMMIT");

      return {
        success: true,
        member_health_id: healthResult.insertId,
        message: "บันทึกข้อมูลส่วนตัวสำเร็จ",
        isUpdate: existingHealth.length > 0,
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error saving personal profile:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว",
    };
  }
}

/**
 * บันทึกข้อมูลไลฟ์สไตล์จาก Step 2: Lifestyle Profile
 * @param {number} memberId - รหัสสมาชิก
 * @param {Object} lifestyleData - ข้อมูลไลฟ์สไตล์
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึก
 */
export async function saveLifestyleProfile(memberId, lifestyleData) {
  try {
    if (!memberId || !lifestyleData) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const {
      fitness_experience_level,
      fitness_training_frequency,
      member_activity_level,
      fitness_training_time,
    } = lifestyleData;

    // Debug: log ข้อมูลที่ได้รับ
    console.log("saveLifestyleProfile received:", {
      memberId,
      fitness_experience_level,
      fitness_training_frequency,
      member_activity_level,
      fitness_training_time,
    });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !fitness_experience_level ||
      fitness_training_frequency === null ||
      member_activity_level === null ||
      !fitness_training_time
    ) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // อัพเดท member_health ด้วย activity level
      await db.query(
        `UPDATE member_health 
         SET member_activity_level = ?
         WHERE member_id = ? 
         ORDER BY member_health_measurementdate DESC 
         LIMIT 1`,
        [member_activity_level, memberId]
      );

      // สร้าง fitness_goal record เบื้องต้น (จะอัพเดทใน step 3)
      // ตรวจสอบว่ามี goal ที่ active อยู่แล้วหรือไม่
      const [existingGoal] = await db.query(
        `SELECT fitness_goal_id FROM fitness_goal 
         WHERE member_id = ? AND fitness_goal_status = 'active'`,
        [memberId]
      );

      if (existingGoal.length === 0) {
        // สร้าง goal ใหม่ถ้ายังไม่มี
        await db.query(
          `INSERT INTO fitness_goal 
           (member_id, fitness_goal_type, fitness_training_frequency, fitness_experience_level, 
            fitness_training_time, fitness_goal_startdate, fitness_goal_enddate, fitness_goal_status) 
           VALUES (?, 'pending', ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH), 'active')`,
          [
            memberId,
            fitness_training_frequency,
            fitness_experience_level,
            fitness_training_time,
          ]
        );
      } else {
        // อัพเดท goal ที่มีอยู่
        await db.query(
          `UPDATE fitness_goal 
           SET fitness_training_frequency = ?, fitness_experience_level = ?, fitness_training_time = ?
           WHERE fitness_goal_id = ?`,
          [
            fitness_training_frequency,
            fitness_experience_level,
            fitness_training_time,
            existingGoal[0].fitness_goal_id,
          ]
        );
      }

      await db.query("COMMIT");

      return {
        success: true,
        message: "บันทึกข้อมูลไลฟ์สไตล์สำเร็จ",
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error saving lifestyle profile:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลไลฟ์สไตล์",
    };
  }
}

/**
 * บันทึกเป้าหมายจาก Step 3: Fitness Goals
 * @param {number} memberId - รหัสสมาชิก
 * @param {Object} goalsData - ข้อมูลเป้าหมาย
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึก
 */
export async function saveFitnessGoals(memberId, goalsData) {
  try {
    if (!memberId || !goalsData) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const {
      fitness_goal_type,
      fitness_goal_targetweight,
      fitness_desired_time,
    } = goalsData;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!fitness_goal_type || fitness_desired_time === null) {
      throw new Error("กรุณาเลือกประเภทเป้าหมายและกรอบเวลา");
    }

    // แปลง fitness_desired_time (0,1,2,3) เป็นจำนวนสัปดาห์
    const timelineMapping = { 0: 4, 1: 8, 2: 12, 3: 16 };
    const weeks = timelineMapping[fitness_desired_time] || 12;

    // คำนวณวันสิ้นสุดจากจำนวนสัปดาห์
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + weeks * 7);

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // อัพเดท fitness_goal ที่มีอยู่
      await db.query(
        `UPDATE fitness_goal 
         SET fitness_goal_type = ?, fitness_goal_targetweight = ?, fitness_desired_time = ?,
             fitness_goal_startdate = ?, fitness_goal_enddate = ?, update_at = NOW()
         WHERE member_id = ? AND fitness_goal_status = 'active'`,
        [
          fitness_goal_type,
          fitness_goal_targetweight || null,
          fitness_desired_time,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
          memberId,
        ]
      );

      await db.query("COMMIT");

      return {
        success: true,
        message: "บันทึกเป้าหมายสำเร็จ",
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error saving fitness goals:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการบันทึกเป้าหมาย",
    };
  }
}

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

/**
 * ดึงข้อมูลสำหรับ Onboarding (ตรวจสอบว่าทำ onboarding แล้วหรือยัง)
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูล onboarding status
 */
export async function getOnboardingStatus(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    // ตรวจสอบว่ามีข้อมูลสุขภาพหรือไม่
    const [healthData] = await db.query(
      `SELECT member_health_id FROM member_health WHERE member_id = ? LIMIT 1`,
      [memberId]
    );

    // ตรวจสอบว่ามีเป้าหมายหรือไม่ (ที่ไม่ใช่ pending)
    const [goalData] = await db.query(
      `SELECT fitness_goal_id FROM fitness_goal 
       WHERE member_id = ? AND fitness_goal_type != 'pending' LIMIT 1`,
      [memberId]
    );

    // ตรวจสอบว่ามี macro plan หรือไม่
    const [macroData] = await db.query(
      `SELECT macro_plan_id FROM macro_plan WHERE member_id = ? LIMIT 1`,
      [memberId]
    );

    const hasCompletedOnboarding =
      healthData.length > 0 && goalData.length > 0 && macroData.length > 0;

    return {
      success: true,
      has_health_data: healthData.length > 0,
      has_goal_data: goalData.length > 0,
      has_macro_plan: macroData.length > 0,
      completed_onboarding: hasCompletedOnboarding,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ onboarding",
    };
  }
}

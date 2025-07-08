"use server";

import pool from "@/lib/db";
import {
  validateMacroRatiosWithMessage,
  generateMacroPlanSummary,
} from "@/utils/macro-utils";

/**
 * อัปเดต Macro Plan แบบกำหนด Ratios
 *
 * @param {number} macroPlanId - รหัส macro plan ที่ต้องการแก้ไข
 * @param {number} trainerId - รหัส trainer (สำหรับตรวจสอบสิทธิ์)
 * @param {number} calorieTarget - เป้าหมายแคลอรี่ใหม่
 * @param {number} proteinRatio - สัดส่วนโปรตีนใหม่ (%)
 * @param {number} carbRatio - สัดส่วนคาร์บใหม่ (%)
 * @param {number} fatRatio - สัดส่วนไขมันใหม่ (%)
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต macro plan
 */
export async function updateRatioMacro(
  macroPlanId,
  trainerId,
  calorieTarget,
  proteinRatio,
  carbRatio,
  fatRatio
) {
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบ input parameters
    if (!macroPlanId || !trainerId) {
      throw new Error("ต้องระบุ macroPlanId และ trainerId");
    }

    if (!calorieTarget || calorieTarget <= 0) {
      throw new Error("เป้าหมายแคลอรี่ต้องมากกว่า 0");
    }

    if (proteinRatio < 0 || carbRatio < 0 || fatRatio < 0) {
      throw new Error("สัดส่วนทั้งหมดต้องเป็นบวก");
    }

    // ตรวจสอบว่า ratios รวมเป็น 100%
    const ratioValidation = validateMacroRatiosWithMessage(
      proteinRatio,
      carbRatio,
      fatRatio
    );
    if (!ratioValidation.isValid) {
      throw new Error(ratioValidation.message);
    }

    await connection.query("START TRANSACTION");

    // ดึงข้อมูล macro plan เดิมและตรวจสอบสิทธิ์
    const [existingPlan] = await connection.query(
      `SELECT mp.*, m.member_firstname, m.member_lastname, t.trainer_firstname, t.trainer_lastname
       FROM macro_plan mp
       JOIN member m ON mp.member_id = m.member_id  
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       WHERE mp.macro_plan_id = ? AND mp.trainer_id = ?`,
      [macroPlanId, trainerId]
    );

    if (!existingPlan || existingPlan.length === 0) {
      throw new Error("ไม่พบ macro plan หรือ trainer ไม่มีสิทธิ์แก้ไข");
    }

    const currentPlan = existingPlan[0];

    // อัปเดต macro plan ด้วยข้อมูลใหม่
    await connection.query(
      `UPDATE macro_plan 
       SET calorie_target = ?, protein_ratio = ?, carb_ratio = ?, fat_ratio = ?
       WHERE macro_plan_id = ?`,
      [calorieTarget, proteinRatio, carbRatio, fatRatio, macroPlanId]
    );

    await connection.query("COMMIT");

    // สร้างสรุปข้อมูลที่อัปเดต
    const macroData = {
      calorie_target: calorieTarget,
      protein_ratio: proteinRatio,
      carb_ratio: carbRatio,
      fat_ratio: fatRatio,
    };

    const summary = generateMacroPlanSummary(macroData);

    return {
      success: true,
      macro_plan_id: macroPlanId,
      mode: "ratios",
      member: {
        id: currentPlan.member_id,
        name: `${currentPlan.member_fname} ${currentPlan.member_lname}`,
      },
      trainer: {
        id: currentPlan.trainer_id,
        name: `${currentPlan.trainer_fname} ${currentPlan.trainer_lname}`,
      },
      macro_data: macroData,
      summary: summary,
      period: {
        start_date: currentPlan.start_date,
        end_date: currentPlan.end_date,
        status: currentPlan.plan_status,
      },
      message: "อัปเดต Macro Plan (แบบสัดส่วน) สำเร็จ",
    };
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Error updating ratio macro plan:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการอัปเดต Macro Plan แบบสัดส่วน",
    };
  } finally {
    connection.release();
  }
}

/**
 * ดึงข้อมูล Macro Plan ปัจจุบันสำหรับแสดงผลก่อนแก้ไข
 *
 * @param {number} macroPlanId - รหัส macro plan
 * @param {number} trainerId - รหัส trainer (สำหรับตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} ข้อมูล macro plan ปัจจุบัน
 */
export async function getCurrentMacroPlan(macroPlanId, trainerId) {
  const connection = await pool.getConnection();

  try {
    const [planData] = await connection.query(
      `SELECT mp.*, m.member_firstname, m.member_lastname, t.trainer_firstname, t.trainer_lastname
       FROM macro_plan mp
       JOIN member m ON mp.member_id = m.member_id  
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       WHERE mp.macro_plan_id = ? AND mp.trainer_id = ?`,
      [macroPlanId, trainerId]
    );

    if (!planData || planData.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูล macro plan หรือ trainer ไม่มีสิทธิ์เข้าถึง",
      };
    }

    const plan = planData[0];

    const macroData = {
      calorie_target: plan.calorie_target,
      protein_ratio: plan.protein_ratio,
      carb_ratio: plan.carb_ratio,
      fat_ratio: plan.fat_ratio,
    };

    const summary = generateMacroPlanSummary(macroData);

    return {
      success: true,
      plan: {
        macro_plan_id: plan.macro_plan_id,
        member: {
          id: plan.member_id,
          name: `${plan.member_firstname} ${plan.member_lastname}`,
        },
        trainer: {
          id: plan.trainer_id,
          name: `${plan.trainer_firstname} ${plan.trainer_lastname}`,
        },
        macros: macroData,
        period: {
          start_date: plan.start_date,
          end_date: plan.end_date,
          status: plan.plan_status,
        },
        created_at: plan.created_at,
      },
      summary,
    };
  } catch (error) {
    console.error("Error getting current macro plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล macro plan",
    };
  } finally {
    connection.release();
  }
}

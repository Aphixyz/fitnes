"use server";

import pool from "@/lib/db";
import {
  validateMacroRatiosWithMessage,
  generateMacroPlanSummary,
} from "@/utils/macro-utils";

/**
 * สร้าง Macro Plan แบบกำหนด Ratios
 *
 * @param {number} trainerId - รหัส trainer
 * @param {number} memberId - รหัส member
 * @param {number} calorieTarget - เป้าหมายแคลอรี่
 * @param {number} proteinRatio - สัดส่วนโปรตีน (%)
 * @param {number} carbRatio - สัดส่วนคาร์บ (%)
 * @param {number} fatRatio - สัดส่วนไขมัน (%)
 * @returns {Promise<Object>} ผลลัพธ์การสร้าง macro plan
 */
export async function createRatioMacro(
  trainerId,
  memberId,
  calorieTarget,
  proteinRatio,
  carbRatio,
  fatRatio
) {
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบ input parameters
    if (!trainerId || !memberId) {
      throw new Error("ต้องระบุ trainerId และ memberId");
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

    // ตรวจสอบว่า trainer และ member มีอยู่จริง
    const [trainerCheck] = await connection.query(
      `SELECT trainer_id FROM trainer WHERE trainer_id = ?`,
      [trainerId]
    );

    if (!trainerCheck || trainerCheck.length === 0) {
      throw new Error("ไม่พบข้อมูล trainer");
    }

    const [memberCheck] = await connection.query(
      `SELECT member_id FROM member WHERE member_id = ?`,
      [memberId]
    );

    if (!memberCheck || memberCheck.length === 0) {
      throw new Error("ไม่พบข้อมูล member");
    }

    // ตรวจสอบว่า trainer มีสิทธิ์ในการจัดการ member คนนี้
    const [registrationCheck] = await connection.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 'active'`,
      [trainerId, memberId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("Trainer ไม่มีสิทธิ์จัดการแผนของ member คนนี้");
    }

    // ปิด macro plan เก่าที่ active อยู่ (ถ้ามี)
    await connection.query(
      `UPDATE macro_plan SET plan_status = 'inactive' 
       WHERE member_id = ? AND plan_status = 'active'`,
      [memberId]
    );

    // สร้าง macro plan ใหม่ (ระยะเวลา 3 เดือน)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 3);

    const [result] = await connection.query(
      `INSERT INTO macro_plan 
       (trainer_id, member_id, calorie_target, protein_ratio, carb_ratio, fat_ratio, 
        start_date, end_date, plan_status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        trainerId,
        memberId,
        calorieTarget,
        proteinRatio,
        carbRatio,
        fatRatio,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ]
    );

    await connection.query("COMMIT");

    // สร้างสรุปแผนที่สร้าง
    const macroData = {
      calorie_target: calorieTarget,
      protein_ratio: proteinRatio,
      carb_ratio: carbRatio,
      fat_ratio: fatRatio,
    };

    const summary = generateMacroPlanSummary(macroData);

    return {
      success: true,
      macro_plan_id: result.insertId,
      mode: "ratios",
      macro_data: macroData,
      summary,
      period: {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        duration_months: 3,
      },
      message: "สร้าง Macro Plan (แบบสัดส่วน) สำเร็จ",
    };
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Error creating ratio macro plan:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการสร้าง Macro Plan แบบสัดส่วน",
    };
  } finally {
    connection.release();
  }
}

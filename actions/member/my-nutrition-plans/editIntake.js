"use server";

import pool from "@/lib/db";
import { getActiveMacroPlan } from "@/actions/shared/getActiveMacroPlan";

/**
 * แก้ไขข้อมูล nutrition intake record
 * @param {number} intakeId - ID ของ intake record
 * @param {number} memberId - ID ของสมาชิก (เพื่อความปลอดภัย)
 * @param {Object} data - ข้อมูลที่ต้องการแก้ไข
 * @param {string} data.date - วันที่ (YYYY-MM-DD)
 * @param {number} data.calories - แคลอรี่
 * @param {number} data.protein - โปรตีน (กรัม)
 * @param {number} data.carb - คาร์โบไฮเดรต (กรัม)
 * @param {number} data.fat - ไขมัน (กรัม)
 * @returns {Promise<Object>} ข้อมูลที่แก้ไขแล้ว
 */
export async function editIntakeRecord(intakeId, memberId, data) {
  try {
    // Validate input
    if (!intakeId || typeof intakeId !== "number") {
      throw new Error("Intake ID is required and must be a number");
    }

    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Data object is required");
    }

    // Validate required fields
    const { date, calories, protein, carb, fat } = data;

    if (!date) {
      throw new Error("Date is required");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    // Validate numeric values
    if (calories !== undefined && (isNaN(calories) || calories < 0)) {
      throw new Error("Calories must be a positive number");
    }

    if (protein !== undefined && (isNaN(protein) || protein < 0)) {
      throw new Error("Protein must be a positive number");
    }

    if (carb !== undefined && (isNaN(carb) || carb < 0)) {
      throw new Error("Carb must be a positive number");
    }

    if (fat !== undefined && (isNaN(fat) || fat < 0)) {
      throw new Error("Fat must be a positive number");
    }

    // ตรวจสอบว่า record นี้เป็นของ member นี้จริงหรือไม่
    const checkQuery = `
      SELECT intake_id FROM intake_logs 
      WHERE intake_id = ? AND member_id = ?
      LIMIT 1
    `;

    const [checkRows] = await pool.execute(checkQuery, [intakeId, memberId]);

    if (checkRows.length === 0) {
      throw new Error("Intake record not found or access denied");
    }

    // ดึงข้อมูล active macro plan สำหรับวันที่ใหม่
    const activeMacroPlan = await getActiveMacroPlan(memberId, date);
    const macroPlanId = activeMacroPlan ? activeMacroPlan.macro_plan_id : null;

    // อัพเดทข้อมูล
    const updateQuery = `
      UPDATE intake_logs 
      SET 
        macro_plan_id = ?,
        date = ?,
        calories = ?,
        protein = ?,
        carb = ?,
        fat = ?
      WHERE intake_id = ? AND member_id = ?
    `;

    await pool.execute(updateQuery, [
      macroPlanId,
      date,
      calories || 0,
      protein || 0,
      carb || 0,
      fat || 0,
      intakeId,
      memberId,
    ]);

    // ดึงข้อมูลที่อัพเดทแล้ว
    const selectQuery = `
      SELECT 
        intake_id,
        member_id,
        macro_plan_id,
        date,
        calories,
        protein,
        carb,
        fat,
        create_at
      FROM intake_logs 
      WHERE intake_id = ? AND member_id = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(selectQuery, [intakeId, memberId]);

    if (rows.length === 0) {
      throw new Error("Failed to retrieve updated record");
    }

    const updatedIntake = rows[0];

    return {
      intake_id: updatedIntake.intake_id,
      member_id: updatedIntake.member_id,
      macro_plan_id: updatedIntake.macro_plan_id,
      date: updatedIntake.date,
      calories: parseFloat(updatedIntake.calories) || 0,
      protein: parseFloat(updatedIntake.protein) || 0,
      carb: parseFloat(updatedIntake.carb) || 0,
      fat: parseFloat(updatedIntake.fat) || 0,
      create_at: updatedIntake.create_at,
    };
  } catch (error) {
    console.error("Error editing intake record:", error);
    throw new Error(`Failed to edit intake record: ${error.message}`);
  }
}

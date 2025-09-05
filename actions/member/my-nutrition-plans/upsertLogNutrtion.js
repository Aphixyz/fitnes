"use server";

import pool from "@/lib/db";
import { getActiveMacroPlan } from "@/actions/shared/getActiveMacroPlan";

/**
 * บันทึกข้อมูล macro intake ประจำวัน (แบบสะสม) ลง intake_logs
 * @param {Object} params - พารามิเตอร์สำหรับบันทึก intake log
 * @param {number} params.memberId - ID ของสมาชิก
 * @param {string} params.date - วันที่บันทึก (YYYY-MM-DD)
 * @param {number} params.calories - จำนวน calories ที่จะเพิ่ม
 * @param {number} params.protein - จำนวน protein (กรัม) ที่จะเพิ่ม
 * @param {number} params.carb - จำนวน carbohydrate (กรัม) ที่จะเพิ่ม
 * @param {number} params.fat - จำนวน fat (กรัม) ที่จะเพิ่ม
 * @returns {Promise<Object>} ผลลัพธ์การบันทึกข้อมูล
 */
export async function InsertLogNutrition({
  memberId,
  date,
  calories,
  protein,
  carb,
  fat,
}) {
  try {
    // Validate input parameters
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    if (!date || typeof date !== "string") {
      throw new Error("Date is required and must be a string (YYYY-MM-DD)");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    // Validate macro values (must be non-negative numbers)
    const macros = { calories, protein, carb, fat };
    for (const [key, value] of Object.entries(macros)) {
      if (value === null || value === undefined) {
        throw new Error(`${key} is required`);
      }
      if (typeof value !== "number" || value < 0) {
        throw new Error(`${key} must be a non-negative number`);
      }
    }

    // ดึงข้อมูล active macro plan สำหรับวันนี้
    const activeMacroPlan = await getActiveMacroPlan(memberId, date);
    const macroPlanId = activeMacroPlan ? activeMacroPlan.macro_plan_id : null;

    // เช็คว่ามี record สำหรับ member และ date นี้อยู่แล้วไหม
    const checkExistingQuery = `
      SELECT 
        intake_id,
        macro_plan_id,
        calories,
        protein,
        carb,
        fat
      FROM intake_logs 
      WHERE member_id = ? AND date = ?
    `;

    const [existingRows] = await pool.execute(checkExistingQuery, [
      memberId,
      date,
    ]);

    if (existingRows.length > 0) {
      // มี record อยู่แล้ว = UPDATE แบบบวกสะสม (accumulative)
      const existing = existingRows[0];
      const newCalories = existing.calories + calories;
      const newProtein = existing.protein + protein;
      const newCarb = existing.carb + carb;
      const newFat = existing.fat + fat;

      const updateQuery = `
        UPDATE intake_logs 
        SET 
          macro_plan_id = ?,
          calories = ?,
          protein = ?,
          carb = ?,
          fat = ?
        WHERE member_id = ? AND date = ?
      `;

      await pool.execute(updateQuery, [
        macroPlanId,
        newCalories,
        newProtein,
        newCarb,
        newFat,
        memberId,
        date,
      ]);

      return {
        success: true,
        action: "accumulated",
        intake_id: existing.intake_id,
        member_id: memberId,
        macro_plan_id: macroPlanId,
        date: date,
        // ค่าที่เพิ่มในครั้งนี้
        added_calories: calories,
        added_protein: protein,
        added_carb: carb,
        added_fat: fat,
        // ยอดรวมใหม่หลังจากบวกสะสม
        total_calories: newCalories,
        total_protein: newProtein,
        total_carb: newCarb,
        total_fat: newFat,
        message: "Nutrition intake accumulated successfully",
      };
    } else {
      // ไม่มี record = INSERT record ใหม่
      const insertQuery = `
        INSERT INTO intake_logs (member_id, macro_plan_id, date, calories, protein, carb, fat)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [insertResult] = await pool.execute(insertQuery, [
        memberId,
        macroPlanId,
        date,
        calories,
        protein,
        carb,
        fat,
      ]);

      return {
        success: true,
        action: "created",
        intake_id: insertResult.insertId,
        member_id: memberId,
        macro_plan_id: macroPlanId,
        date: date,
        // ค่าที่เพิ่มในครั้งนี้ (เป็นครั้งแรกของวัน)
        added_calories: calories,
        added_protein: protein,
        added_carb: carb,
        added_fat: fat,
        // ยอดรวม (เท่ากับค่าที่เพิ่มเพราะเป็นครั้งแรก)
        total_calories: calories,
        total_protein: protein,
        total_carb: carb,
        total_fat: fat,
        message: "Nutrition intake log created successfully",
      };
    }
  } catch (error) {
    console.error("Error inserting/accumulating nutrition log:", error);

    // Return error response
    return {
      success: false,
      error: error.message,
      message: "Failed to save nutrition intake log",
    };
  }
}

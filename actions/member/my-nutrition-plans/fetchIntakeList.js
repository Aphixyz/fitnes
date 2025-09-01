"use server";

import pool from "@/lib/db";

/**
 * ดึงประวัติ nutrition intake list ของ member
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Array>} รายการ intake logs ตามช่วงวันที่
 */
export async function fetchIntakeList(memberId, startDate, endDate) {
  try {
    // Validate input
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }

    const query = `
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
      WHERE member_id = ? 
        AND date >= ? 
        AND date <= ?
      ORDER BY date DESC, create_at DESC
    `;

    const [rows] = await pool.execute(query, [memberId, startDate, endDate]);

    return rows.map((intake) => ({
      intake_id: intake.intake_id,
      member_id: intake.member_id,
      macro_plan_id: intake.macro_plan_id,
      date: intake.date,
      calories: parseFloat(intake.calories) || 0,
      protein: parseFloat(intake.protein) || 0,
      carb: parseFloat(intake.carb) || 0,
      fat: parseFloat(intake.fat) || 0,
      create_at: intake.create_at,
    }));
  } catch (error) {
    console.error("Error fetching intake list:", error);
    throw new Error(`Failed to fetch intake list: ${error.message}`);
  }
}

/**
 * ดึงข้อมูล intake record เดียวตาม ID
 * @param {number} intakeId - ID ของ intake record
 * @param {number} memberId - ID ของสมาชิก (เพื่อความปลอดภัย)
 * @returns {Promise<Object|null>} ข้อมูล intake record หรือ null ถ้าไม่พบ
 */
export async function fetchIntakeById(intakeId, memberId) {
  try {
    // Validate input
    if (!intakeId || typeof intakeId !== "number") {
      throw new Error("Intake ID is required and must be a number");
    }

    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    const query = `
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

    const [rows] = await pool.execute(query, [intakeId, memberId]);

    // ถ้าไม่พบข้อมูล return null
    if (rows.length === 0) {
      return null;
    }

    const intake = rows[0];

    return {
      intake_id: intake.intake_id,
      member_id: intake.member_id,
      macro_plan_id: intake.macro_plan_id,
      date: intake.date,
      calories: parseFloat(intake.calories) || 0,
      protein: parseFloat(intake.protein) || 0,
      carb: parseFloat(intake.carb) || 0,
      fat: parseFloat(intake.fat) || 0,
      create_at: intake.create_at,
    };
  } catch (error) {
    console.error("Error fetching intake by ID:", error);
    throw new Error(`Failed to fetch intake by ID: ${error.message}`);
  }
}

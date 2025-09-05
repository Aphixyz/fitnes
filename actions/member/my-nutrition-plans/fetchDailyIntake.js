"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล nutrition intake รายวันของ member
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} date - วันที่ต้องการดู (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Object|null>} ข้อมูล intake รายวัน หรือ null ถ้าไม่พบ
 */
export async function fetchDailyIntake(memberId, date = null) {
  try {
    // Validate input
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    // ใช้วันนี้ถ้าไม่ได้ระบุวันที่
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      throw new Error("Date must be in YYYY-MM-DD format");
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
      WHERE member_id = ? AND date = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [memberId, targetDate]);

    // ถ้าไม่พบข้อมูล return null
    if (rows.length === 0) {
      return null;
    }

    const intake = rows[0];

    // Format ข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
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
    console.error("Error fetching daily intake:", error);
    throw new Error(`Failed to fetch daily intake: ${error.message}`);
  }
}

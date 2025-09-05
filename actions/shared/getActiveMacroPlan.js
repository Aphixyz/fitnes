"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล active macro plan ของสมาชิกในวันที่กำหนด
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} date - วันที่ต้องการตรวจสอบ (YYYY-MM-DD)
 * @returns {Promise<Object|null>} ข้อมูล macro plan ที่ active หรือ null ถ้าไม่พบ
 */
export async function getActiveMacroPlan(memberId, date) {
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

    // ค้นหา active macro plan ที่ครอบคลุมวันที่กำหนด
    // เงื่อนไข: plan_status = 'active' และ start_date <= date <= end_date
    // หากมีหลายแผนที่ active ในวันเดียวกัน จะเอาที่ created_at ล่าสุด
    const query = `
      SELECT 
        macro_plan_id,
        trainer_id,
        member_id,
        calorie_target,
        protein_ratio,
        carb_ratio,
        fat_ratio,
        start_date,
        end_date,
        plan_status,
        created_at
      FROM macro_plan 
      WHERE member_id = ? 
        AND plan_status = 'active'
        AND start_date <= ?
        AND end_date >= ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [memberId, date, date]);

    // ถ้าไม่พบ active macro plan return null
    if (rows.length === 0) {
      return null;
    }

    const macroPlan = rows[0];

    // Format ข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
    return {
      macro_plan_id: macroPlan.macro_plan_id,
      trainer_id: macroPlan.trainer_id,
      member_id: macroPlan.member_id,
      calorie_target: macroPlan.calorie_target,
      protein_ratio: parseFloat(macroPlan.protein_ratio) || 0,
      carb_ratio: parseFloat(macroPlan.carb_ratio) || 0,
      fat_ratio: parseFloat(macroPlan.fat_ratio) || 0,
      start_date: macroPlan.start_date,
      end_date: macroPlan.end_date,
      plan_status: macroPlan.plan_status,
      created_at: macroPlan.created_at,
    };
  } catch (error) {
    console.error("Error fetching active macro plan:", error);
    // Return null instead of throwing error to allow intake operations to continue
    // even when no active macro plan exists
    return null;
  }
}
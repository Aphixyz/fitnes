"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล active nutrition plan ของ member
 * @param {number} memberId - ID ของสมาชิก
 * @returns {Promise<Object|null>} ข้อมูล macro plan ที่ active หรือ null ถ้าไม่พบ
 */
export async function fetchNutritionPlans(memberId) {
  try {
    // Validate input
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    // Query สำหรับดึง active macro plan ของ member
    const query = `
      SELECT 
        macro_plan_id,
        trainer_id,
        member_id,
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
        AND start_date <= CURDATE() 
        AND end_date >= CURDATE()
      ORDER BY start_date DESC 
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [memberId]);

    // ถ้าไม่พบข้อมูล return null
    if (rows.length === 0) {
      return null;
    }

    const plan = rows[0];

    // Format ข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
    return {
      macro_plan_id: plan.macro_plan_id,
      trainer_id: plan.trainer_id,
      member_id: plan.member_id,
      protein_ratio: parseFloat(plan.protein_ratio), // แปลงเป็น number
      carb_ratio: parseFloat(plan.carb_ratio),
      fat_ratio: parseFloat(plan.fat_ratio),
      start_date: plan.start_date,
      end_date: plan.end_date,
      plan_status: plan.plan_status,
      created_at: plan.created_at,
      // หมายเหตุ: เพื่อคำนวณ calories, protein_g, carbs_g, fat_g จริงๆ
      // ต้องนำ ratio มาคูณกับ target calories ที่ได้จากการคำนวณ TDEE
    };
  } catch (error) {
    console.error("Error fetching nutrition plans:", error);
    throw new Error(`Failed to fetch nutrition plans: ${error.message}`);
  }
}

/**
 * ดึงข้อมูล macro plan ทั้งหมดของ member (ไม่เช็ควันที่)
 * @param {number} memberId - ID ของสมาชิก
 * @returns {Promise<Array>} รายการ macro plans ทั้งหมด
 */
export async function fetchAllNutritionPlans(memberId) {
  try {
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    const query = `
      SELECT 
        macro_plan_id,
        trainer_id,
        member_id,
        protein_ratio,
        carb_ratio,
        fat_ratio,
        start_date,
        end_date,
        plan_status,
        created_at
      FROM macro_plan 
      WHERE member_id = ?
      ORDER BY create_at DESC
    `;

    const [rows] = await pool.execute(query, [memberId]);

    return rows.map((plan) => ({
      macro_plan_id: plan.macro_plan_id,
      trainer_id: plan.trainer_id,
      member_id: plan.member_id,
      protein_ratio: parseFloat(plan.protein_ratio),
      carb_ratio: parseFloat(plan.carb_ratio),
      fat_ratio: parseFloat(plan.fat_ratio),
      start_date: plan.start_date,
      end_date: plan.end_date,
      plan_status: plan.plan_status,
      created_at: plan.created_at,
    }));
  } catch (error) {
    console.error("Error fetching all nutrition plans:", error);
    throw new Error(`Failed to fetch all nutrition plans: ${error.message}`);
  }
}

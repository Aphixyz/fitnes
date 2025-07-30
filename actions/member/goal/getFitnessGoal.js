"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Fitness Goal History ของ member
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูล fitness goal history
 */
export async function getFitnessGoalHistory(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // Query ข้อมูล fitness goal history จาก database
    const [rows] = await pool.query(
      `SELECT 
        fitness_goal_id,
        member_id,
        fitness_goal_type,
        fitness_training_frequency,
        fitness_experience_level,
        fitness_goal_targetweight,
        fitness_training_time,
        fitness_desired_time,
        fitness_goal_startdate,
        fitness_goal_enddate,
        fitness_goal_status,
        create_at,
        update_at
      FROM fitness_goal 
      WHERE member_id = ? 
      ORDER BY create_at DESC`,
      [memberId]
    );

    // แปลงข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
    const fitnessGoals = rows.map((row) => ({
      id: row.fitness_goal_id,
      memberId: row.member_id,
      goalType: row.fitness_goal_type,
      trainingFrequency: row.fitness_training_frequency,
      experienceLevel: row.fitness_experience_level,
      targetWeight: row.fitness_goal_targetweight,
      trainingTime: row.fitness_training_time,
      desiredTime: row.fitness_desired_time,
      startDate: row.fitness_goal_startdate,
      endDate: row.fitness_goal_enddate,
      status: row.fitness_goal_status,
      createdAt: row.create_at,
      updatedAt: row.update_at,
    }));

    return {
      success: true,
      data: fitnessGoals,
      count: fitnessGoals.length,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Fitness Goal History:", error);
    throw new Error("ไม่สามารถดึงข้อมูล Fitness Goal History ได้");
  }
}

/**
 * ดึงข้อมูล Fitness Goal ปัจจุบัน (active) ของ member
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูล fitness goal ปัจจุบัน
 */
export async function getCurrentFitnessGoal(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // Query ข้อมูล fitness goal ปัจจุบัน
    const [rows] = await pool.query(
      `SELECT 
        fitness_goal_id,
        member_id,
        fitness_goal_type,
        fitness_training_frequency,
        fitness_experience_level,
        fitness_goal_targetweight,
        fitness_training_time,
        fitness_desired_time,
        fitness_goal_startdate,
        fitness_goal_enddate,
        fitness_goal_status,
        create_at,
        update_at
      FROM fitness_goal 
      WHERE member_id = ? AND fitness_goal_status = 'active'
      ORDER BY create_at DESC
      LIMIT 1`,
      [memberId]
    );

    if (rows.length === 0) {
      return {
        success: true,
        data: null,
        message: "ไม่พบ fitness goal ที่ active",
      };
    }

    const currentGoal = {
      id: rows[0].fitness_goal_id,
      memberId: rows[0].member_id,
      goalType: rows[0].fitness_goal_type,
      trainingFrequency: rows[0].fitness_training_frequency,
      experienceLevel: rows[0].fitness_experience_level,
      targetWeight: rows[0].fitness_goal_targetweight,
      trainingTime: rows[0].fitness_training_time,
      desiredTime: rows[0].fitness_desired_time,
      startDate: rows[0].fitness_goal_startdate,
      endDate: rows[0].fitness_goal_enddate,
      status: rows[0].fitness_goal_status,
      createdAt: rows[0].create_at,
      updatedAt: rows[0].update_at,
    };

    return {
      success: true,
      data: currentGoal,
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Fitness Goal ปัจจุบัน:", error);
    throw new Error("ไม่สามารถดึงข้อมูล Fitness Goal ปัจจุบันได้");
  }
}

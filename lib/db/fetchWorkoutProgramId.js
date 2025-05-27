"use server";

import pool from "@/lib/db";

export async function fetchWorkoutProgramId(programId, trainerId) {
  const connection = await pool.getConnection();
  
  try {
    // ตรวจสอบว่า programId ถูกต้องและเป็นของ trainer นั้น
    const [rows] = await connection.query(
      `SELECT wp.*, plan.trainer_id, plan.workout_plan_id, plan.member_id
       FROM workout_program wp
       JOIN workout_plan plan ON wp.workout_plan_id = plan.workout_plan_id
       WHERE wp.workout_program_id = ? AND plan.trainer_id = ?`,
      [programId, trainerId]
    );

    if (!rows.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบโปรแกรมที่ระบุหรือคุณไม่มีสิทธิ์เข้าถึงโปรแกรมนี้",
      };
    }

    return {
      success: true,
      program: rows[0],
    };
  } catch (error) {
    console.error("Error fetching workout program:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรม",
    };
  } finally {
    connection.release();
  }
}
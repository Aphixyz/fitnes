"use server";

import pool from "../../../lib/db.js";

/**
 * ดึงข้อมูล workout programs พร้อม exercises สำหรับ Dashboard
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} ข้อมูล workout programs พร้อม exercises
 */
export async function fetchWorkoutProgramsForDashboard(memberId) {
  try {
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    const connection = await pool.getConnection();

    // Query เพื่อดึงข้อมูล active workout programs พร้อม exercises
    const query = `
      SELECT 
        wprog.workout_program_id,
        wprog.program_name,
        wprog.program_note,
        wprog.order_index as program_order,
        wp.plan_name,
        
        pe.program_exercise_id,
        pe.exercise_id,
        pe.order_index as exercise_order,
        pe.rest as exercise_rest,
        
        pes.program_exercise_set_id,
        pes.set_order,
        pes.weight,
        pes.reps,
        pes.time,
        pes.distance
        
      FROM workout_plan wp
      JOIN workout_program wprog ON wp.workout_plan_id = wprog.workout_plan_id
      LEFT JOIN program_exercise pe ON wprog.workout_program_id = pe.workout_program_id
      LEFT JOIN program_exercise_set pes ON pe.program_exercise_id = pes.program_exercise_id
      
      WHERE wp.member_id = ? 
      AND wp.plan_status = 'active'
      AND CURDATE() BETWEEN wp.plan_startdate AND wp.plan_enddate
      
      ORDER BY 
        wprog.order_index ASC,
        pe.order_index ASC,
        pes.set_order ASC
    `;

    const [rows] = await connection.execute(query, [memberId]);
    connection.release();

    // ถ้าไม่มีข้อมูล
    if (rows.length === 0) {
      return {
        success: true,
        data: {
          availablePrograms: []
        }
      };
    }

    // จัดกลุ่มข้อมูลให้เป็น nested structure
    const programMap = new Map();
    const exerciseMap = new Map();

    rows.forEach((row) => {
      // จัดการ Workout Programs
      if (row.workout_program_id && !programMap.has(row.workout_program_id)) {
        const program = {
          workout_program_id: row.workout_program_id,
          program_name: row.program_name,
          program_note: row.program_note,
          order_index: row.program_order,
          plan_name: row.plan_name,
          exercises: []
        };

        programMap.set(row.workout_program_id, program);
      }

      // จัดการ Exercises
      if (row.program_exercise_id && !exerciseMap.has(row.program_exercise_id)) {
        const exercise = {
          program_exercise_id: row.program_exercise_id,
          exercise_id: row.exercise_id,
          order_index: row.exercise_order,
          rest: row.exercise_rest,
          sets: []
        };

        exerciseMap.set(row.program_exercise_id, exercise);
        
        // เพิ่ม exercise เข้าไปใน program ที่ถูกต้อง
        const program = programMap.get(row.workout_program_id);
        if (program) {
          program.exercises.push(exercise);
        }
      }

      // จัดการ Exercise Sets
      if (row.program_exercise_set_id) {
        const set = {
          program_exercise_set_id: row.program_exercise_set_id,
          set_order: row.set_order,
          weight: row.weight,
          reps: row.reps,
          time: row.time,
          distance: row.distance
        };

        const exercise = exerciseMap.get(row.program_exercise_id);
        if (exercise) {
          exercise.sets.push(set);
        }
      }
    });

    // แปลงจาก Map เป็น Array และเรียงลำดับ
    const availablePrograms = Array.from(programMap.values())
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    // เรียงลำดับ exercises และ sets ใน programs
    availablePrograms.forEach(program => {
      program.exercises.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      program.exercises.forEach(exercise => {
        exercise.sets.sort((a, b) => (a.set_order || 0) - (b.set_order || 0));
      });
    });

    return {
      success: true,
      data: {
        availablePrograms
      }
    };

  } catch (error) {
    console.error("Error fetching workout programs for dashboard:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรมการออกกำลังกาย"
    };
  }
}
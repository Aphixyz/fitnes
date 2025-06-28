"use server";

import pool from "../../../lib/db.js";

/**
 * Fetch active workout plan ของ Member (เฉพาะ plan ที่มี status = 'active')
 * @param {number} memberId - ID ของ Member
 * @returns {Promise<Object>} ข้อมูล active workout plan
 */
export async function fetchActiveWorkoutPlan(memberId) {
  try {
    const connection = await pool.getConnection();

    // Query เพื่อดึงข้อมูล active workout plan พร้อม programs และ exercises
    const query = `
      SELECT 
        wp.workout_plan_id,
        wp.plan_name,
        wp.plan_duration,
        wp.plan_startdate,
        wp.plan_enddate,
        wp.plan_note,
        wp.plan_status,
        wp.created_at,
        
        wprog.workout_program_id,
        wprog.program_name,
        wprog.program_note,
        wprog.order_index as program_order,
        
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
      LEFT JOIN workout_program wprog ON wp.workout_plan_id = wprog.workout_plan_id
      LEFT JOIN program_exercise pe ON wprog.workout_program_id = pe.workout_program_id
      LEFT JOIN program_exercise_set pes ON pe.program_exercise_id = pes.program_exercise_id
      
      WHERE wp.member_id = ? AND wp.plan_status = 'active'
      
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
        success: false,
        error: "ไม่พบ active workout plan",
        data: null,
      };
    }

    // สร้าง workout plan object
    const firstRow = rows[0];
    const workoutPlan = {
      workout_plan_id: firstRow.workout_plan_id,
      plan_name: firstRow.plan_name,
      plan_duration: firstRow.plan_duration,
      plan_startdate: firstRow.plan_startdate,
      plan_enddate: firstRow.plan_enddate,
      plan_note: firstRow.plan_note,
      plan_status: firstRow.plan_status,
      created_at: firstRow.created_at,
      programs: [], 
    };

    // จัดกลุ่มข้อมูลให้เป็น nested structure
    const programMap = new Map(); // เก็บ programs เพื่อไม่ให้ duplicate
    const exerciseMap = new Map(); // เก็บ exercises เพื่อไม่ให้ duplicate

    rows.forEach((row) => {
      // จัดการ Workout Programs
      if (row.workout_program_id && !programMap.has(row.workout_program_id)) {
        const program = {
          workout_program_id: row.workout_program_id,
          program_name: row.program_name,
          program_note: row.program_note,
          program_order: row.program_order,
          exercises: [], // array ของ exercises ในแต่ละ program
        };

        programMap.set(row.workout_program_id, program);
        workoutPlan.programs.push(program);
      }

      // จัดการ Program Exercises
      if (
        row.program_exercise_id &&
        !exerciseMap.has(row.program_exercise_id)
      ) {
        const exercise = {
          program_exercise_id: row.program_exercise_id,
          exercise_id: row.exercise_id,
          exercise_order: row.exercise_order,
          exercise_rest: row.exercise_rest,
          sets: [], 
        };

        exerciseMap.set(row.program_exercise_id, exercise);

        // เพิ่ม exercise เข้าไปใน program ที่ถูกต้อง
        const targetProgram = programMap.get(row.workout_program_id);
        if (targetProgram) {
          targetProgram.exercises.push(exercise);
        }
      }

      // จัดการ Exercise Sets
      if (row.program_exercise_set_id) {
        const exerciseSet = {
          program_exercise_set_id: row.program_exercise_set_id,
          set_order: row.set_order,
          weight: row.weight,
          reps: row.reps,
          time: row.time,
          distance: row.distance,
        };

        // เพิ่ม set เข้าไปใน exercise ที่ถูกต้อง
        const targetExercise = exerciseMap.get(row.program_exercise_id);
        if (targetExercise) {
          targetExercise.sets.push(exerciseSet);
        }
      }
    });

    // เรียงลำดับข้อมูลให้ถูกต้อง
    workoutPlan.programs.sort((a, b) => a.program_order - b.program_order);
    workoutPlan.programs.forEach((program) => {
      program.exercises.sort((a, b) => a.exercise_order - b.exercise_order);
      program.exercises.forEach((exercise) => {
        exercise.sets.sort((a, b) => a.set_order - b.set_order);
      });
    });

    return {
      success: true,
      data: workoutPlan,
    };
  } catch (error) {
    console.error("Error fetching active workout plan:", error);
    return {
      success: false,
      error: "ไม่สามารถดึงข้อมูล workout plan ได้",
      data: null,
    };
  }
}

/**
 * Helper function เพื่อตรวจสอบว่า Member มี active workout plan หรือไม่
 * @param {number} memberId - ID ของ Member
 * @returns {Promise<boolean>} true ถ้ามี active plan, false ถ้าไม่มี
 */
export async function hasActiveWorkoutPlan(memberId) {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT COUNT(*) as count 
      FROM workout_plan 
      WHERE member_id = ? AND plan_status = 'active'
    `;

    const [rows] = await connection.execute(query, [memberId]);
    connection.release();

    return rows[0].count > 0;
  } catch (error) {
    console.error("Error checking active workout plan:", error);
    return false;
  }
}

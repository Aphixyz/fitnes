"use server";

import pool from "../../../lib/db.js";

/**
 * ดึงข้อมูล exercise sets ตาม program_exercise_id
 * ใช้สำหรับการสร้างฟอร์มบันทึกการออกกำลังกาย
 * @param {number} programExerciseId - ID ของ program exercise
 * @returns {Promise<Object>} ข้อมูล exercise sets พร้อมข้อมูลอื่นๆ ที่เกี่ยวข้อง
 */
export async function fetchExerciseSets(programExerciseId) {
  try {
    const connection = await pool.getConnection();

    // Query เพื่อดึงข้อมูล exercise sets พร้อมข้อมูล exercise และ program
    const query = `
      SELECT 
        pes.program_exercise_set_id,
        pes.set_order,
        pes.weight,
        pes.reps,
        pes.time,
        pes.distance,
        
        pe.program_exercise_id,
        pe.exercise_id,
        pe.order_index as exercise_order,
        pe.rest as exercise_rest,
        
        wp.workout_program_id,
        wp.program_name,
        wp.program_note
        
      FROM program_exercise_set pes
      INNER JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
      INNER JOIN workout_program wp ON pe.workout_program_id = wp.workout_program_id
      
      WHERE pes.program_exercise_id = ?
      
      ORDER BY pes.set_order ASC
    `;

    const [rows] = await connection.execute(query, [programExerciseId]);
    connection.release();

    // ถ้าไม่มีข้อมูล
    if (rows.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูล exercise sets",
        data: null,
      };
    }

    // จัดโครงสร้างข้อมูล
    const firstRow = rows[0];
    const exerciseData = {
      program_exercise_id: firstRow.program_exercise_id,
      exercise_id: firstRow.exercise_id,
      exercise_order: firstRow.exercise_order,
      exercise_rest: firstRow.exercise_rest,
      program_name: firstRow.program_name,
      program_note: firstRow.program_note,
      sets: rows.map((row) => ({
        program_exercise_set_id: row.program_exercise_set_id,
        set_order: row.set_order,
        weight: row.weight,
        reps: row.reps,
        time: row.time,
        distance: row.distance,
      })),
    };

    return {
      success: true,
      data: exerciseData,
    };
  } catch (error) {
    console.error("Error fetching exercise sets:", error);
    return {
      success: false,
      error: "ไม่สามารถดึงข้อมูล exercise sets ได้",
      data: null,
    };
  }
}

/**
 * ดึงข้อมูล exercise sets ทั้งหมดของ member ตาม member_id
 * ใช้สำหรับแสดงข้อมูลภาพรวมทั้งหมด
 * @param {number} memberId - ID ของ member
 * @returns {Promise<Object>} ข้อมูล exercise sets ทั้งหมดของ member
 */
export async function fetchMemberExerciseSets(memberId) {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        pes.program_exercise_set_id,
        pes.set_order,
        pes.weight,
        pes.reps,
        pes.time,
        pes.distance,
        
        pe.program_exercise_id,
        pe.exercise_id,
        pe.order_index as exercise_order,
        pe.rest as exercise_rest,
        
        wp.workout_program_id,
        wp.program_name,
        wp.program_note,
        wp.order_index as program_order,
        
        wplan.workout_plan_id,
        wplan.plan_name,
        wplan.plan_status
        
      FROM program_exercise_set pes
      INNER JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
      INNER JOIN workout_program wp ON pe.workout_program_id = wp.workout_program_id
      INNER JOIN workout_plan wplan ON wp.workout_plan_id = wplan.workout_plan_id
      
      WHERE wplan.member_id = ? AND wplan.plan_status = 'active'
      
      ORDER BY 
        wp.order_index ASC,
        pe.order_index ASC,
        pes.set_order ASC
    `;

    const [rows] = await connection.execute(query, [memberId]);
    connection.release();

    if (rows.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูล exercise sets สำหรับ member นี้",
        data: null,
      };
    }

    // จัดกลุ่มข้อมูลตาม program และ exercise
    const programMap = new Map();
    const exerciseMap = new Map();

    rows.forEach((row) => {
      // จัดการ Workout Programs
      if (!programMap.has(row.workout_program_id)) {
        const program = {
          workout_program_id: row.workout_program_id,
          program_name: row.program_name,
          program_note: row.program_note,
          program_order: row.program_order,
          exercises: [],
        };
        programMap.set(row.workout_program_id, program);
      }

      // จัดการ Program Exercises
      if (!exerciseMap.has(row.program_exercise_id)) {
        const exercise = {
          program_exercise_id: row.program_exercise_id,
          exercise_id: row.exercise_id,
          exercise_order: row.exercise_order,
          exercise_rest: row.exercise_rest,
          sets: [],
        };
        exerciseMap.set(row.program_exercise_id, exercise);

        // เพิ่ม exercise ไปใน program ที่ถูกต้อง
        const targetProgram = programMap.get(row.workout_program_id);
        if (targetProgram) {
          targetProgram.exercises.push(exercise);
        }
      }

      // เพิ่ม set เข้าไปใน exercise
      const exerciseSet = {
        program_exercise_set_id: row.program_exercise_set_id,
        set_order: row.set_order,
        weight: row.weight,
        reps: row.reps,
        time: row.time,
        distance: row.distance,
      };

      const targetExercise = exerciseMap.get(row.program_exercise_id);
      if (targetExercise) {
        targetExercise.sets.push(exerciseSet);
      }
    });

    // แปลง Map เป็น Array และเรียงลำดับ
    const programs = Array.from(programMap.values()).sort(
      (a, b) => a.program_order - b.program_order
    );

    programs.forEach((program) => {
      program.exercises.sort((a, b) => a.exercise_order - b.exercise_order);
      program.exercises.forEach((exercise) => {
        exercise.sets.sort((a, b) => a.set_order - b.set_order);
      });
    });

    return {
      success: true,
      data: {
        workout_plan_id: rows[0].workout_plan_id,
        plan_name: rows[0].plan_name,
        programs: programs,
      },
    };
  } catch (error) {
    console.error("Error fetching member exercise sets:", error);
    return {
      success: false,
      error: "ไม่สามารถดึงข้อมูล exercise sets ของ member ได้",
      data: null,
    };
  }
}

/**
 * ดึงข้อมูล exercise sets สำหรับ workout program เฉพาะ
 * ใช้เมื่อต้องการแสดงข้อมูลเฉพาะ program ใดโปรแกรมหนึ่ง
 * @param {number} workoutProgramId - ID ของ workout program
 * @param {number} memberId - ID ของ member (สำหรับ verify ownership)
 * @returns {Promise<Object>} ข้อมูล exercise sets ของ program นั้นๆ
 */
export async function fetchProgramExerciseSets(workoutProgramId, memberId) {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        pes.program_exercise_set_id,
        pes.set_order,
        pes.weight,
        pes.reps,
        pes.time,
        pes.distance,
        
        pe.program_exercise_id,
        pe.exercise_id,
        pe.order_index as exercise_order,
        pe.rest as exercise_rest,
        
        wp.workout_program_id,
        wp.program_name,
        wp.program_note
        
      FROM program_exercise_set pes
      INNER JOIN program_exercise pe ON pes.program_exercise_id = pe.program_exercise_id
      INNER JOIN workout_program wp ON pe.workout_program_id = wp.workout_program_id
      INNER JOIN workout_plan wplan ON wp.workout_plan_id = wplan.workout_plan_id
      
      WHERE wp.workout_program_id = ? 
        AND wplan.member_id = ? 
        AND wplan.plan_status = 'active'
      
      ORDER BY 
        pe.order_index ASC,
        pes.set_order ASC
    `;

    const [rows] = await connection.execute(query, [
      workoutProgramId,
      memberId,
    ]);
    connection.release();

    if (rows.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูล exercise sets สำหรับ program นี้",
        data: null,
      };
    }

    // จัดกลุ่มข้อมูลตาม exercise
    const exerciseMap = new Map();

    rows.forEach((row) => {
      if (!exerciseMap.has(row.program_exercise_id)) {
        const exercise = {
          program_exercise_id: row.program_exercise_id,
          exercise_id: row.exercise_id,
          exercise_order: row.exercise_order,
          exercise_rest: row.exercise_rest,
          sets: [],
        };
        exerciseMap.set(row.program_exercise_id, exercise);
      }

      const exerciseSet = {
        program_exercise_set_id: row.program_exercise_set_id,
        set_order: row.set_order,
        weight: row.weight,
        reps: row.reps,
        time: row.time,
        distance: row.distance,
      };

      const targetExercise = exerciseMap.get(row.program_exercise_id);
      if (targetExercise) {
        targetExercise.sets.push(exerciseSet);
      }
    });

    // แปลง Map เป็น Array และเรียงลำดับ
    const exercises = Array.from(exerciseMap.values()).sort(
      (a, b) => a.exercise_order - b.exercise_order
    );

    exercises.forEach((exercise) => {
      exercise.sets.sort((a, b) => a.set_order - b.set_order);
    });

    return {
      success: true,
      data: {
        workout_program_id: rows[0].workout_program_id,
        program_name: rows[0].program_name,
        program_note: rows[0].program_note,
        exercises: exercises,
      },
    };
  } catch (error) {
    console.error("Error fetching program exercise sets:", error);
    return {
      success: false,
      error: "ไม่สามารถดึงข้อมูล exercise sets ของ program ได้",
      data: null,
    };
  }
}


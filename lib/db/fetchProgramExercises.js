"use server";

import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function fetchProgramExercises(programId, trainerId) {
  const conn = await pool.getConnection();

  try {
    // ตรวจสอบสิทธิ์เทรนเนอร์
    const [programCheck] = await conn.query(
      `SELECT wp.workout_plan_id, wp.trainer_id
       FROM workout_program p
       JOIN workout_plan wp ON p.workout_plan_id = wp.workout_plan_id
       WHERE p.workout_program_id = ? AND wp.trainer_id = ?`,
      [programId, trainerId]
    );

    if (!programCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์เข้าถึงโปรแกรมนี้",
      };
    }

    // ดึงข้อมูลท่าออกกำลังกาย
    const [exercises] = await conn.query(
      `SELECT pe.program_exercise_id, pe.exercise_id, pe.order_index, pe.rest, pe.notes
       FROM program_exercise pe
       WHERE pe.workout_program_id = ?
       ORDER BY pe.order_index`,
      [programId]
    );

    // ดึงข้อมูลเซ็ต
    const exerciseIds = exercises.map((ex) => ex.program_exercise_id);
    let sets = [];

    if (exerciseIds.length > 0) {
      const [setsResult] = await conn.query(
        `SELECT pes.program_exercise_set_id, pes.program_exercise_id, 
                pes.set_order, pes.weight, pes.reps, pes.time, pes.distance
         FROM program_exercise_set pes
         WHERE pes.program_exercise_id IN (?)
         ORDER BY pes.set_order`,
        [exerciseIds]
      );

      sets = setsResult;
    }

    // โหลดข้อมูลท่าออกกำลังกายจาก JSON
    const exercisesFilePath = path.join(
      process.cwd(),
      "data",
      "exercises.json"
    );
    const exercisesJson = await fs.readFile(exercisesFilePath, "utf-8");
    const exercisesData = JSON.parse(exercisesJson);

    // รวมข้อมูลท่าออกกำลังกายกับข้อมูลจาก JSON
    const result = exercises.map((exercise) => {
      // หาข้อมูลท่าจาก JSON
      const exerciseDetails =
        exercisesData.find((e) => e.id === exercise.exercise_id) || {};

      // หาเซ็ตที่เกี่ยวข้อง
      const exerciseSets = sets
        .filter((s) => s.program_exercise_id === exercise.program_exercise_id)
        .map((s) => ({
          set_order: s.set_order,
          weight: s.weight,
          reps: s.reps,
          time: s.time,
          distance: s.distance,
        }));

      // รวมข้อมูล
      return {
        program_exercise_id: exercise.program_exercise_id,
        exercise_id: exercise.exercise_id,
        order_index: exercise.order_index,
        rest: exercise.rest,
        notes: exercise.notes,
        // ข้อมูลจาก JSON
        name: exerciseDetails.name || `Exercise ID: ${exercise.exercise_id}`,
        category: exerciseDetails.category,
        equipment: exerciseDetails.equipment,
        primaryMuscles: exerciseDetails.primaryMuscles || [],
        secondaryMuscles: exerciseDetails.secondaryMuscles || [],
        level: exerciseDetails.level,
        mechanic: exerciseDetails.mechanic,
        // เซ็ต
        sets:
          exerciseSets.length > 0
            ? exerciseSets
            : [
                {
                  set_order: 1,
                  weight: null,
                  reps: 10,
                  time: null,
                  distance: null,
                },
              ],
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching program exercises:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลท่าออกกำลังกาย",
    };
  } finally {
    conn.release();
  }
}

"use server";

import pool from "../../../lib/db.js";
import { revalidatePath } from "next/cache";

/**
 * Insert Program Exercise Set - Server Action
 * บันทึกข้อมูลการออกกำลังกายของ member ทีละเซต
 *
 * @param {Object} setData - ข้อมูลการออกกำลังกาย
 * @param {number} setData.member_id - ID ของสมาชิก
 * @param {number} setData.workout_plan_id - ID ของ workout plan
 * @param {number} setData.workout_program_id - ID ของ workout program
 * @param {number} setData.program_exercise_set_id - ID ของ program exercise set
 * @param {number} setData.set_order - ลำดับของเซต
 * @param {number|null} setData.weight - น้ำหนัก (กก.) หรือ null
 * @param {number|null} setData.reps - จำนวนครั้ง หรือ null
 * @param {string|null} setData.time - เวลา (TIME format) หรือ null
 * @param {number|null} setData.distance - ระยะทาง (เมตร) หรือ null
 * @param {string} setData.log_date - วันที่บันทึก (YYYY-MM-DD format)
 * @returns {Object} { success: true } หรือ throw Error
 */
export const insertProgramExerciseSet = async (setData) => {
  try {
    const {
      member_id,
      workout_plan_id,
      workout_program_id,
      program_exercise_set_id,
      set_order,
      weight = null,
      reps = null,
      time = null,
      distance = null,
      log_date,
    } = setData;

    // Validate required fields
    if (
      !member_id ||
      !workout_plan_id ||
      !workout_program_id ||
      !program_exercise_set_id ||
      !set_order ||
      !log_date
    ) {
      throw new Error("ข้อมูลที่จำเป็นไม่ครบถ้วน");
    }

    // เช็คว่ามี exercise_log สำหรับวันนี้แล้วหรือยัง
    const existingLogQuery = `
      SELECT exercise_log_id 
      FROM exercise_log 
      WHERE member_id = ? 
        AND workout_plan_id = ? 
        AND workout_program_id = ? 
        AND log_date = ?
    `;

    const [exerciseLogResult] = await pool.execute(existingLogQuery, [
      member_id,
      workout_plan_id,
      workout_program_id,
      log_date,
    ]);

    let exercise_log_id;

    // ถ้ายังไม่มี exercise_log ให้สร้างใหม่
    if (exerciseLogResult.length === 0) {
      const insertLogQuery = `
        INSERT INTO exercise_log 
        (member_id, workout_plan_id, workout_program_id, log_date)
        VALUES (?, ?, ?, ?)
      `;

      const [logResult] = await pool.execute(insertLogQuery, [
        member_id,
        workout_plan_id,
        workout_program_id,
        log_date,
      ]);

      exercise_log_id = logResult.insertId;
    } else {
      exercise_log_id = exerciseLogResult[0].exercise_log_id;
    }

    // เช็คว่ามีการบันทึกเซตนี้แล้วหรือยัง (เพื่อ update แทน insert)
    const existingSetQuery = `
      SELECT exercise_log_set_id 
      FROM exercise_log_set 
      WHERE exercise_log_id = ? 
        AND program_exercise_set_id = ? 
        AND set_order = ?
    `;

    const [existingSetResult] = await pool.execute(existingSetQuery, [
      exercise_log_id,
      program_exercise_set_id,
      set_order,
    ]);

    if (existingSetResult.length > 0) {
      // Update existing set
      const updateSetQuery = `
        UPDATE exercise_log_set 
        SET weight = ?, reps = ?, time = ?, distance = ?
        WHERE exercise_log_set_id = ?
      `;

      await pool.execute(updateSetQuery, [
        weight,
        reps,
        time,
        distance,
        existingSetResult[0].exercise_log_set_id,
      ]);
    } else {
      // Insert new set
      const insertSetQuery = `
        INSERT INTO exercise_log_set 
        (exercise_log_id, program_exercise_set_id, set_order, weight, reps, time, distance)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.execute(insertSetQuery, [
        exercise_log_id,
        program_exercise_set_id,
        set_order,
        weight,
        reps,
        time,
        distance,
      ]);
    }

    // Revalidate หน้าที่เกี่ยวข้อง
    revalidatePath(`/member/${member_id}/workout`);
    revalidatePath(`/member/${member_id}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Error inserting program exercise set:", error);
    throw new Error(`ไม่สามารถบันทึกข้อมูลการออกกำลังกายได้: ${error.message}`);
  }
};

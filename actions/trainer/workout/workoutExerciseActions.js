'use server';

import db from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

/**
 * อ่านข้อมูลท่าออกกำลังกายจากไฟล์ JSON
 * @returns {Promise<Array>} - ข้อมูลท่าออกกำลังกายทั้งหมด
 */
async function readExercisesData() {
  try {
    const exercisesPath = path.join(process.cwd(), 'public', 'data', 'exercises', 'exercises.json');
    const data = await fs.readFile(exercisesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading exercises data:', error);
    return [];
  }
}

/**
 * ดึงข้อมูลท่าออกกำลังกายทั้งหมด
 * @returns {Promise<Object>} - ข้อมูลท่าออกกำลังกาย
 */
export async function getAllExercises() {
  try {
    const exercises = await readExercisesData();
    return {
      success: true,
      exercises
    };
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลท่าออกกำลังกาย'
    };
  }
}

/**
 * ดึงข้อมูลท่าออกกำลังกายในโปรแกรมการฝึก
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @returns {Promise<Object>} - ข้อมูลท่าออกกำลังกายในโปรแกรม
 */
export async function getPlanExercises(planId) {
  try {
    if (!planId) {
      throw new Error('กรุณาระบุรหัสโปรแกรมการฝึก');
    }

    // ดึงข้อมูลท่าออกกำลังกายในโปรแกรม
    const [exercises] = await db.query(
      `SELECT * 
       FROM workout_exercise 
       WHERE workout_plan_id = ? 
       ORDER BY exercise_day, exercise_order`,
      [planId]
    );

    // อ่านข้อมูลท่าออกกำลังกายจากไฟล์ JSON
    const allExercises = await readExercisesData();
    const exercisesMap = allExercises.reduce((map, exercise) => {
      map[exercise.id] = exercise;
      return map;
    }, {});

    // เพิ่มข้อมูลรายละเอียดท่าออกกำลังกาย
    const exercisesWithDetails = exercises.map(exercise => {
      const details = exercisesMap[exercise.exercise_id] || {};
      return {
        ...exercise,
        exercise_name: details.name || details.thai_name || 'ไม่ระบุชื่อ',
        exercise_description: details.description || '',
        exercise_image: details.image || null,
        equipment: details.equipment || [],
        muscle_groups: details.muscle_groups || []
      };
    });

    // จัดกลุ่มตามวัน
    const groupedByDay = {};
    exercisesWithDetails.forEach(exercise => {
      const day = exercise.exercise_day || 'ไม่ระบุวัน';
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }
      groupedByDay[day].push(exercise);
    });

    return {
      success: true,
      exercises: exercisesWithDetails,
      groupedByDay
    };
  } catch (error) {
    console.error('Error fetching plan exercises:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลท่าออกกำลังกาย'
    };
  }
}

/**
 * เพิ่มท่าออกกำลังกายในโปรแกรมการฝึก
 * @param {Object} data - ข้อมูลท่าออกกำลังกาย
 * @returns {Promise<Object>} - ผลลัพธ์การเพิ่ม
 */
export async function addExerciseToPlan(data) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.workout_plan_id || !data.exercise_id) {
      throw new Error('กรุณาระบุรหัสโปรแกรมการฝึกและรหัสท่าออกกำลังกาย');
    }

    // ตรวจสอบการมีอยู่ของโปรแกรมการฝึก
    const [planCheck] = await db.query(
      'SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ?',
      [data.workout_plan_id]
    );

    if (planCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึก');
    }

    // หาลำดับของท่าออกกำลังกายล่าสุดในวันที่ระบุ
    const [orderResult] = await db.query(
      `SELECT MAX(exercise_order) as max_order 
       FROM workout_exercise 
       WHERE workout_plan_id = ? AND exercise_day = ?`,
      [data.workout_plan_id, data.exercise_day || null]
    );

    const nextOrder = (orderResult[0].max_order || 0) + 1;

    // เพิ่มท่าออกกำลังกาย
    const [result] = await db.query(
      `INSERT INTO workout_exercise 
       (workout_plan_id, exercise_id, exercise_day, exercise_order, 
        sets, repetitions, duration_minutes, rest_seconds, weight_kg, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.workout_plan_id,
        data.exercise_id,
        data.exercise_day || null,
        data.exercise_order || nextOrder,
        data.sets || 3,
        data.repetitions || '12',
        data.duration_minutes || null,
        data.rest_seconds || 60,
        data.weight_kg || null,
        data.notes || null
      ]
    );

    if (!result || !result.insertId) {
      throw new Error('ไม่สามารถเพิ่มท่าออกกำลังกายได้');
    }

    return {
      success: true,
      exercise_id: result.insertId,
      message: 'เพิ่มท่าออกกำลังกายสำเร็จ'
    };
  } catch (error) {
    console.error('Error adding exercise to plan:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มท่าออกกำลังกาย'
    };
  }
}

/**
 * อัพเดตท่าออกกำลังกายในโปรแกรมการฝึก
 * @param {number} exerciseId - รหัสท่าออกกำลังกายในโปรแกรม
 * @param {Object} data - ข้อมูลที่ต้องการอัพเดต
 * @returns {Promise<Object>} - ผลลัพธ์การอัพเดต
 */
export async function updatePlanExercise(exerciseId, data) {
  try {
    if (!exerciseId || !data) {
      throw new Error('กรุณาระบุรหัสท่าออกกำลังกายและข้อมูลที่ต้องการอัพเดต');
    }

    // ตรวจสอบการมีอยู่ของท่าออกกำลังกายในโปรแกรม
    const [exerciseCheck] = await db.query(
      'SELECT workout_exercise_id FROM workout_exercise WHERE workout_exercise_id = ?',
      [exerciseId]
    );

    if (exerciseCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลท่าออกกำลังกายในโปรแกรม');
    }

    // สร้าง SQL สำหรับการอัพเดต
    const updates = Object.entries(data)
      .filter(([key]) => key !== 'workout_exercise_id' && key !== 'workout_plan_id') // ไม่อัพเดต primary key และ workout_plan_id
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    if (!updates) {
      throw new Error('ไม่มีข้อมูลที่ต้องการอัพเดต');
    }
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'workout_exercise_id' && key !== 'workout_plan_id')
      .map(([_, value]) => value);
    
    values.push(exerciseId); // เพิ่ม exerciseId สำหรับ WHERE clause

    // อัพเดตข้อมูล
    const [result] = await db.query(
      `UPDATE workout_exercise SET ${updates} WHERE workout_exercise_id = ?`,
      values
    );

    if (!result || result.affectedRows === 0) {
      throw new Error('ไม่สามารถอัพเดตท่าออกกำลังกายได้');
    }

    return {
      success: true,
      message: 'อัพเดตท่าออกกำลังกายสำเร็จ'
    };
  } catch (error) {
    console.error('Error updating plan exercise:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัพเดตท่าออกกำลังกาย'
    };
  }
}

/**
 * ลบท่าออกกำลังกายจากโปรแกรมการฝึก
 * @param {number} exerciseId - รหัสท่าออกกำลังกายในโปรแกรม
 * @param {number} planId - รหัสโปรแกรมการฝึก (สำหรับการตรวจสอบ)
 * @returns {Promise<Object>} - ผลลัพธ์การลบ
 */
export async function deletePlanExercise(exerciseId, planId) {
  try {
    if (!exerciseId || !planId) {
      throw new Error('กรุณาระบุรหัสท่าออกกำลังกายและรหัสโปรแกรมการฝึก');
    }

    // ตรวจสอบการมีอยู่ของท่าออกกำลังกายในโปรแกรม
    const [exerciseCheck] = await db.query(
      'SELECT workout_exercise_id FROM workout_exercise WHERE workout_exercise_id = ? AND workout_plan_id = ?',
      [exerciseId, planId]
    );

    if (exerciseCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลท่าออกกำลังกายในโปรแกรมหรือไม่มีสิทธิ์ในการลบ');
    }

    // ลบท่าออกกำลังกาย
    const [result] = await db.query(
      'DELETE FROM workout_exercise WHERE workout_exercise_id = ?',
      [exerciseId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error('ไม่สามารถลบท่าออกกำลังกายได้');
    }

    return {
      success: true,
      message: 'ลบท่าออกกำลังกายสำเร็จ'
    };
  } catch (error) {
    console.error('Error deleting plan exercise:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบท่าออกกำลังกาย'
    };
  }
}

/**
 * เรียงลำดับท่าออกกำลังกายใหม่
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @param {Array} exerciseIds - รายการรหัสท่าออกกำลังกายเรียงตามลำดับใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การเรียงลำดับ
 */
export async function reorderPlanExercises(planId, exerciseIds) {
  try {
    if (!planId || !exerciseIds || !Array.isArray(exerciseIds)) {
      throw new Error('กรุณาระบุรหัสโปรแกรมการฝึกและรายการรหัสท่าออกกำลังกาย');
    }

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // อัพเดตลำดับของท่าออกกำลังกายทีละรายการ
      for (let i = 0; i < exerciseIds.length; i++) {
        await db.query(
          'UPDATE workout_exercise SET exercise_order = ? WHERE workout_exercise_id = ? AND workout_plan_id = ?',
          [i + 1, exerciseIds[i], planId]
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        message: 'เรียงลำดับท่าออกกำลังกายสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error reordering plan exercises:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเรียงลำดับท่าออกกำลังกาย'
    };
  }
}

/**
 * ย้ายท่าออกกำลังกายไปวันอื่น
 * @param {number} exerciseId - รหัสท่าออกกำลังกายในโปรแกรม
 * @param {string} newDay - วันใหม่
 * @param {number} planId - รหัสโปรแกรมการฝึก (สำหรับการตรวจสอบ)
 * @returns {Promise<Object>} - ผลลัพธ์การย้าย
 */
export async function moveExerciseToDay(exerciseId, newDay, planId) {
  try {
    if (!exerciseId || !newDay || !planId) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น');
    }

    // ตรวจสอบการมีอยู่ของท่าออกกำลังกายในโปรแกรม
    const [exerciseCheck] = await db.query(
      'SELECT workout_exercise_id, exercise_day FROM workout_exercise WHERE workout_exercise_id = ? AND workout_plan_id = ?',
      [exerciseId, planId]
    );

    if (exerciseCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลท่าออกกำลังกายในโปรแกรมหรือไม่มีสิทธิ์ในการแก้ไข');
    }

    const currentDay = exerciseCheck[0].exercise_day;
    
    // ถ้าวันเดิมและวันใหม่เป็นวันเดียวกัน ไม่ต้องทำอะไร
    if (currentDay === newDay) {
      return {
        success: true,
        message: 'ท่าออกกำลังกายอยู่ในวันเดียวกันอยู่แล้ว'
      };
    }

    // หาลำดับของท่าออกกำลังกายล่าสุดในวันใหม่
    const [orderResult] = await db.query(
      `SELECT MAX(exercise_order) as max_order 
       FROM workout_exercise 
       WHERE workout_plan_id = ? AND exercise_day = ?`,
      [planId, newDay]
    );

    const nextOrder = (orderResult[0].max_order || 0) + 1;

    // อัพเดตวันและลำดับ
    const [result] = await db.query(
      'UPDATE workout_exercise SET exercise_day = ?, exercise_order = ? WHERE workout_exercise_id = ?',
      [newDay, nextOrder, exerciseId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error('ไม่สามารถย้ายท่าออกกำลังกายได้');
    }

    return {
      success: true,
      message: 'ย้ายท่าออกกำลังกายสำเร็จ'
    };
  } catch (error) {
    console.error('Error moving exercise to day:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการย้ายท่าออกกำลังกาย'
    };
  }
}
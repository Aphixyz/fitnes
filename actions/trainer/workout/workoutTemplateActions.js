'use server';

import db from '@/lib/db';

/**
 * ดึงข้อมูลเทมเพลตโปรแกรมการฝึกทั้งหมด
 * @param {number} trainerId - รหัสเทรนเนอร์ (ถ้าระบุ จะดึงเฉพาะของเทรนเนอร์)
 * @returns {Promise<Object>} - ข้อมูลเทมเพลตโปรแกรมการฝึก
 */
export async function getWorkoutTemplates(trainerId = null) {
  try {
    let query = `
      SELECT t.*, 
             COUNT(e.template_exercise_id) as exercise_count,
             tr.trainer_firstname, tr.trainer_lastname
      FROM workout_template t
      LEFT JOIN template_exercise e ON t.template_id = e.template_id
      LEFT JOIN trainer tr ON t.trainer_id = tr.trainer_id
    `;
    
    const params = [];
    
    if (trainerId) {
      query += ` WHERE t.trainer_id = ? OR t.is_public = 1`;
      params.push(trainerId);
    } else {
      query += ` WHERE t.is_public = 1`;
    }
    
    query += ` GROUP BY t.template_id ORDER BY t.created_at DESC`;
    
    const [templates] = await db.query(query, params);
    
    return {
      success: true,
      templates: templates.map(template => ({
        ...template,
        trainer_name: `${template.trainer_firstname || ''} ${template.trainer_lastname || ''}`.trim(),
      }))
    };
  } catch (error) {
    console.error('Error fetching workout templates:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเทมเพลตโปรแกรมการฝึก'
    };
  }
}

/**
 * ดึงข้อมูลเทมเพลตโปรแกรมการฝึกตาม ID
 * @param {number} templateId - รหัสเทมเพลตโปรแกรมการฝึก
 * @returns {Promise<Object>} - ข้อมูลเทมเพลตโปรแกรมการฝึก
 */
export async function getWorkoutTemplateById(templateId) {
  try {
    if (!templateId) {
      throw new Error('กรุณาระบุรหัสเทมเพลตโปรแกรมการฝึก');
    }

    // ดึงข้อมูลเทมเพลต
    const [templates] = await db.query(
      `SELECT t.*, tr.trainer_firstname, tr.trainer_lastname
       FROM workout_template t
       LEFT JOIN trainer tr ON t.trainer_id = tr.trainer_id
       WHERE t.template_id = ?`,
      [templateId]
    );

    if (templates.length === 0) {
      throw new Error('ไม่พบข้อมูลเทมเพลตโปรแกรมการฝึก');
    }

    const template = templates[0];

    // ดึงข้อมูลท่าออกกำลังกายในเทมเพลต
    const [exercises] = await db.query(
      `SELECT * 
       FROM template_exercise 
       WHERE template_id = ? 
       ORDER BY exercise_day, exercise_order`,
      [templateId]
    );

    return {
      success: true,
      template: {
        ...template,
        trainer_name: `${template.trainer_firstname || ''} ${template.trainer_lastname || ''}`.trim(),
      },
      exercises
    };
  } catch (error) {
    console.error('Error fetching workout template:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเทมเพลตโปรแกรมการฝึก'
    };
  }
}

/**
 * สร้างเทมเพลตโปรแกรมการฝึกใหม่
 * @param {Object} data - ข้อมูลเทมเพลตโปรแกรมการฝึก
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างเทมเพลต
 */
export async function createWorkoutTemplate(data) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.trainer_id || !data.template_name) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น: รหัสเทรนเนอร์, ชื่อเทมเพลต');
    }

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // สร้างเทมเพลตโปรแกรมการฝึก
      const [result] = await db.query(
        `INSERT INTO workout_template
         (trainer_id, template_name, template_description, workout_days, 
          difficulty_level, target_muscles, is_public, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.trainer_id,
          data.template_name,
          data.template_description || null,
          data.workout_days || null,
          data.difficulty_level || 'beginner',
          data.target_muscles || null,
          data.is_public || 0
        ]
      );

      if (!result || !result.insertId) {
        throw new Error('ไม่สามารถสร้างเทมเพลตโปรแกรมการฝึกได้');
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        template_id: result.insertId,
        message: 'สร้างเทมเพลตโปรแกรมการฝึกสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating workout template:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างเทมเพลตโปรแกรมการฝึก'
    };
  }
}

/**
 * สร้างโปรแกรมการฝึกจากเทมเพลต
 * @param {number} templateId - รหัสเทมเพลตโปรแกรมการฝึก
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างโปรแกรมการฝึก
 */
export async function createWorkoutFromTemplate(templateId, trainerId, memberId) {
  try {
    if (!templateId || !trainerId || !memberId) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น');
    }

    // ดึงข้อมูลเทมเพลต
    const templateResult = await getWorkoutTemplateById(templateId);
    
    if (!templateResult.success) {
      throw new Error(templateResult.message || 'ไม่สามารถดึงข้อมูลเทมเพลตได้');
    }
    
    const { template, exercises } = templateResult;

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // สร้างโปรแกรมการฝึก
      const [workoutResult] = await db.query(
        `INSERT INTO workout_plan 
         (trainer_id, member_id, plan_name, plan_description, 
          plan_startdate, workout_days, difficulty_level, 
          workout_frequency, plan_status) 
         VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, 'active')`,
        [
          trainerId,
          memberId,
          template.template_name,
          template.template_description,
          template.workout_days,
          template.difficulty_level,
          template.workout_days ? template.workout_days.split(',').length : 3
        ]
      );

      if (!workoutResult || !workoutResult.insertId) {
        throw new Error('ไม่สามารถสร้างโปรแกรมการฝึกได้');
      }

      const workoutPlanId = workoutResult.insertId;

      // เพิ่มท่าออกกำลังกายจากเทมเพลต
      if (exercises && exercises.length > 0) {
        const exerciseValues = exercises.map(exercise => [
          workoutPlanId,
          exercise.exercise_id,
          exercise.exercise_day,
          exercise.exercise_order,
          exercise.sets,
          exercise.repetitions,
          exercise.duration_minutes,
          exercise.rest_seconds,
          exercise.weight_kg,
          exercise.notes
        ]);

        // ใช้ bulk insert
        const placeholders = exercises.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = exerciseValues.flat();

        await db.query(
          `INSERT INTO workout_exercise 
           (workout_plan_id, exercise_id, exercise_day, exercise_order, 
            sets, repetitions, duration_minutes, rest_seconds, weight_kg, notes) 
           VALUES ${placeholders}`,
          flatValues
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        workout_plan_id: workoutPlanId,
        message: 'สร้างโปรแกรมการฝึกจากเทมเพลตสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating workout from template:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างโปรแกรมการฝึกจากเทมเพลต'
    };
  }
}

/**
 * บันทึกโปรแกรมการฝึกเป็นเทมเพลต
 * @param {number} workoutPlanId - รหัสโปรแกรมการฝึก
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {Object} templateInfo - ข้อมูลเพิ่มเติมของเทมเพลต (ชื่อ, คำอธิบาย, สถานะสาธารณะ)
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึกเทมเพลต
 */
export async function saveWorkoutAsTemplate(workoutPlanId, trainerId, templateInfo) {
  try {
    if (!workoutPlanId || !trainerId || !templateInfo.template_name) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น');
    }

    // ดึงข้อมูลโปรแกรมการฝึก
    const [workoutPlans] = await db.query(
      `SELECT * FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?`,
      [workoutPlanId, trainerId]
    );

    if (workoutPlans.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึกหรือไม่มีสิทธิ์ในการเข้าถึง');
    }

    const workoutPlan = workoutPlans[0];

    // ดึงข้อมูลท่าออกกำลังกายในโปรแกรม
    const [exercises] = await db.query(
      `SELECT * FROM workout_exercise WHERE workout_plan_id = ?`,
      [workoutPlanId]
    );

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // สร้างเทมเพลตโปรแกรมการฝึก
      const [templateResult] = await db.query(
        `INSERT INTO workout_template
         (trainer_id, template_name, template_description, workout_days, 
          difficulty_level, target_muscles, is_public, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          trainerId,
          templateInfo.template_name,
          templateInfo.template_description || workoutPlan.plan_description,
          workoutPlan.workout_days,
          workoutPlan.difficulty_level,
          templateInfo.target_muscles || null,
          templateInfo.is_public || 0
        ]
      );

      if (!templateResult || !templateResult.insertId) {
        throw new Error('ไม่สามารถสร้างเทมเพลตโปรแกรมการฝึกได้');
      }

      const templateId = templateResult.insertId;

      // เพิ่มท่าออกกำลังกายจากโปรแกรมการฝึก
      if (exercises && exercises.length > 0) {
        const exerciseValues = exercises.map(exercise => [
          templateId,
          exercise.exercise_id,
          exercise.exercise_day,
          exercise.exercise_order,
          exercise.sets,
          exercise.repetitions,
          exercise.duration_minutes,
          exercise.rest_seconds,
          exercise.weight_kg,
          exercise.notes
        ]);

        // ใช้ bulk insert
        const placeholders = exercises.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = exerciseValues.flat();

        await db.query(
          `INSERT INTO template_exercise 
           (template_id, exercise_id, exercise_day, exercise_order, 
            sets, repetitions, duration_minutes, rest_seconds, weight_kg, notes) 
           VALUES ${placeholders}`,
          flatValues
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        template_id: templateId,
        message: 'บันทึกโปรแกรมการฝึกเป็นเทมเพลตสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving workout as template:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกโปรแกรมการฝึกเป็นเทมเพลต'
    };
  }
}
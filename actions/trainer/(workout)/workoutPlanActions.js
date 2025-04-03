'use server';

import db from '@/lib/db';

/**
 * ดึงข้อมูลโปรแกรมการฝึกทั้งหมดของเทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ข้อมูลโปรแกรมการฝึก
 */
export async function getTrainerWorkoutPlans(trainerId) {
  try {
    if (!trainerId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์');
    }

    const [plans] = await db.query(
      `SELECT wp.*, 
              m.member_firstname, 
              m.member_lastname, 
              COUNT(we.workout_exercise_id) as exercise_count
       FROM workout_plan wp
       LEFT JOIN member m ON wp.member_id = m.member_id
       LEFT JOIN workout_exercise we ON wp.workout_plan_id = we.workout_plan_id
       WHERE wp.trainer_id = ?
       GROUP BY wp.workout_plan_id
       ORDER BY wp.plan_startdate DESC`,
      [trainerId]
    );

    return {
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        member_name: `${plan.member_firstname || ''} ${plan.member_lastname || ''}`.trim(),
        is_active: plan.plan_status === 'active'
      }))
    };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรมการฝึก'
    };
  }
}

/**
 * ดึงข้อมูลโปรแกรมการฝึกของสมาชิกภายใต้เทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลโปรแกรมการฝึก
 */
export async function getMemberWorkoutPlans(trainerId, memberId) {
  try {
    if (!trainerId || !memberId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์และรหัสสมาชิก');
    }

    const [plans] = await db.query(
      `SELECT wp.*, 
              COUNT(we.workout_exercise_id) as exercise_count
       FROM workout_plan wp
       LEFT JOIN workout_exercise we ON wp.workout_plan_id = we.workout_plan_id
       WHERE wp.trainer_id = ? AND wp.member_id = ?
       GROUP BY wp.workout_plan_id
       ORDER BY wp.plan_startdate DESC`,
      [trainerId, memberId]
    );

    return {
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        is_active: plan.plan_status === 'active'
      }))
    };
  } catch (error) {
    console.error('Error fetching member workout plans:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรมการฝึก'
    };
  }
}

/**
 * ดึงข้อมูลโปรแกรมการฝึกตาม ID
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับการตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} - ข้อมูลโปรแกรมการฝึก
 */
export async function getWorkoutPlanById(planId, trainerId) {
  try {
    if (!planId || !trainerId) {
      throw new Error('กรุณาระบุรหัสโปรแกรมการฝึกและรหัสเทรนเนอร์');
    }

    // ดึงข้อมูลโปรแกรมการฝึก
    const [plans] = await db.query(
      `SELECT wp.*, 
              m.member_firstname, 
              m.member_lastname,
              m.member_gender,
              m.member_profileimage
       FROM workout_plan wp
       JOIN member m ON wp.member_id = m.member_id
       WHERE wp.workout_plan_id = ? AND wp.trainer_id = ?`,
      [planId, trainerId]
    );

    if (plans.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึกหรือไม่มีสิทธิ์ในการเข้าถึง');
    }

    const plan = plans[0];

    // ดึงข้อมูลท่าออกกำลังกายในโปรแกรม
    const [exercises] = await db.query(
      `SELECT * 
       FROM workout_exercise 
       WHERE workout_plan_id = ? 
       ORDER BY exercise_day, exercise_order`,
      [planId]
    );

    return {
      success: true,
      plan: {
        ...plan,
        member_name: `${plan.member_firstname || ''} ${plan.member_lastname || ''}`.trim(),
        is_active: plan.plan_status === 'active'
      },
      exercises
    };
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรมการฝึก'
    };
  }
}

/**
 * สร้างโปรแกรมการฝึกใหม่
 * @param {Object} data - ข้อมูลโปรแกรมการฝึก
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง
 */
export async function createWorkoutPlan(data) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.trainer_id || !data.member_id || !data.plan_name) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น: รหัสเทรนเนอร์, รหัสสมาชิก, ชื่อโปรแกรม');
    }

    // ตรวจสอบการมีอยู่ของเทรนเนอร์และสมาชิก
    const [trainerCheck] = await db.query(
      'SELECT trainer_id FROM trainer WHERE trainer_id = ?',
      [data.trainer_id]
    );

    if (trainerCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลเทรนเนอร์');
    }

    const [memberCheck] = await db.query(
      'SELECT member_id FROM member WHERE member_id = ?',
      [data.member_id]
    );

    if (memberCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลสมาชิก');
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้การดูแลของเทรนเนอร์หรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id 
       FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [data.trainer_id, data.member_id]
    );

    if (registrationCheck.length === 0) {
      throw new Error('สมาชิกไม่ได้อยู่ภายใต้การดูแลของเทรนเนอร์นี้หรือสถานะไม่ถูกต้อง');
    }

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // สร้างโปรแกรมการฝึก
      const [result] = await db.query(
        `INSERT INTO workout_plan 
         (trainer_id, member_id, plan_name, plan_description, 
          plan_startdate, plan_enddate, workout_days, 
          difficulty_level, workout_frequency, plan_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.trainer_id,
          data.member_id,
          data.plan_name,
          data.plan_description || null,
          data.plan_startdate || new Date(),
          data.plan_enddate || null,
          data.workout_days || null,
          data.difficulty_level || 'beginner',
          data.workout_frequency || 3,
          data.plan_status || 'active'
        ]
      );

      if (!result || !result.insertId) {
        throw new Error('ไม่สามารถสร้างโปรแกรมการฝึกได้');
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        plan_id: result.insertId,
        message: 'สร้างโปรแกรมการฝึกสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างโปรแกรมการฝึก'
    };
  }
}

/**
 * อัพเดตโปรแกรมการฝึก
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @param {Object} data - ข้อมูลที่ต้องการอัพเดต
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับการตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} - ผลลัพธ์การอัพเดต
 */
export async function updateWorkoutPlan(planId, data, trainerId) {
  try {
    if (!planId || !data || !trainerId) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น');
    }

    // ตรวจสอบการมีอยู่ของโปรแกรมและสิทธิ์ของเทรนเนอร์
    const [planCheck] = await db.query(
      'SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (planCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึกหรือไม่มีสิทธิ์ในการแก้ไข');
    }

    // สร้าง SQL สำหรับการอัพเดต
    const updates = Object.entries(data)
      .filter(([key]) => key !== 'workout_plan_id' && key !== 'trainer_id') // ไม่อัพเดต primary key และ trainer_id
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    if (!updates) {
      throw new Error('ไม่มีข้อมูลที่ต้องการอัพเดต');
    }
    
    const values = Object.entries(data)
      .filter(([key]) => key !== 'workout_plan_id' && key !== 'trainer_id')
      .map(([_, value]) => value);
    
    values.push(planId); // เพิ่ม planId สำหรับ WHERE clause

    // อัพเดตข้อมูล
    const [result] = await db.query(
      `UPDATE workout_plan SET ${updates} WHERE workout_plan_id = ?`,
      values
    );

    if (!result || result.affectedRows === 0) {
      throw new Error('ไม่สามารถอัพเดตโปรแกรมการฝึกได้');
    }

    return {
      success: true,
      message: 'อัพเดตโปรแกรมการฝึกสำเร็จ'
    };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัพเดตโปรแกรมการฝึก'
    };
  }
}

/**
 * เปลี่ยนสถานะโปรแกรมการฝึก
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @param {string} status - สถานะใหม่ (active, inactive, completed)
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับการตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} - ผลลัพธ์การเปลี่ยนสถานะ
 */
export async function changeWorkoutPlanStatus(planId, status, trainerId) {
  try {
    if (!planId || !status || !trainerId) {
      throw new Error('กรุณาระบุข้อมูลที่จำเป็น');
    }

    // ตรวจสอบสถานะที่ถูกต้อง
    if (!['active', 'inactive', 'completed'].includes(status)) {
      throw new Error('สถานะไม่ถูกต้อง');
    }

    // ตรวจสอบการมีอยู่ของโปรแกรมและสิทธิ์ของเทรนเนอร์
    const [planCheck] = await db.query(
      'SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (planCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึกหรือไม่มีสิทธิ์ในการแก้ไข');
    }

    // อัพเดตสถานะ
    const [result] = await db.query(
      'UPDATE workout_plan SET plan_status = ? WHERE workout_plan_id = ?',
      [status, planId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error('ไม่สามารถเปลี่ยนสถานะโปรแกรมการฝึกได้');
    }

    return {
      success: true,
      message: `เปลี่ยนสถานะโปรแกรมการฝึกเป็น ${status} สำเร็จ`
    };
  } catch (error) {
    console.error('Error changing workout plan status:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะโปรแกรมการฝึก'
    };
  }
}

/**
 * ลบโปรแกรมการฝึก
 * @param {number} planId - รหัสโปรแกรมการฝึก
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับการตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} - ผลลัพธ์การลบ
 */
export async function deleteWorkoutPlan(planId, trainerId) {
  try {
    if (!planId || !trainerId) {
      throw new Error('กรุณาระบุรหัสโปรแกรมการฝึกและรหัสเทรนเนอร์');
    }

    // ตรวจสอบการมีอยู่ของโปรแกรมและสิทธิ์ของเทรนเนอร์
    const [planCheck] = await db.query(
      'SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (planCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลโปรแกรมการฝึกหรือไม่มีสิทธิ์ในการลบ');
    }

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // ลบท่าออกกำลังกายในโปรแกรมก่อน (เนื่องจากมี foreign key constraint)
      await db.query(
        'DELETE FROM workout_exercise WHERE workout_plan_id = ?',
        [planId]
      );

      // ลบโปรแกรมการฝึก
      const [result] = await db.query(
        'DELETE FROM workout_plan WHERE workout_plan_id = ?',
        [planId]
      );

      if (!result || result.affectedRows === 0) {
        throw new Error('ไม่สามารถลบโปรแกรมการฝึกได้');
      }

      // Commit transaction
      await db.query('COMMIT');

      return {
        success: true,
        message: 'ลบโปรแกรมการฝึกสำเร็จ'
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบโปรแกรมการฝึก'
    };
  }
}
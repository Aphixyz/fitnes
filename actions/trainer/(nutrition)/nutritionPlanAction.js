'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * ดึงรายการแผนโภชนาการทั้งหมดของเทรนเนอร์
 */
export async function getNutritionPlans(trainerId) {
  try {
    if (!trainerId) {
      return { success: false, message: 'กรุณาระบุรหัสเทรนเนอร์' };
    }

    const [plans] = await db.query(
      `SELECT np.*, m.member_firstname, m.member_lastname 
       FROM nutrition_plan np
       JOIN member m ON np.member_id = m.member_id
       WHERE np.trainer_id = ?
       ORDER BY np.plan_startdate DESC`,
      [trainerId]
    );

    return { 
      success: true, 
      plans: plans.map(plan => ({
        ...plan,
        member_name: `${plan.member_firstname} ${plan.member_lastname}`
      }))
    };
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ดึงข้อมูลแผนโภชนาการตาม ID
 */
export async function getNutritionPlanById(planId, trainerId) {
  try {
    if (!planId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    const [plans] = await db.query(
      `SELECT np.*, m.member_firstname, m.member_lastname 
       FROM nutrition_plan np
       JOIN member m ON np.member_id = m.member_id
       WHERE np.nutrition_plan_id = ? AND np.trainer_id = ?`,
      [planId, trainerId]
    );

    if (plans.length === 0) {
      return { success: false, message: 'ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์เข้าถึง' };
    }

    return { 
      success: true, 
      plan: {
        ...plans[0],
        member_name: `${plans[0].member_firstname} ${plans[0].member_lastname}`
      }
    };
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ดึงรายการแผนโภชนาการของสมาชิกเฉพาะคน
 */
export async function getMemberNutritionPlans(memberId, trainerId) {
  try {
    if (!memberId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    const [plans] = await db.query(
      `SELECT * FROM nutrition_plan 
       WHERE member_id = ? AND trainer_id = ?
       ORDER BY plan_startdate DESC`,
      [memberId, trainerId]
    );

    return { success: true, plans };
  } catch (error) {
    console.error('Error fetching member nutrition plans:', error);
    return { success: false, message: error.message };
  }
}

/**
 * สร้างแผนโภชนาการใหม่
 */
export async function createNutritionPlan(data) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.trainer_id || !data.member_id || !data.plan_name) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // ตรวจสอบการลงทะเบียนระหว่างเทรนเนอร์และสมาชิก
    const [registrations] = await db.query(
      `SELECT * FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [data.trainer_id, data.member_id]
    );

    if (registrations.length === 0) {
      return { success: false, message: 'สมาชิกไม่ได้อยู่ภายใต้การดูแลของเทรนเนอร์นี้' };
    }

    const [result] = await db.query(
      `INSERT INTO nutrition_plan (
        trainer_id, member_id, plan_name, plan_description, 
        plan_startdate, plan_enddate, daily_calories, 
        protein_target, carbs_target, fat_target, 
        plan_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.trainer_id,
        data.member_id,
        data.plan_name,
        data.plan_description || null,
        data.plan_startdate || new Date(),
        data.plan_enddate || null,
        data.daily_calories || null,
        data.protein_target || null,
        data.carbs_target || null,
        data.fat_target || null,
        data.plan_status || 'active',
        data.notes || null
      ]
    );

    revalidatePath('/trainer/nutrition');
    revalidatePath(`/trainer/members/${data.member_id}`);

    return { 
      success: true, 
      message: 'สร้างแผนโภชนาการสำเร็จ',
      plan_id: result.insertId 
    };
  } catch (error) {
    console.error('Error creating nutrition plan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * อัพเดตแผนโภชนาการ
 */
export async function updateNutritionPlan(planId, data, trainerId) {
  try {
    if (!planId || !data || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบสิทธิ์ในการแก้ไข
    const [plans] = await db.query(
      'SELECT nutrition_plan_id FROM nutrition_plan WHERE nutrition_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (plans.length === 0) {
      return { success: false, message: 'ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์แก้ไข' };
    }

    // ค้นหาโพรเพอร์ตี้ที่จะอัพเดตและสร้าง SQL
    const updateProperties = Object.entries(data)
      .filter(([key]) => {
        // กรองฟิลด์ที่ไม่อนุญาตให้แก้ไข
        return !['nutrition_plan_id', 'trainer_id', 'member_id'].includes(key);
      })
      .map(([key]) => `${key} = ?`);
    
    if (updateProperties.length === 0) {
      return { success: false, message: 'ไม่มีข้อมูลที่ต้องการแก้ไข' };
    }

    const updateValues = Object.entries(data)
      .filter(([key]) => !['nutrition_plan_id', 'trainer_id', 'member_id'].includes(key))
      .map(([_, value]) => value);
      
    // เพิ่มค่า planId สำหรับ WHERE
    updateValues.push(planId);
    
    await db.query(
      `UPDATE nutrition_plan SET ${updateProperties.join(', ')} WHERE nutrition_plan_id = ?`,
      updateValues
    );

    revalidatePath('/trainer/nutrition');
    revalidatePath(`/trainer/nutrition/${planId}`);
    revalidatePath(`/trainer/members/${data.member_id}`);

    return { success: true, message: 'อัพเดตแผนโภชนาการสำเร็จ' };
  } catch (error) {
    console.error('Error updating nutrition plan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * เปลี่ยนสถานะแผนโภชนาการ
 */
export async function changeNutritionPlanStatus(planId, status, trainerId) {
  try {
    if (!planId || !status || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่าสถานะถูกต้อง
    if (!['active', 'inactive', 'completed'].includes(status)) {
      return { success: false, message: 'สถานะไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์ในการแก้ไข
    const [plans] = await db.query(
      'SELECT nutrition_plan_id, member_id FROM nutrition_plan WHERE nutrition_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (plans.length === 0) {
      return { success: false, message: 'ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์แก้ไข' };
    }

    await db.query(
      'UPDATE nutrition_plan SET plan_status = ? WHERE nutrition_plan_id = ?',
      [status, planId]
    );

    revalidatePath('/trainer/nutrition');
    revalidatePath(`/trainer/nutrition/${planId}`);
    revalidatePath(`/trainer/members/${plans[0].member_id}`);

    return { success: true, message: 'เปลี่ยนสถานะแผนโภชนาการสำเร็จ' };
  } catch (error) {
    console.error('Error changing nutrition plan status:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ลบแผนโภชนาการ
 */
export async function deleteNutritionPlan(planId, trainerId) {
  try {
    if (!planId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบสิทธิ์ในการลบ
    const [plans] = await db.query(
      'SELECT nutrition_plan_id, member_id FROM nutrition_plan WHERE nutrition_plan_id = ? AND trainer_id = ?',
      [planId, trainerId]
    );

    if (plans.length === 0) {
      return { success: false, message: 'ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์ลบ' };
    }

    const memberId = plans[0].member_id;

    // เริ่ม transaction เพื่อลบข้อมูลที่เกี่ยวข้องทั้งหมด
    await db.query('START TRANSACTION');
    
    try {
      // ลบมื้ออาหารที่เกี่ยวข้องก่อน (จะลบ meal_food ด้วยเนื่องจาก CASCADE)
      await db.query('DELETE FROM meal_plan WHERE nutrition_plan_id = ?', [planId]);
      
      // ลบแผนโภชนาการ
      await db.query('DELETE FROM nutrition_plan WHERE nutrition_plan_id = ?', [planId]);
      
      // Commit transaction หากทุกอย่างสำเร็จ
      await db.query('COMMIT');
      
      revalidatePath('/trainer/nutrition');
      revalidatePath(`/trainer/members/${memberId}`);
      
      return { success: true, message: 'ลบแผนโภชนาการสำเร็จ' };
    } catch (error) {
      // Rollback หากเกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting nutrition plan:', error);
    return { success: false, message: error.message };
  }
}
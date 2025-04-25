'use server';

import db from '@/lib/db';

/**
 * ดึงเป้าหมายทั้งหมดของสมาชิกที่อยู่ภายใต้เทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลเป้าหมายของสมาชิก
 */
export async function getAllMemberGoals(trainerId, memberId) {
  try {
    // ตรวจสอบว่าสมาชิกอยู่ภายใต้เทรนเนอร์หรือไม่
    const [memberCheck] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck[0].count) {
      throw new Error("ไม่พบข้อมูลสมาชิกภายใต้เทรนเนอร์นี้");
    }

    // ดึงเป้าหมายทั้งหมดของสมาชิก
    const [goals] = await db.query(
      `SELECT * FROM fitness_goal 
       WHERE member_id = ? 
       ORDER BY 
         CASE 
           WHEN fitness_goal_status = 'active' THEN 0
           WHEN fitness_goal_status = 'completed' THEN 1
           ELSE 2
         END, 
         fitness_goal_startdate DESC`,
      [memberId]
    );

    return {
      success: true,
      goals
    };
  } catch (error) {
    console.error('Error fetching member goals:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเป้าหมาย'
    };
  }
}

/**
 * สร้างเป้าหมายใหม่ให้กับสมาชิกโดยเทรนเนอร์
 * @param {Object} data - ข้อมูลเป้าหมาย
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {number} data.memberId - รหัสสมาชิก
 * @param {string} data.goalType - ประเภทเป้าหมาย
 * @param {string} data.startDate - วันที่เริ่มต้น
 * @param {string} data.endDate - วันที่สิ้นสุด
 * @param {number} data.targetWeight - น้ำหนักเป้าหมาย (ถ้ามี)
 * @param {string} data.targetMuscle - เป้าหมายกล้ามเนื้อ (ถ้ามี)
 * @param {string} data.note - บันทึกเพิ่มเติม (ถ้ามี)
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างเป้าหมาย
 */
export async function createGoalByTrainer(data) {
  try {
    const { trainerId, memberId, goalType, startDate, endDate, targetWeight, targetMuscle, note } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !memberId || !goalType || !startDate || !endDate) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้เทรนเนอร์หรือไม่
    const [memberCheck] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck[0].count) {
      throw new Error("ไม่พบข้อมูลสมาชิกภายใต้เทรนเนอร์นี้");
    }

    // ตรวจสอบวันที่
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
    }

    if (end <= start) {
      throw new Error("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น");
    }

    // ถ้าจะสร้างเป้าหมายใหม่ที่ active ให้อัพเดตเป้าหมาย active เดิมเป็น completed
    await db.query(
      `UPDATE fitness_goal 
       SET fitness_goal_status = 'completed' 
       WHERE member_id = ? AND fitness_goal_status = 'active'`,
      [memberId]
    );

    // สร้างเป้าหมายใหม่
    const [result] = await db.query(
      `INSERT INTO fitness_goal (
        member_id, 
        fitness_goal_type, 
        fitness_goal_startdate, 
        fitness_goal_enddate, 
        fitness_goal_status, 
        fitness_goal_targetweight, 
        fitness_goal_targetmuscle, 
        fitness_goal_note
      ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      [memberId, goalType, startDate, endDate, targetWeight || null, targetMuscle || null, note || null]
    );

    return {
      success: true,
      goalId: result.insertId,
      message: "สร้างเป้าหมายสำเร็จ"
    };
  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างเป้าหมาย'
    };
  }
}

/**
 * อัพเดตเป้าหมายของสมาชิกโดยเทรนเนอร์
 * @param {Object} data - ข้อมูลเป้าหมายที่ต้องการอัพเดต
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {number} data.goalId - รหัสเป้าหมาย
 * @param {number} data.memberId - รหัสสมาชิก
 * @param {string} data.goalType - ประเภทเป้าหมาย
 * @param {string} data.startDate - วันที่เริ่มต้น
 * @param {string} data.endDate - วันที่สิ้นสุด
 * @param {string} data.status - สถานะเป้าหมาย
 * @param {number} data.targetWeight - น้ำหนักเป้าหมาย (ถ้ามี)
 * @param {string} data.targetMuscle - เป้าหมายกล้ามเนื้อ (ถ้ามี)
 * @param {string} data.note - บันทึกเพิ่มเติม (ถ้ามี)
 * @returns {Promise<Object>} - ผลลัพธ์การอัพเดตเป้าหมาย
 */
export async function updateGoalByTrainer(data) {
  try {
    const { 
      trainerId, 
      goalId, 
      memberId, 
      goalType, 
      startDate, 
      endDate, 
      status,
      targetWeight, 
      targetMuscle, 
      note 
    } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !goalId || !memberId || !goalType || !startDate || !endDate || !status) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้เทรนเนอร์หรือไม่
    const [memberCheck] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck[0].count) {
      throw new Error("ไม่พบข้อมูลสมาชิกภายใต้เทรนเนอร์นี้");
    }

    // ตรวจสอบว่าเป้าหมายนี้เป็นของสมาชิกคนนี้จริงหรือไม่
    const [goalCheck] = await db.query(
      `SELECT COUNT(*) as count FROM fitness_goal 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [goalId, memberId]
    );

    if (!goalCheck[0].count) {
      throw new Error("ไม่พบข้อมูลเป้าหมาย");
    }

    // ถ้าเปลี่ยนสถานะเป็น active ให้อัพเดตเป้าหมาย active เดิมเป็น completed
    if (status === 'active') {
      await db.query(
        `UPDATE fitness_goal 
         SET fitness_goal_status = 'completed' 
         WHERE member_id = ? AND fitness_goal_status = 'active' AND fitness_goal_id != ?`,
        [memberId, goalId]
      );
    }

    // อัพเดตเป้าหมาย
    const [result] = await db.query(
      `UPDATE fitness_goal 
       SET 
         fitness_goal_type = ?, 
         fitness_goal_startdate = ?, 
         fitness_goal_enddate = ?, 
         fitness_goal_status = ?, 
         fitness_goal_targetweight = ?, 
         fitness_goal_targetmuscle = ?, 
         fitness_goal_note = ?
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [
        goalType, 
        startDate, 
        endDate, 
        status, 
        targetWeight || null, 
        targetMuscle || null, 
        note || null, 
        goalId, 
        memberId
      ]
    );

    if (!result.affectedRows) {
      throw new Error("ไม่สามารถอัพเดตเป้าหมายได้");
    }

    return {
      success: true,
      message: "อัพเดตเป้าหมายสำเร็จ"
    };
  } catch (error) {
    console.error('Error updating goal:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัพเดตเป้าหมาย'
    };
  }
}

/**
 * เปลี่ยนสถานะเป้าหมาย (ทำเสร็จแล้ว, ยกเลิก, ทำต่อ)
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} goalId - รหัสเป้าหมาย
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} newStatus - สถานะใหม่ ('active', 'completed', 'cancelled')
 * @returns {Promise<Object>} - ผลลัพธ์การเปลี่ยนสถานะ
 */
export async function changeGoalStatus(trainerId, goalId, memberId, newStatus) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !goalId || !memberId || !newStatus) {
      throw new Error("กรุณาระบุข้อมูลให้ครบถ้วน");
    }

    // ตรวจสอบว่าสถานะถูกต้องหรือไม่
    if (!['active', 'completed', 'cancelled'].includes(newStatus)) {
      throw new Error("สถานะไม่ถูกต้อง");
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้เทรนเนอร์หรือไม่
    const [memberCheck] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck[0].count) {
      throw new Error("ไม่พบข้อมูลสมาชิกภายใต้เทรนเนอร์นี้");
    }

    // ตรวจสอบว่าเป้าหมายนี้เป็นของสมาชิกคนนี้จริงหรือไม่
    const [goalCheck] = await db.query(
      `SELECT fitness_goal_status FROM fitness_goal 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [goalId, memberId]
    );

    if (!goalCheck.length) {
      throw new Error("ไม่พบข้อมูลเป้าหมาย");
    }

    // ถ้าสถานะเดิมเหมือนสถานะใหม่ ไม่ต้องอัพเดต
    if (goalCheck[0].fitness_goal_status === newStatus) {
      return {
        success: true,
        message: "ไม่มีการเปลี่ยนแปลงสถานะ"
      };
    }

    // ถ้าเปลี่ยนสถานะเป็น active ให้อัพเดตเป้าหมาย active เดิมเป็น completed
    if (newStatus === 'active') {
      await db.query(
        `UPDATE fitness_goal 
         SET fitness_goal_status = 'completed' 
         WHERE member_id = ? AND fitness_goal_status = 'active' AND fitness_goal_id != ?`,
        [memberId, goalId]
      );
    }

    // อัพเดตสถานะเป้าหมาย
    const [result] = await db.query(
      `UPDATE fitness_goal 
       SET fitness_goal_status = ? 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [newStatus, goalId, memberId]
    );

    if (!result.affectedRows) {
      throw new Error("ไม่สามารถเปลี่ยนสถานะเป้าหมายได้");
    }

    return {
      success: true,
      message: `เปลี่ยนสถานะเป้าหมายเป็น ${newStatus} สำเร็จ`
    };
  } catch (error) {
    console.error('Error changing goal status:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะเป้าหมาย'
    };
  }
}

/**
 * ลบเป้าหมายของสมาชิก
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} goalId - รหัสเป้าหมาย
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ผลลัพธ์การลบเป้าหมาย
 */
export async function deleteGoal(trainerId, goalId, memberId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !goalId || !memberId) {
      throw new Error("กรุณาระบุข้อมูลให้ครบถ้วน");
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้เทรนเนอร์หรือไม่
    const [memberCheck] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck[0].count) {
      throw new Error("ไม่พบข้อมูลสมาชิกภายใต้เทรนเนอร์นี้");
    }

    // ลบเป้าหมาย
    const [result] = await db.query(
      `DELETE FROM fitness_goal 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [goalId, memberId]
    );

    if (!result.affectedRows) {
      throw new Error("ไม่สามารถลบเป้าหมายได้");
    }

    return {
      success: true,
      message: "ลบเป้าหมายสำเร็จ"
    };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบเป้าหมาย'
    };
  }
}
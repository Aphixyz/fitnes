"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลเป้าหมายที่กำลังใช้งานของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object|null>} ข้อมูลเป้าหมายที่กำลังใช้งานหรือ null
 */
export async function getActiveMemberGoal(memberId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM fitness_goal 
       WHERE member_id = ? AND fitness_goal_status = 'active' 
       ORDER BY fitness_goal_enddate DESC 
       LIMIT 1`,
      [memberId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching active goal:", error);
    throw new Error("ไม่สามารถดึงข้อมูลเป้าหมายที่กำลังใช้งานได้");
  }
}

/**
 * ดึงประวัติเป้าหมายทั้งหมดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Array>} รายการเป้าหมายทั้งหมด
 */
export async function getMemberGoalHistory(memberId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM fitness_goal 
       WHERE member_id = ? 
       ORDER BY fitness_goal_startdate DESC`,
      [memberId]
    );

    return rows;
  } catch (error) {
    console.error("Error fetching goal history:", error);
    throw new Error("ไม่สามารถดึงประวัติเป้าหมายได้");
  }
}

/**
 * สร้างเป้าหมายใหม่สำหรับสมาชิก
 * @param {Object} goalData - ข้อมูลเป้าหมายที่ต้องการสร้าง
 * @returns {Promise<Object>} ผลลัพธ์การสร้างเป้าหมาย
 */
export async function createMemberGoal(goalData) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !goalData.member_id ||
      !goalData.fitness_goal_type ||
      !goalData.fitness_goal_startdate ||
      !goalData.fitness_goal_enddate
    ) {
      throw new Error("ข้อมูลไม่ครบถ้วน กรุณาระบุรายละเอียดเป้าหมายให้ครบถ้วน");
    }

    // แปลงค่าตัวเลขหากมีการส่งข้อมูลเป็น string
    if (goalData.fitness_goal_targetweight) {
      goalData.fitness_goal_targetweight = parseFloat(
        goalData.fitness_goal_targetweight
      );
    }

    // ตั้งค่าสถานะเริ่มต้นถ้าไม่ได้ระบุ
    if (!goalData.fitness_goal_status) {
      goalData.fitness_goal_status = "active";
    }

    // ถ้าสถานะเป็น active ให้ปรับเป้าหมายอื่นที่ active อยู่เป็น completed
    if (goalData.fitness_goal_status === "active") {
      await pool.query(
        `UPDATE fitness_goal 
         SET fitness_goal_status = 'completed' 
         WHERE member_id = ? AND fitness_goal_status = 'active'`,
        [goalData.member_id]
      );
    }

    // สร้าง SQL parameters
    const fields = Object.keys(goalData);
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((field) => goalData[field]);

    // บันทึกข้อมูล
    const [result] = await pool.query(
      `INSERT INTO fitness_goal (${fields.join(", ")}) 
       VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      fitness_goal_id: result.insertId,
      message: "สร้างเป้าหมายเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error("ไม่สามารถสร้างเป้าหมายได้: " + error.message);
  }
}

/**
 * อัพเดตเป้าหมายของสมาชิก
 * @param {number} goalId - รหัสเป้าหมาย
 * @param {Object} goalData - ข้อมูลเป้าหมายที่ต้องการอัพเดต
 * @returns {Promise<Object>} ผลลัพธ์การอัพเดต
 */
export async function updateMemberGoal(goalId, goalData) {
  try {
    if (!goalId) {
      throw new Error("กรุณาระบุรหัสเป้าหมาย");
    }

    // กรองฟิลด์ fitness_goal_id ออก (ถ้ามี)
    const dataToUpdate = { ...goalData };
    delete dataToUpdate.fitness_goal_id;

    // แปลงค่าตัวเลขหากมีการส่งข้อมูลเป็น string
    if (dataToUpdate.fitness_goal_targetweight) {
      dataToUpdate.fitness_goal_targetweight = parseFloat(
        dataToUpdate.fitness_goal_targetweight
      );
    }

    // ถ้าไม่มีข้อมูลที่จะอัพเดต
    if (Object.keys(dataToUpdate).length === 0) {
      return {
        success: true,
        message: "ไม่มีข้อมูลที่ต้องอัพเดต",
      };
    }

    // ถ้าเปลี่ยนสถานะเป็น active ให้ปรับเป้าหมายอื่นเป็น completed
    if (dataToUpdate.fitness_goal_status === "active") {
      await pool.query(
        `UPDATE fitness_goal 
         SET fitness_goal_status = 'completed' 
         WHERE member_id = ? AND fitness_goal_id != ? AND fitness_goal_status = 'active'`,
        [dataToUpdate.member_id, goalId]
      );
    }

    // สร้าง SQL parameters
    const updates = Object.keys(dataToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(dataToUpdate);
    values.push(goalId); // เพิ่ม goalId สำหรับ WHERE clause

    // อัพเดตข้อมูล
    const [result] = await pool.query(
      `UPDATE fitness_goal 
       SET ${updates} 
       WHERE fitness_goal_id = ?`,
      values
    );

    // ตรวจสอบว่ามีการอัพเดตจริงหรือไม่
    if (result.affectedRows === 0) {
      throw new Error("ไม่พบเป้าหมายที่ต้องการอัพเดต");
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: "อัพเดตเป้าหมายเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error("ไม่สามารถอัพเดตเป้าหมายได้: " + error.message);
  }
}

/**
 * เปลี่ยนสถานะเป้าหมายของสมาชิก
 * @param {number} goalId - รหัสเป้าหมาย
 * @param {string} status - สถานะใหม่ (active, completed, cancelled)
 * @param {number} memberId - รหัสสมาชิก (สำหรับความปลอดภัย)
 * @returns {Promise<Object>} ผลลัพธ์การเปลี่ยนสถานะ
 */
export async function changeMemberGoalStatus(goalId, status, memberId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!goalId || !status || !memberId) {
      throw new Error("กรุณาระบุข้อมูลให้ครบถ้วน");
    }

    // ตรวจสอบสถานะที่ถูกต้อง
    if (!["active", "completed", "cancelled"].includes(status)) {
      throw new Error("สถานะไม่ถูกต้อง");
    }

    // ถ้าต้องการเปลี่ยนเป็น active ให้ยกเลิกเป้าหมาย active อื่นๆ ก่อน
    if (status === "active") {
      await pool.query(
        `UPDATE fitness_goal 
         SET fitness_goal_status = 'completed' 
         WHERE member_id = ? AND fitness_goal_id != ? AND fitness_goal_status = 'active'`,
        [memberId, goalId]
      );
    }

    // อัพเดตสถานะเป้าหมาย
    const [result] = await pool.query(
      `UPDATE fitness_goal 
       SET fitness_goal_status = ? 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [status, goalId, memberId]
    );

    // ตรวจสอบว่ามีการอัพเดตจริงหรือไม่
    if (result.affectedRows === 0) {
      throw new Error("ไม่พบเป้าหมายที่ต้องการเปลี่ยนสถานะ หรือคุณไม่มีสิทธิ์");
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: `เปลี่ยนสถานะเป้าหมายเป็น ${status} เรียบร้อยแล้ว`,
    };
  } catch (error) {
    console.error("Error changing goal status:", error);
    throw new Error("ไม่สามารถเปลี่ยนสถานะเป้าหมายได้: " + error.message);
  }
}

/**
 * ลบเป้าหมายของสมาชิก
 * @param {number} goalId - รหัสเป้าหมาย
 * @param {number} memberId - รหัสสมาชิก (สำหรับความปลอดภัย)
 * @returns {Promise<Object>} ผลลัพธ์การลบเป้าหมาย
 */
export async function deleteMemberGoal(goalId, memberId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!goalId || !memberId) {
      throw new Error("กรุณาระบุข้อมูลให้ครบถ้วน");
    }

    // ลบข้อมูลโดยตรวจสอบทั้ง fitness_goal_id และ member_id เพื่อความปลอดภัย
    const [result] = await pool.query(
      `DELETE FROM fitness_goal 
       WHERE fitness_goal_id = ? AND member_id = ?`,
      [goalId, memberId]
    );

    // ตรวจสอบว่ามีการลบจริงหรือไม่
    if (result.affectedRows === 0) {
      throw new Error("ไม่พบเป้าหมายที่ต้องการลบ หรือคุณไม่มีสิทธิ์");
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: "ลบเป้าหมายเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error("ไม่สามารถลบเป้าหมายได้: " + error.message);
  }
}

/**
 * ดึงข้อมูลเป้าหมายตาม ID
 * @param {number} goalId - รหัสเป้าหมาย
 * @returns {Promise<Object|null>} ข้อมูลเป้าหมายหรือ null
 */
export async function getGoalById(goalId) {
  try {
    if (!goalId) {
      throw new Error("กรุณาระบุรหัสเป้าหมาย");
    }

    const [rows] = await pool.query(
      `SELECT * FROM fitness_goal 
       WHERE fitness_goal_id = ?`,
      [goalId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching goal by ID:", error);
    throw new Error("ไม่สามารถดึงข้อมูลเป้าหมายได้: " + error.message);
  }
}

"use server";

import pool from "@/lib/db";
import { validateMacroRatiosWithMessage } from "@/utils/macro-utils";
import { isMacroPlanActive } from "../../../macro-engine/macro-engine";

/**
 * อัปเดต macro targets ของแผนโภชนาการ
 * @param {Object} updateData - ข้อมูลการอัปเดต
 * @param {number} updateData.planId - รหัสแผนโภชนาการ
 * @param {number} updateData.trainerId - รหัสเทรนเนอร์ (เพื่อตรวจสอบสิทธิ์)
 * @param {number} updateData.proteinRatio - เปอร์เซ็นต์โปรตีน (0-100)
 * @param {number} updateData.carbRatio - เปอร์เซ็นต์คาร์บ (0-100)
 * @param {number} updateData.fatRatio - เปอร์เซ็นต์ไขมัน (0-100)
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
 */
export async function updateMacroTargets(updateData) {
  const connection = await pool.getConnection();

  try {
    const { planId, trainerId, proteinRatio, carbRatio, fatRatio } = updateData;

    if (!planId || !trainerId) {
      throw new Error("ข้อมูลแผนและเทรนเนอร์จำเป็นต้องระบุ");
    }

    // ตรวจสอบว่าแผนมีอยู่และเทรนเนอร์มีสิทธิ์แก้ไข
    const [planExists] = await connection.query(
      `SELECT macro_plan_id, trainer_id, member_id, plan_status,
              protein_ratio, carb_ratio, fat_ratio,
              start_date, end_date
       FROM macro_plan 
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [planId, trainerId]
    );

    if (!planExists || planExists.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์แก้ไข");
    }

    const existingPlan = planExists[0];

    // ตรวจสอบ macro ratios
    const ratioValidation = validateMacroRatiosWithMessage(
      proteinRatio,
      carbRatio,
      fatRatio
    );
    if (!ratioValidation.isValid) {
      throw new Error(ratioValidation.message);
    }

    // ตรวจสอบว่าการเปลี่ยนแปลงมีจริงหรือไม่
    const hasChanges =
      parseFloat(existingPlan.protein_ratio) !== proteinRatio ||
      parseFloat(existingPlan.carb_ratio) !== carbRatio ||
      parseFloat(existingPlan.fat_ratio) !== fatRatio;

    if (!hasChanges) {
      return {
        success: true,
        message: "ไม่มีการเปลี่ยนแปลง",
        data: { planId, hasChanges: false },
      };
    }

    // เริ่ม transaction
    await connection.beginTransaction();

    // อัปเดต macro ratios
    await connection.query(
      `UPDATE macro_plan 
       SET protein_ratio = ?, carb_ratio = ?, fat_ratio = ?
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [proteinRatio, carbRatio, fatRatio, planId, trainerId]
    );

    // ดึงข้อมูลแผนที่อัปเดตแล้ว
    const [updatedPlan] = await connection.query(
      `SELECT mp.*, 
              t.trainer_firstname, t.trainer_lastname,
              m.member_firstname, m.member_lastname
       FROM macro_plan mp
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       JOIN member m ON mp.member_id = m.member_id
       WHERE mp.macro_plan_id = ?`,
      [planId]
    );

    await connection.commit();

    return {
      success: true,
      message: "อัปเดต macro targets เรียบร้อยแล้ว",
      data: {
        planId,
        plan: updatedPlan[0],
        hasChanges: true,
        changes: {
          protein: {
            from: parseFloat(existingPlan.protein_ratio),
            to: proteinRatio,
          },
          carb: {
            from: parseFloat(existingPlan.carb_ratio),
            to: carbRatio,
          },
          fat: {
            from: parseFloat(existingPlan.fat_ratio),
            to: fatRatio,
          },
        },
      },
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating macro targets:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดต macro targets",
    };
  } finally {
    connection.release();
  }
}

/**
 * อัปเดตช่วงเวลาของแผนโภชนาการ
 * @param {Object} updateData - ข้อมูลการอัปเดต
 * @param {number} updateData.planId - รหัสแผนโภชนาการ
 * @param {number} updateData.trainerId - รหัสเทรนเนอร์
 * @param {string} updateData.startDate - วันเริ่มต้นใหม่
 * @param {string} updateData.endDate - วันสิ้นสุดใหม่
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
 */
export async function updateMacroPlanPeriod(updateData) {
  const connection = await pool.getConnection();

  try {
    const { planId, trainerId, startDate, endDate } = updateData;

    if (!planId || !trainerId || !startDate || !endDate) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบว่าแผนมีอยู่และเทรนเนอร์มีสิทธิ์แก้ไข
    const [planExists] = await connection.query(
      `SELECT macro_plan_id, trainer_id, member_id, plan_status,
              start_date, end_date
       FROM macro_plan 
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [planId, trainerId]
    );

    if (!planExists || planExists.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์แก้ไข");
    }

    // ตรวจสอบวันที่
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start >= end) {
      throw new Error("วันเริ่มต้นต้องมาก่อนวันสิ้นสุด");
    }

    if (end < today) {
      throw new Error("วันสิ้นสุดต้องไม่เป็นอดีต");
    }

    // อัปเดตช่วงเวลา
    await connection.query(
      `UPDATE macro_plan 
       SET start_date = ?, end_date = ?
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [startDate, endDate, planId, trainerId]
    );

    // ดึงข้อมูลที่อัปเดตแล้ว
    const [updatedPlan] = await connection.query(
      `SELECT mp.*, 
              t.trainer_firstname, t.trainer_lastname,
              m.member_firstname, m.member_lastname
       FROM macro_plan mp
       JOIN trainer t ON mp.trainer_id = t.trainer_id
       JOIN member m ON mp.member_id = m.member_id
       WHERE mp.macro_plan_id = ?`,
      [planId]
    );

    return {
      success: true,
      message: "อัปเดตช่วงเวลาแผนโภชนาการเรียบร้อยแล้ว",
      data: {
        planId,
        plan: updatedPlan[0],
      },
    };
  } catch (error) {
    console.error("Error updating macro plan period:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตช่วงเวลา",
    };
  } finally {
    connection.release();
  }
}

/**
 * เปลี่ยนสถานะแผนโภชนาการ
 * @param {Object} updateData - ข้อมูลการอัปเดต
 * @param {number} updateData.planId - รหัสแผนโภชนาการ
 * @param {number} updateData.trainerId - รหัสเทรนเนอร์
 * @param {string} updateData.status - สถานะใหม่ ("active" | "inactive")
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
 */
export async function updateMacroPlanStatus(updateData) {
  const connection = await pool.getConnection();

  try {
    const { planId, trainerId, status } = updateData;

    if (!planId || !trainerId || !status) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    if (!["active", "inactive"].includes(status)) {
      throw new Error("สถานะไม่ถูกต้อง");
    }

    // ตรวจสอบว่าแผนมีอยู่และเทรนเนอร์มีสิทธิ์แก้ไข
    const [planExists] = await connection.query(
      `SELECT macro_plan_id, trainer_id, member_id, plan_status
       FROM macro_plan 
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [planId, trainerId]
    );

    if (!planExists || planExists.length === 0) {
      throw new Error("ไม่พบแผนโภชนาการหรือไม่มีสิทธิ์แก้ไข");
    }

    const existingPlan = planExists[0];

    // เริ่ม transaction
    await connection.beginTransaction();

    // หากเปลี่ยนเป็น active ให้ปิด active plans อื่น ๆ ของสมาชิกคนเดียวกัน
    if (status === "active") {
      await connection.query(
        `UPDATE macro_plan 
         SET plan_status = 'inactive' 
         WHERE member_id = ? AND macro_plan_id != ? AND plan_status = 'active'`,
        [existingPlan.member_id, planId]
      );
    }

    // อัปเดตสถานะ
    await connection.query(
      `UPDATE macro_plan 
       SET plan_status = ?
       WHERE macro_plan_id = ? AND trainer_id = ?`,
      [status, planId, trainerId]
    );

    await connection.commit();

    return {
      success: true,
      message: `เปลี่ยนสถานะแผนเป็น ${
        status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"
      } เรียบร้อยแล้ว`,
      data: {
        planId,
        oldStatus: existingPlan.plan_status,
        newStatus: status,
      },
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating macro plan status:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ",
    };
  } finally {
    connection.release();
  }
}

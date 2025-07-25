"use server";

import pool from "@/lib/db";

/**
 * ลบ nutrition intake record
 * @param {number} intakeId - ID ของ intake record
 * @param {number} memberId - ID ของสมาชิก (เพื่อความปลอดภัย)
 * @returns {Promise<boolean>} true ถ้าลบสำเร็จ
 */
export async function deleteIntakeRecord(intakeId, memberId) {
  try {
    // Validate input
    if (!intakeId || typeof intakeId !== "number") {
      throw new Error("Intake ID is required and must be a number");
    }

    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    // ตรวจสอบว่า record นี้เป็นของ member นี้จริงหรือไม่
    const checkQuery = `
      SELECT intake_id FROM intake_logs 
      WHERE intake_id = ? AND member_id = ?
      LIMIT 1
    `;

    const [checkRows] = await pool.execute(checkQuery, [intakeId, memberId]);

    if (checkRows.length === 0) {
      throw new Error("Intake record not found or access denied");
    }

    // ลบข้อมูล
    const deleteQuery = `
      DELETE FROM intake_logs 
      WHERE intake_id = ? AND member_id = ?
    `;

    const [result] = await pool.execute(deleteQuery, [intakeId, memberId]);

    // ตรวจสอบว่าลบสำเร็จหรือไม่
    if (result.affectedRows === 0) {
      throw new Error("Failed to delete intake record");
    }

    return true;
  } catch (error) {
    console.error("Error deleting intake record:", error);
    throw new Error(`Failed to delete intake record: ${error.message}`);
  }
}

/**
 * ลบ nutrition intake records หลายรายการพร้อมกัน
 * @param {Array<number>} intakeIds - Array ของ intake IDs
 * @param {number} memberId - ID ของสมาชิก (เพื่อความปลอดภัย)
 * @returns {Promise<number>} จำนวนรายการที่ลบสำเร็จ
 */
export async function deleteMultipleIntakeRecords(intakeIds, memberId) {
  try {
    // Validate input
    if (!Array.isArray(intakeIds) || intakeIds.length === 0) {
      throw new Error("Intake IDs array is required and must not be empty");
    }

    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    // Validate all IDs are numbers
    if (!intakeIds.every((id) => typeof id === "number")) {
      throw new Error("All intake IDs must be numbers");
    }

    // ตรวจสอบว่า records เหล่านี้เป็นของ member นี้จริงหรือไม่
    const checkQuery = `
      SELECT intake_id FROM intake_logs 
      WHERE intake_id IN (${intakeIds.map(() => "?").join(",")}) 
        AND member_id = ?
    `;

    const [checkRows] = await pool.execute(checkQuery, [
      ...intakeIds,
      memberId,
    ]);

    if (checkRows.length !== intakeIds.length) {
      throw new Error("Some intake records not found or access denied");
    }

    // ลบข้อมูลหลายรายการ
    const deleteQuery = `
      DELETE FROM intake_logs 
      WHERE intake_id IN (${intakeIds.map(() => "?").join(",")}) 
        AND member_id = ?
    `;

    const [result] = await pool.execute(deleteQuery, [...intakeIds, memberId]);

    return result.affectedRows;
  } catch (error) {
    console.error("Error deleting multiple intake records:", error);
    throw new Error(
      `Failed to delete multiple intake records: ${error.message}`
    );
  }
}

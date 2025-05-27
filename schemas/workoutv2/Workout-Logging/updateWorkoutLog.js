"use server";

import db from "@/lib/db";

/**
 * อัปเดตข้อมูลในบันทึกการออกกำลังกาย (workout log) ที่มีอยู่แล้ว
 * @param {number} workoutLogId - รหัสบันทึกการออกกำลังกาย
 * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
 * @param {string} [updateData.notes] - บันทึกเพิ่มเติม
 * @param {number} [updateData.completion_percentage] - เปอร์เซ็นต์ความสำเร็จ
 * @param {number} [updateData.intensity_level] - ระดับความเข้มข้น
 * @param {number} [updateData.duration_minutes] - ระยะเวลาที่ใช้ (นาที)
 * @param {number} userId - รหัสผู้ใช้ (trainer_id หรือ member_id)
 * @param {string} userRole - บทบาทของผู้ใช้ ('trainer' หรือ 'member')
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
 */
export async function updateWorkoutLog(
  workoutLogId,
  updateData,
  userId,
  userRole
) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!workoutLogId) {
      throw new Error("กรุณาระบุรหัสบันทึกการออกกำลังกาย");
    }

    if (!userId || !userRole) {
      throw new Error("กรุณาระบุข้อมูลผู้ใช้");
    }

    // ตรวจสอบว่ามีข้อมูลที่ต้องการอัปเดตหรือไม่
    if (Object.keys(updateData).length === 0) {
      throw new Error("กรุณาระบุข้อมูลที่ต้องการอัปเดต");
    }

    // ตรวจสอบสิทธิ์ในการอัปเดต
    let canUpdate = false;

    if (userRole === "member") {
      // สมาชิกสามารถอัปเดตได้เฉพาะบันทึกของตัวเอง
      const [memberLogs] = await db.query(
        "SELECT workout_log_id FROM workout_log WHERE workout_log_id = ? AND member_id = ?",
        [workoutLogId, userId]
      );

      canUpdate = memberLogs.length > 0;
    } else if (userRole === "trainer") {
      // เทรนเนอร์สามารถอัปเดตได้เฉพาะบันทึกของสมาชิกที่อยู่ภายใต้การดูแล
      const [trainerLogs] = await db.query(
        `
        SELECT wl.workout_log_id 
        FROM workout_log wl
        JOIN workout_plan wp ON wl.workout_plan_id = wp.workout_plan_id
        WHERE wl.workout_log_id = ? AND wp.trainer_id = ?
      `,
        [workoutLogId, userId]
      );

      canUpdate = trainerLogs.length > 0;
    }

    if (!canUpdate) {
      throw new Error("คุณไม่มีสิทธิ์ในการอัปเดตบันทึกนี้");
    }

    // สร้าง query สำหรับอัปเดต
    const allowedFields = [
      "notes",
      "completion_percentage",
      "intensity_level",
      "duration_minutes",
    ];

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error("ไม่มีข้อมูลที่สามารถอัปเดตได้");
    }

    // เพิ่ม workoutLogId ไว้ท้าย values array
    values.push(workoutLogId);

    // อัปเดตข้อมูล
    const updateQuery = `
      UPDATE workout_log 
      SET ${fields.join(", ")} 
      WHERE workout_log_id = ?
    `;

    const [result] = await db.query(updateQuery, values);

    if (result.affectedRows === 0) {
      throw new Error("ไม่สามารถอัปเดตบันทึกได้");
    }

    // ดึงข้อมูลหลังอัปเดต
    const [updatedLogs] = await db.query(
      "SELECT * FROM workout_log WHERE workout_log_id = ?",
      [workoutLogId]
    );

    return {
      success: true,
      message: "อัปเดตบันทึกการออกกำลังกายสำเร็จ",
      log: updatedLogs[0],
    };
  } catch (error) {
    console.error("Error updating workout log:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตบันทึกการออกกำลังกาย",
    };
  }
}

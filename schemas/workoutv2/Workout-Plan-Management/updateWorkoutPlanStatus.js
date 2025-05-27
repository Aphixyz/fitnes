"use server";

import db from "@/lib/db";

/**
 * เปลี่ยนสถานะแผนการออกกำลังกาย (active/inactive/completed)
 * @param {number} workoutPlanId - รหัสแผนการออกกำลังกาย
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับตรวจสอบสิทธิ์)
 * @param {string} newStatus - สถานะที่ต้องการเปลี่ยน ('active', 'inactive', 'completed') ค่าเริ่มต้นคือ 'inactive'
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function updateWorkoutPlanStatus(
  workoutPlanId,
  trainerId,
  newStatus = "inactive"
) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!workoutPlanId || !trainerId) {
      throw new Error("กรุณาระบุรหัสแผนการออกกำลังกายและรหัสเทรนเนอร์");
    }

    // ตรวจสอบว่าสถานะที่ระบุถูกต้องหรือไม่
    const validStatuses = ["active", "inactive", "completed"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        "สถานะไม่ถูกต้อง กรุณาระบุ active, inactive หรือ completed"
      );
    }

    // ตรวจสอบว่าแผนการออกกำลังกายนี้เป็นของเทรนเนอร์นี้หรือไม่ และดึงสถานะปัจจุบัน
    const [plans] = await db.query(
      `SELECT workout_plan_id, plan_status FROM workout_plan 
       WHERE workout_plan_id = ? AND trainer_id = ?`,
      [workoutPlanId, trainerId]
    );

    if (plans.length === 0) {
      throw new Error(
        "ไม่พบแผนการออกกำลังกายหรือคุณไม่มีสิทธิ์ในการแก้ไขแผนนี้"
      );
    }

    // ตรวจสอบว่าแผนอยู่ในสถานะ "completed" หรือไม่
    const currentStatus = plans[0].plan_status;
    if (currentStatus === "completed" && newStatus !== "completed") {
      throw new Error(
        "ไม่สามารถเปลี่ยนสถานะแผนการออกกำลังกายที่เสร็จสิ้นแล้วได้"
      );
    }

    // อัปเดตสถานะตามที่ระบุ
    await db.query(
      `UPDATE workout_plan SET plan_status = ? WHERE workout_plan_id = ?`,
      [newStatus, workoutPlanId]
    );

    // คำอธิบายสถานะที่อัปเดต
    const statusMessages = {
      active: "เปิดใช้งาน",
      inactive: "ไม่ใช้งาน",
      completed: "เสร็จสิ้น",
    };

    return {
      success: true,
      message: `เปลี่ยนสถานะแผนการออกกำลังกายเป็น ${statusMessages[newStatus]} สำเร็จ`,
    };
  } catch (error) {
    console.error("Error updating workout plan status:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะแผนการออกกำลังกาย",
    };
  }
}

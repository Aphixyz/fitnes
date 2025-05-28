"use server";

import db from "@/lib/db";

/**
 * คัดลอกแผนการออกกำลังกายที่มีอยู่แล้วเป็นแผนใหม่
 * @param {number} sourcePlanId - รหัสแผนการออกกำลังกายต้นฉบับ
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {Object} newPlanInfo - ข้อมูลสำหรับแผนใหม่ (ไม่จำเป็นต้องมี)
 * @param {number} [targetMemberId] - รหัสสมาชิกที่จะกำหนดแผนใหม่ให้ (ถ้าไม่มีจะใช้สมาชิกเดิม)
 * @returns {Promise<Object>} - ผลลัพธ์การดำเนินการ
 */
export async function cloneWorkoutPlan(
  sourcePlanId,
  trainerId,
  newPlanInfo = {},
  targetMemberId = null
) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!sourcePlanId || !trainerId) {
      throw new Error("กรุณาระบุรหัสแผนการออกกำลังกายต้นฉบับและรหัสเทรนเนอร์");
    }

    // ดึงข้อมูลแผนการออกกำลังกายต้นฉบับ
    const [sourcePlans] = await db.query(
      `SELECT * FROM workout_plan WHERE workout_plan_id = ? AND trainer_id = ?`,
      [sourcePlanId, trainerId]
    );

    if (sourcePlans.length === 0) {
      throw new Error(
        "ไม่พบแผนการออกกำลังกายต้นฉบับ หรือคุณไม่มีสิทธิ์ในการเข้าถึง"
      );
    }

    const sourcePlan = sourcePlans[0];

    // เริ่ม Transaction
    await db.query("START TRANSACTION");

    try {
      // สร้างแผนการออกกำลังกายใหม่
      const [newPlanResult] = await db.query(
        `INSERT INTO workout_plan (
          template_id, trainer_id, member_id, plan_name, 
          plan_startdate, plan_enddate, plan_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sourcePlan.template_id,
          trainerId,
          targetMemberId || sourcePlan.member_id,
          newPlanInfo.plan_name || `คัดลอกจาก: ${sourcePlan.plan_name}`,
          newPlanInfo.plan_startdate || new Date(),
          newPlanInfo.plan_enddate || sourcePlan.plan_enddate,
          newPlanInfo.plan_status || "active",
        ]
      );

      const newPlanId = newPlanResult.insertId;

      // ดึงข้อมูลเซสชันทั้งหมดจากแผนต้นฉบับ
      const [sessions] = await db.query(
        `SELECT * FROM workout_session WHERE workout_plan_id = ? ORDER BY order_index`,
        [sourcePlanId]
      );

      // คัดลอกเซสชันและท่าออกกำลังกาย
      for (const session of sessions) {
        // สร้างเซสชันใหม่
        const [newSessionResult] = await db.query(
          `INSERT INTO workout_session (
            workout_plan_id, session_name, day_of_week, order_index
          ) VALUES (?, ?, ?, ?)`,
          [
            newPlanId,
            session.session_name,
            session.day_of_week,
            session.order_index,
          ]
        );

        const newSessionId = newSessionResult.insertId;

        // ดึงข้อมูลท่าออกกำลังกายในเซสชันต้นฉบับ
        const [exercises] = await db.query(
          `SELECT * FROM workout_exercise WHERE session_id = ? ORDER BY order_index`,
          [session.session_id]
        );

        // คัดลอกท่าออกกำลังกาย
        if (exercises.length > 0) {
          const exerciseValues = exercises.map((exercise) => [
            newSessionId,
            exercise.exercise_id,
            exercise.order_index,
            exercise.sets,
            exercise.reps,
            exercise.weight_kg,
            exercise.rest_seconds,
            exercise.notes,
          ]);

          // ใช้ bulk insert เพื่อประสิทธิภาพ
          const placeholders = exercises
            .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
            .join(", ");

          await db.query(
            `INSERT INTO workout_exercise (
              session_id, exercise_id, order_index, sets, 
              reps, weight_kg, rest_seconds, notes
            ) VALUES ${placeholders}`,
            exerciseValues.flat()
          );
        }
      }

      // ยืนยันการทำรายการ
      await db.query("COMMIT");

      return {
        success: true,
        message: "คัดลอกแผนการออกกำลังกายสำเร็จ",
        workout_plan_id: newPlanId,
      };
    } catch (error) {
      // ยกเลิกการทำรายการหากเกิดข้อผิดพลาด
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error cloning workout plan:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการคัดลอกแผนการออกกำลังกาย",
    };
  }
}

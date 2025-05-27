"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ปรับให้รับพารามิเตอร์เป็น FormData
export async function createWorkoutPlanForMember(formData) {
  console.log(
    "Server Action Received:",
    Object.fromEntries(formData.entries())
  );

  // ดึงค่าจาก FormData
  const trainer_id = Number(formData.get("trainer_id"));
  const member_id = Number(formData.get("member_id"));
  const plan_name = formData.get("plan_name");
  const plan_duration = Number(formData.get("plan_duration"));
  const plan_startdate = formData.get("plan_startdate");
  const plan_enddate = formData.get("plan_enddate") || null;
  const plan_note = formData.get("plan_note") || null;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!plan_name || !plan_name.trim()) {
    return { success: false, message: "กรุณาระบุชื่อโปรแกรม" };
  }

  if (!plan_startdate || !plan_startdate.trim()) {
    return { success: false, message: "กรุณาระบุวันเริ่มต้น" };
  }

  if (!trainer_id || !member_id) {
    return { success: false, message: "ข้อมูลไม่ถูกต้อง" };
  }

  const connection = await pool.getConnection();

  let newPlanId;

  try {
    // เช็คสิทธิ์ว่า trainer ดูแล member จริงไหม
    const [memberCheck] = await connection.query(
      "SELECT registration_id FROM registration WHERE trainer_id = ? AND member_id = ? AND registration_status = 1",
      [trainer_id, member_id]
    );

    if (!memberCheck.length) {
      return {
        success: false,
        message: "สมาชิกนี้ไม่ได้อยู่ภายใต้การดูแลของคุณ",
      };
    }

    // ทำงานตามโค้ดที่มีอยู่เดิม...
    await connection.beginTransaction();

    // ตรวจสอบว่ามี workout plan ที่เป็น active อยู่เดิมหรือไม่
    const [existingPlans] = await connection.query(
      "SELECT workout_plan_id FROM workout_plan WHERE member_id = ? AND plan_status = 'active'",
      [member_id]
    );

    // ถ้ามี plan ที่ active อยู่แล้ว ให้ปรับเป็น inactive
    if (existingPlans.length > 0) {
      await connection.query(
        "UPDATE workout_plan SET plan_status = 'inactive' WHERE member_id = ? AND plan_status = 'active'",
        [member_id]
      );
    }

    // คำนวณวันสิ้นสุด หรือกำหนดเป็น null สำหรับไม่มีวันสิ้นสุด
    let calculatedEndDate = null;

    if (plan_enddate && plan_enddate.trim() !== "") {
      calculatedEndDate = plan_enddate;
    } else if (plan_duration > 0) {
      const startDate = new Date(plan_startdate);
      startDate.setDate(startDate.getDate() + plan_duration * 7);
      calculatedEndDate = startDate.toISOString().split("T")[0];
    }

    // สร้าง workout_plan ใหม่ด้วยสถานะ active
    const [planResult] = await connection.query(
      `INSERT INTO workout_plan 
       (trainer_id, member_id, plan_name, plan_duration, plan_startdate, plan_enddate, plan_note, plan_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        trainer_id,
        member_id,
        plan_name,
        plan_duration,
        plan_startdate,
        calculatedEndDate,
        plan_note,
      ]
    );

    newPlanId = planResult.insertId;

    // ยืนยันการทำงานทั้งหมด
    await connection.commit();

    // Revalidate path เพื่อให้ข้อมูลถูกอัปเดต
    revalidatePath(`/trainer/${trainer_id}/members/${member_id}/workout-plan`);
  } catch (error) {
    // ยกเลิกการทำงานทั้งหมดหากเกิดข้อผิดพลาด
    await connection.rollback();
    console.error("เกิดข้อผิดพลาด:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างโปรแกรม กรุณาลองใหม่",
    };
  } finally {
    connection.release();
  }

  // ใช้ redirect จาก next/navigation เพื่อเปลี่ยนเส้นทาง
  redirect(
    `/trainer/${trainer_id}/members/${member_id}/workout-plan/${newPlanId}`
  );
}

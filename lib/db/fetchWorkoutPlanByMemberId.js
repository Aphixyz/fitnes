"use server";

import pool from "@/lib/db";

export async function fetchWorkoutPlanByMemberId(trainerId, memberId) {
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบความสัมพันธ์ระหว่างเทรนเนอร์และสมาชิก
    const [memberCheck] = await connection.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 1`,
      [trainerId, memberId]
    );

    if (!memberCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลของสมาชิกนี้",
      };
    }

    // ดึงข้อมูลสมาชิก (สำหรับชื่อ)
    const [memberData] = await connection.query(
      "SELECT member_firstname, member_lastname FROM member WHERE member_id = ?",
      [memberId]
    );

    if (!memberData.length) {
      return {
        success: false,
        error: "not_found",
        message: "ไม่พบข้อมูลสมาชิก",
      };
    }

    // ดึงรายการแผนการออกกำลังกาย
    const [plans] = await connection.query(
      `SELECT 
         wp.*,
         CASE 
           WHEN CURDATE() < wp.plan_startdate THEN 'upcoming'
           WHEN wp.plan_enddate IS NULL OR CURDATE() <= wp.plan_enddate THEN 'active'
           ELSE 'completed'
         END as plan_timeline_status
       FROM workout_plan wp
       WHERE wp.trainer_id = ? AND wp.member_id = ?
       ORDER BY 
         wp.plan_status = 'active' DESC,
         wp.created_at DESC`,
      [trainerId, memberId]
    );

    // นับจำนวนโปรแกรมในแต่ละแผน
    const planIds = plans.map((p) => p.workout_plan_id);
    let programCounts = {};

    if (planIds.length > 0) {
      const [programs] = await connection.query(
        `SELECT 
           workout_plan_id, 
           COUNT(*) as program_count
         FROM workout_program
         WHERE workout_plan_id IN (?)
         GROUP BY workout_plan_id`,
        [planIds]
      );

      programCounts = programs.reduce((acc, curr) => {
        acc[curr.workout_plan_id] = curr.program_count;
        return acc;
      }, {});
    }

    // เพิ่มจำนวนโปรแกรมลงในแผน
    plans.forEach((plan) => {
      plan.program_count = programCounts[plan.workout_plan_id] || 0;
    });

    return {
      success: true,
      member: memberData[0],
      plans: plans.map((plan) => ({
        ...plan,
        // แปลงเวลาเป็น string เพื่อให้ JSON.stringify ทำงานได้
        created_at: plan.created_at ? plan.created_at.toISOString() : null,
        updated_at: plan.updated_at ? plan.updated_at.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return {
      success: false,
      error: "database_error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรม",
    };
  } finally {
    connection.release();
  }
}

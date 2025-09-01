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

    // ดึงรายการแผนการออกกำลังกาย พร้อมจำนวนโปรแกรม
    const [plans] = await connection.query(
      `SELECT 
         wp.*,
         wp.plan_duration as duration_weeks,
         wp.plan_startdate as start_date,
         COUNT(prog.workout_program_id) as program_count,
         CASE 
           WHEN CURDATE() < wp.plan_startdate THEN 'upcoming'
           WHEN wp.plan_enddate IS NULL OR CURDATE() <= wp.plan_enddate THEN 'active'
           ELSE 'completed'
         END as plan_timeline_status
       FROM workout_plan wp
       LEFT JOIN workout_program prog ON wp.workout_plan_id = prog.workout_plan_id
       WHERE wp.trainer_id = ? AND wp.member_id = ?
       GROUP BY wp.workout_plan_id
       ORDER BY 
         wp.plan_status = 'active' DESC,
         wp.created_at DESC`,
      [trainerId, memberId]
    );

    // จำนวนโปรแกรมได้มาจาก LEFT JOIN แล้ว ไม่ต้องเพิ่มอีก

    return {
      success: true,
      member: memberData[0],
      plans: plans.map((plan) => ({
        ...plan,
        // แปลงเวลาเป็น string เพื่อให้ JSON.stringify ทำงานได้
        created_at: plan.created_at ? plan.created_at.toISOString() : null,
        updated_at: plan.updated_at ? plan.updated_at.toISOString() : null,
        plan_startdate: plan.plan_startdate ? plan.plan_startdate.toISOString().split('T')[0] : null,
        plan_enddate: plan.plan_enddate ? plan.plan_enddate.toISOString().split('T')[0] : null,
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

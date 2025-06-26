"use server";

import pool from "@/lib/db";

// ===== Get Member Goals Data =====
// ดึงข้อมูลเป้าหมายของ Member สำหรับ Trainer (เฉพาะ fitness_goal table)
export async function getMemberGoals(trainerId, memberId) {
  const connection = await pool.getConnection();
  
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !memberId) {
      return {
        success: false,
        error: "กรุณาระบุรหัสเทรนเนอร์และรหัสสมาชิก",
      };
    }

    // ตรวจสอบความสัมพันธ์ระหว่างเทรนเนอร์และสมาชิก
    const [registrationCheck] = await connection.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 'active'`,
      [trainerId, memberId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูลการลงทะเบียนของสมาชิกภายใต้เทรนเนอร์นี้",
      };
    }

    // ดึงข้อมูลเป้าหมายที่ active เท่านั้น
    const [goalsData] = await connection.query(
      `
      SELECT 
        fitness_goal_id,
        member_id,
        fitness_goal_type,
        fitness_training_frequency,
        fitness_experience_level,
        fitness_goal_targetweight,
        fitness_training_time,
        fitness_desired_time,
        fitness_goal_startdate,
        fitness_goal_enddate,
        fitness_goal_status,
        create_at,
        update_at
      FROM fitness_goal 
      WHERE member_id = ? AND fitness_goal_status = 'active'
      ORDER BY fitness_goal_startdate DESC
      `,
      [memberId]
    );

    // ถ้าไม่มีเป้าหมายที่ active
    if (!goalsData || goalsData.length === 0) {
      return {
        success: true,
        data: null,
        message: "ไม่พบเป้าหมายที่ active สำหรับสมาชิกนี้",
      };
    }

    // Return ข้อมูล goal เท่านั้น
    const goalData = goalsData[0];

    return {
      success: true,
      data: {
        fitness_goal_id: goalData.fitness_goal_id,
        member_id: goalData.member_id,
        fitness_goal_type: goalData.fitness_goal_type,
        fitness_training_frequency: goalData.fitness_training_frequency,
        fitness_experience_level: goalData.fitness_experience_level,
        fitness_goal_targetweight: goalData.fitness_goal_targetweight,
        fitness_training_time: goalData.fitness_training_time,
        fitness_desired_time: goalData.fitness_desired_time,
        fitness_goal_startdate: goalData.fitness_goal_startdate,
        fitness_goal_enddate: goalData.fitness_goal_enddate,
        fitness_goal_status: goalData.fitness_goal_status,
        create_at: goalData.create_at,
        update_at: goalData.update_at,
      },
    };

  } catch (error) {
    console.error("Error fetching member goals:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลเป้าหมาย",
    };
  } finally {
    connection.release();
  }
}

// ===== Get All Member Goals History =====
// ดึงประวัติเป้าหมายทั้งหมดของ Member (เฉพาะ fitness_goal table)
export async function getMemberGoalsHistory(trainerId, memberId) {
  const connection = await pool.getConnection();
  
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !memberId) {
      return {
        success: false,
        error: "กรุณาระบุรหัสเทรนเนอร์และรหัสสมาชิก",
      };
    }

    // ตรวจสอบความสัมพันธ์ระหว่างเทรนเนอร์และสมาชิก
    const [registrationCheck] = await connection.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ? AND registration_status = 'active'`,
      [trainerId, memberId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      return {
        success: false,
        error: "ไม่พบข้อมูลการลงทะเบียนของสมาชิกภายใต้เทรนเนอร์นี้",
      };
    }

    // ดึงประวัติเป้าหมายทั้งหมด
    const [goalsHistory] = await connection.query(
      `
      SELECT 
        fitness_goal_id,
        member_id,
        fitness_goal_type,
        fitness_training_frequency,
        fitness_experience_level,
        fitness_goal_targetweight,
        fitness_training_time,
        fitness_desired_time,
        fitness_goal_startdate,
        fitness_goal_enddate,
        fitness_goal_status,
        create_at,
        update_at
      FROM fitness_goal 
      WHERE member_id = ?
      ORDER BY fitness_goal_startdate DESC
      `,
      [memberId]
    );

    return {
      success: true,
      data: goalsHistory.map(goal => ({
        fitness_goal_id: goal.fitness_goal_id,
        member_id: goal.member_id,
        fitness_goal_type: goal.fitness_goal_type,
        fitness_training_frequency: goal.fitness_training_frequency,
        fitness_experience_level: goal.fitness_experience_level,
        fitness_goal_targetweight: goal.fitness_goal_targetweight,
        fitness_training_time: goal.fitness_training_time,
        fitness_desired_time: goal.fitness_desired_time,
        fitness_goal_startdate: goal.fitness_goal_startdate,
        fitness_goal_enddate: goal.fitness_goal_enddate,
        fitness_goal_status: goal.fitness_goal_status,
        create_at: goal.create_at,
        update_at: goal.update_at,
      })),
    };

  } catch (error) {
    console.error("Error fetching member goals history:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงประวัติเป้าหมาย",
    };
  } finally {
    connection.release();
  }
}
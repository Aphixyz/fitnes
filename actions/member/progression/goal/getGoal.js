"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลประวัติ goal ของ member ตามช่วงวันที่
 * @param {number} memberId - ID ของ member
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Array>} ข้อมูลประวัติ goal
 */
export async function getGoal(memberId, startDate, endDate) {
  try {
    // ตรวจสอบ input parameters
    if (!memberId || !startDate || !endDate) {
      throw new Error(
        "Missing required parameters: memberId, startDate, endDate"
      );
    }

    // ตรวจสอบ format ของวันที่
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // ตรวจสอบว่า startDate ไม่เกิน endDate
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error("Start date cannot be after end date");
    }

    // Query ข้อมูล goal จาก database
    const query = `
      SELECT 
        fg.fitness_goal_id,
        fg.fitness_goal_type,
        fg.fitness_training_frequency,
        fg.fitness_experience_level,
        fg.fitness_goal_targetweight,
        fg.fitness_training_time,
        fg.fitness_desired_time,
        fg.fitness_goal_startdate,
        fg.fitness_goal_enddate,
        fg.fitness_goal_status,
        fg.create_at,
        fg.update_at,
        -- คำนวณระยะเวลาของ goal (วัน)
        DATEDIFF(fg.fitness_goal_enddate, fg.fitness_goal_startdate) as goal_duration_days,
        -- คำนวณจำนวนวันที่ผ่านไปแล้ว
        CASE 
          WHEN fg.fitness_goal_enddate < CURDATE() THEN 
            DATEDIFF(fg.fitness_goal_enddate, fg.fitness_goal_startdate)
          ELSE 
            DATEDIFF(CURDATE(), fg.fitness_goal_startdate)
        END as days_elapsed,
        -- คำนวณเปอร์เซ็นต์ความคืบหน้า
        CASE 
          WHEN fg.fitness_goal_enddate < CURDATE() THEN 100
          ELSE 
            ROUND(
              (DATEDIFF(CURDATE(), fg.fitness_goal_startdate) / 
               DATEDIFF(fg.fitness_goal_enddate, fg.fitness_goal_startdate)) * 100, 2
            )
        END as progress_percentage
      FROM fitness_goal fg
      WHERE fg.member_id = ?
        AND (
          -- Goal ที่เริ่มในช่วงวันที่ที่กำหนด
          (fg.fitness_goal_startdate BETWEEN ? AND ?)
          OR 
          -- Goal ที่สิ้นสุดในช่วงวันที่ที่กำหนด
          (fg.fitness_goal_enddate BETWEEN ? AND ?)
          OR 
          -- Goal ที่ครอบคลุมช่วงวันที่ที่กำหนด
          (fg.fitness_goal_startdate <= ? AND fg.fitness_goal_enddate >= ?)
        )
      ORDER BY fg.fitness_goal_startdate DESC, fg.create_at DESC
    `;

    const [goals] = await pool.execute(query, [
      memberId,
      startDate,
      endDate, // สำหรับ goal ที่เริ่มในช่วงวันที่
      startDate,
      endDate, // สำหรับ goal ที่สิ้นสุดในช่วงวันที่
      startDate,
      endDate, // สำหรับ goal ที่ครอบคลุมช่วงวันที่
    ]);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสม
    const formattedGoals = goals.map((goal) => ({
      id: goal.fitness_goal_id,
      type: goal.fitness_goal_type,
      trainingFrequency: goal.fitness_training_frequency,
      experienceLevel: goal.fitness_experience_level,
      targetWeight: goal.fitness_goal_targetweight,
      trainingTime: goal.fitness_training_time,
      desiredTime: goal.fitness_desired_time,
      startDate: goal.fitness_goal_startdate,
      endDate: goal.fitness_goal_enddate,
      status: goal.fitness_goal_status,
      createdAt: goal.create_at,
      updatedAt: goal.update_at,
      // คำนวณเพิ่มเติม
      durationDays: goal.goal_duration_days,
      daysElapsed: goal.days_elapsed,
      progressPercentage: goal.progress_percentage,
      // สถานะของ goal
      isActive: goal.fitness_goal_status === "active",
      isCompleted:
        goal.fitness_goal_enddate < new Date().toISOString().split("T")[0],
      isOverdue:
        goal.fitness_goal_enddate < new Date().toISOString().split("T")[0] &&
        goal.fitness_goal_status === "active",
    }));

    return {
      success: true,
      data: formattedGoals,
      count: formattedGoals.length,
      period: {
        startDate,
        endDate,
        totalDays:
          Math.ceil(
            (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
          ) + 1,
      },
    };
  } catch (error) {
    console.error("Error in getGoal:", error);

    return {
      success: false,
      error: error.message || "Failed to fetch goal history",
      data: [],
      count: 0,
    };
  }
}

/**
 * ดึงข้อมูล goal ล่าสุดของ member
 * @param {number} memberId - ID ของ member
 * @returns {Promise<Object>} ข้อมูล goal ล่าสุด
 */
export async function getLatestGoal(memberId) {
  try {
    if (!memberId) {
      throw new Error("Missing required parameter: memberId");
    }

    const query = `
      SELECT 
        fg.fitness_goal_id,
        fg.fitness_goal_type,
        fg.fitness_training_frequency,
        fg.fitness_experience_level,
        fg.fitness_goal_targetweight,
        fg.fitness_training_time,
        fg.fitness_desired_time,
        fg.fitness_goal_startdate,
        fg.fitness_goal_enddate,
        fg.fitness_goal_status,
        fg.create_at,
        fg.update_at
      FROM fitness_goal fg
      WHERE fg.member_id = ?
      ORDER BY fg.create_at DESC
      LIMIT 1
    `;

    const [goals] = await pool.execute(query, [memberId]);

    if (goals.length === 0) {
      return {
        success: true,
        data: null,
        message: "No goals found for this member",
      };
    }

    const goal = goals[0];
    const formattedGoal = {
      id: goal.fitness_goal_id,
      type: goal.fitness_goal_type,
      trainingFrequency: goal.fitness_training_frequency,
      experienceLevel: goal.fitness_experience_level,
      targetWeight: goal.fitness_goal_targetweight,
      trainingTime: goal.fitness_training_time,
      desiredTime: goal.fitness_desired_time,
      startDate: goal.fitness_goal_startdate,
      endDate: goal.fitness_goal_enddate,
      status: goal.fitness_goal_status,
      createdAt: goal.create_at,
      updatedAt: goal.update_at,
      isActive: goal.fitness_goal_status === "active",
    };

    return {
      success: true,
      data: formattedGoal,
    };
  } catch (error) {
    console.error("Error in getLatestGoal:", error);

    return {
      success: false,
      error: error.message || "Failed to fetch latest goal",
      data: null,
    };
  }
}

/**
 * ดึงข้อมูลสถิติ goal ของ member
 * @param {number} memberId - ID ของ member
 * @returns {Promise<Object>} สถิติ goal
 */
export async function getGoalStats(memberId) {
  try {
    if (!memberId) {
      throw new Error("Missing required parameter: memberId");
    }

    const query = `
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN fitness_goal_status = 'active' THEN 1 END) as active_goals,
        COUNT(CASE WHEN fitness_goal_status = 'completed' THEN 1 END) as completed_goals,
        COUNT(CASE WHEN fitness_goal_enddate < CURDATE() AND fitness_goal_status = 'active' THEN 1 END) as overdue_goals,
        AVG(DATEDIFF(fitness_goal_enddate, fitness_goal_startdate)) as avg_goal_duration,
        MIN(fitness_goal_startdate) as first_goal_date,
        MAX(fitness_goal_startdate) as last_goal_date
      FROM fitness_goal
      WHERE member_id = ?
    `;

    const [stats] = await pool.execute(query, [memberId]);
    const stat = stats[0];

    return {
      success: true,
      data: {
        totalGoals: stat.total_goals,
        activeGoals: stat.active_goals,
        completedGoals: stat.completed_goals,
        overdueGoals: stat.overdue_goals,
        averageDuration: Math.round(stat.avg_goal_duration || 0),
        firstGoalDate: stat.first_goal_date,
        lastGoalDate: stat.last_goal_date,
        completionRate:
          stat.total_goals > 0
            ? Math.round((stat.completed_goals / stat.total_goals) * 100)
            : 0,
      },
    };
  } catch (error) {
    console.error("Error in getGoalStats:", error);

    return {
      success: false,
      error: error.message || "Failed to fetch goal statistics",
      data: null,
    };
  }
}

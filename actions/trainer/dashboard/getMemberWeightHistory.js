"use server";

import pool from "@/lib/db";

/**
 * ดึงประวัติน้ำหนักของสมาชิกสำหรับแสดงในกราฟ
 * @param {number} memberId - รหัสสมาชิกที่จะดูประวัติน้ำหนัก
 * @param {Object} options - ตัวเลือกการค้นหา
 * @param {number} options.days - จำนวนวันย้อนหลัง (default: 90)
 * @param {number} options.limit - จำนวนรายการสูงสุด (default: 50)
 * @returns {Promise<Object>} ข้อมูลประวัติน้ำหนักและเป้าหมาย
 */
export async function getMemberWeightHistory(memberId, options = {}) {
  const connection = await pool.getConnection();

  try {
    // Validate and parse parameters
    const memberIdNum = parseInt(memberId, 10);
    
    if (isNaN(memberIdNum)) {
      return {
        success: false,
        message: "Invalid memberId"
      };
    }

    // Set default options
    const {
      days = 90,
      limit = 50
    } = options;

    // Calculate date range
    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - days);
    const startDate = dateRange.toISOString().split('T')[0];

    // Get member's weight goal from fitness_goal table
    const goalQuery = `
      SELECT 
        fg.fitness_goal_targetweight as goal_weight,
        fg.fitness_goal_type as goal_type
      FROM fitness_goal fg
      WHERE fg.member_id = ? 
        AND fg.fitness_goal_status = 'active'
      ORDER BY fg.create_at DESC
      LIMIT 1
    `;

    const [goalResult] = await connection.query(goalQuery, [memberIdNum]);
    
    let goalWeight = null;
    let goalType = null;
    if (goalResult.length > 0) {
      goalWeight = goalResult[0].goal_weight;
      goalType = goalResult[0].goal_type;
    }

    // Get weight history from member_health table
    const weightQuery = `
      SELECT 
        member_health_measurementdate as date,
        member_health_weight as weight,
        member_health_bodyfat as body_fat
      FROM member_health
      WHERE member_id = ? 
        AND member_health_measurementdate >= ?
        AND member_health_weight IS NOT NULL
        AND member_health_weight > 0
      ORDER BY member_health_measurementdate ASC
      LIMIT ?
    `;

    const [weightResult] = await connection.query(weightQuery, [memberIdNum, startDate, limit]);

    // Format weight data for chart
    const weightData = weightResult.map(row => ({
      date: row.date.toISOString().split('T')[0],
      weight: parseFloat(row.weight),
      bodyFat: row.body_fat ? parseFloat(row.body_fat) : null
    }));

    // Calculate statistics
    let statistics = {
      totalRecords: weightData.length,
      latestWeight: null,
      previousWeight: null,
      weightChange: null,
      averageWeight: null,
      minWeight: null,
      maxWeight: null
    };

    if (weightData.length > 0) {
      const weights = weightData.map(d => d.weight);
      statistics.latestWeight = weights[weights.length - 1];
      statistics.previousWeight = weights.length > 1 ? weights[weights.length - 2] : null;
      statistics.weightChange = statistics.previousWeight 
        ? statistics.latestWeight - statistics.previousWeight 
        : null;
      statistics.averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      statistics.minWeight = Math.min(...weights);
      statistics.maxWeight = Math.max(...weights);
    }

    return {
      success: true,
      data: {
        weightData,
        goalWeight,
        goalType,
        statistics,
        dateRange: {
          startDate,
          endDate: new Date().toISOString().split('T')[0],
          days
        }
      }
    };

  } catch (error) {
    console.error("Error fetching member weight history:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงประวัติน้ำหนัก",
      error: error.message
    };
  } finally {
    connection.release();
  }
}

export default getMemberWeightHistory;
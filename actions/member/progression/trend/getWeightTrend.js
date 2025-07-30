"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Weight Trend ของสมาชิกตามช่วงเวลาที่กำหนด
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} period - ช่วงเวลา (daily, weekly, monthly)
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Array>} ข้อมูล Weight Trend
 */
export async function getWeightTrend(memberId, period, startDate, endDate) {
  try {
    // Validate input parameters
    if (!memberId || !period || !startDate || !endDate) {
      throw new Error("Missing required parameters");
    }

    // Validate period
    const validPeriods = ["daily", "weekly", "monthly"];
    if (!validPeriods.includes(period)) {
      throw new Error("Invalid period. Must be daily, weekly, or monthly");
    }

    // Build query based on period
    let dateFormat, groupBy;
    switch (period) {
      case "daily":
        dateFormat = "%Y-%m-%d";
        groupBy = "DATE(member_health_measurementdate)";
        break;
      case "weekly":
        dateFormat = "%Y-%u"; // ISO week format
        groupBy = "YEARWEEK(member_health_measurementdate, 1)";
        break;
      case "monthly":
        dateFormat = "%Y-%m";
        groupBy = 'DATE_FORMAT(member_health_measurementdate, "%Y-%m")';
        break;
    }

    const query = `
      SELECT 
        DATE_FORMAT(member_health_measurementdate, ?) as period_date,
        AVG(member_health_weight) as avg_weight,
        MIN(member_health_weight) as min_weight,
        MAX(member_health_weight) as max_weight,
        COUNT(*) as measurement_count,
        MIN(member_health_measurementdate) as first_measurement,
        MAX(member_health_measurementdate) as last_measurement
      FROM member_health 
      WHERE member_id = ? 
        AND member_health_measurementdate BETWEEN ? AND ?
        AND member_health_weight IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY member_health_measurementdate ASC
    `;

    const [rows] = await pool.execute(query, [
      dateFormat,
      memberId,
      startDate,
      endDate,
    ]);

    // Transform data for better frontend consumption
    const weightTrend = rows.map((row) => ({
      period: row.period_date,
      averageWeight: parseFloat(row.avg_weight),
      minWeight: parseFloat(row.min_weight),
      maxWeight: parseFloat(row.max_weight),
      measurementCount: row.measurement_count,
      firstMeasurement: row.first_measurement,
      lastMeasurement: row.last_measurement,
    }));

    return {
      success: true,
      data: weightTrend,
      summary: {
        totalMeasurements: weightTrend.reduce(
          (sum, item) => sum + item.measurementCount,
          0
        ),
        weightChange:
          weightTrend.length > 1
            ? weightTrend[weightTrend.length - 1].averageWeight -
              weightTrend[0].averageWeight
            : 0,
        periodCount: weightTrend.length,
      },
    };
  } catch (error) {
    console.error("Error in getWeightTrend:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch weight trend data",
    };
  }
}

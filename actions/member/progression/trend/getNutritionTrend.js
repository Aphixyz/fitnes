"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Nutrition Trend จาก intake_logs
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} period - ช่วงเวลา (daily, weekly, monthly)
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Object>} ข้อมูล nutrition trend
 */
export async function getNutritionTrend(
  memberId,
  period = "daily",
  startDate,
  endDate
) {
  try {
    // ตรวจสอบ parameters
    if (!memberId || !startDate || !endDate) {
      throw new Error(
        "Missing required parameters: memberId, startDate, endDate"
      );
    }

    // กำหนด SQL query ตาม period
    let dateFormat, groupBy;
    switch (period) {
      case "daily":
        dateFormat = "%Y-%m-%d";
        groupBy = "DATE(date)";
        break;
      case "weekly":
        dateFormat = "%Y-%u"; // ปี-สัปดาห์
        groupBy = "YEARWEEK(date, 1)";
        break;
      case "monthly":
        dateFormat = "%Y-%m";
        groupBy = 'DATE_FORMAT(date, "%Y-%m")';
        break;
      default:
        throw new Error("Invalid period. Must be daily, weekly, or monthly");
    }

    // SQL query สำหรับดึงข้อมูล nutrition trend
    const query = `
      SELECT 
        DATE_FORMAT(date, ?) as period_date,
        AVG(calories) as avg_calories,
        AVG(protein) as avg_protein,
        AVG(carb) as avg_carb,
        AVG(fat) as avg_fat,
        COUNT(*) as data_points,
        MIN(date) as start_date,
        MAX(date) as end_date
      FROM intake_logs 
      WHERE member_id = ? 
        AND date BETWEEN ? AND ?
      GROUP BY ${groupBy}
      ORDER BY start_date ASC
    `;

    const [rows] = await pool.execute(query, [
      dateFormat,
      memberId,
      startDate,
      endDate,
    ]);

    // คำนวณ statistics เพิ่มเติม
    const stats = await calculateNutritionStats(memberId, startDate, endDate);

    // จัดรูปแบบข้อมูลสำหรับ chart
    const chartData = formatChartData(rows, period);

    return {
      success: true,
      data: {
        trend: chartData,
        statistics: stats,
        period: period,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    };
  } catch (error) {
    console.error("Error in getNutritionTrend:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch nutrition trend data",
    };
  }
}

/**
 * คำนวณ statistics ของ nutrition data
 */
async function calculateNutritionStats(memberId, startDate, endDate) {
  try {
    const query = `
      SELECT 
        AVG(calories) as avg_calories,
        AVG(protein) as avg_protein,
        AVG(carb) as avg_carb,
        AVG(fat) as avg_fat,
        MAX(calories) as max_calories,
        MIN(calories) as min_calories,
        MAX(protein) as max_protein,
        MIN(protein) as min_protein,
        MAX(carb) as max_carb,
        MIN(carb) as min_carb,
        MAX(fat) as max_fat,
        MIN(fat) as min_fat,
        COUNT(*) as total_entries,
        COUNT(DISTINCT date) as active_days
      FROM intake_logs 
      WHERE member_id = ? 
        AND date BETWEEN ? AND ?
    `;

    const [rows] = await pool.execute(query, [memberId, startDate, endDate]);
    return rows[0] || {};
  } catch (error) {
    console.error("Error calculating nutrition stats:", error);
    return {};
  }
}

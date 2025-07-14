"use server";

import pool from "@/lib/db";

/**
 * Server Action สำหรับดึงข้อมูล Calories Trend
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} period - ช่วงเวลา (daily, weekly, monthly)
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Array>} ข้อมูล calories trend
 */
export async function getCaloriesTrend(memberId, period, startDate, endDate) {
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
    let groupByClause, dateFormat;
    switch (period) {
      case "daily":
        groupByClause = "DATE(date)";
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupByClause = "YEARWEEK(date, 1)";
        dateFormat = "%Y-%u";
        break;
      case "monthly":
        groupByClause = 'DATE_FORMAT(date, "%Y-%m")';
        dateFormat = "%Y-%m";
        break;
    }

    // SQL query สำหรับดึงข้อมูล calories trend
    const query = `
      SELECT 
        DATE_FORMAT(date, ?) as period_date,
        ${groupByClause} as group_key,
        AVG(calories) as avg_calories,
        SUM(calories) as total_calories,
        COUNT(*) as days_count,
        MIN(calories) as min_calories,
        MAX(calories) as max_calories
      FROM intake_logs 
      WHERE member_id = ? 
        AND date BETWEEN ? AND ?
      GROUP BY ${groupByClause}
      ORDER BY group_key ASC
    `;

    // Execute query
    const [rows] = await pool.execute(query, [
      dateFormat,
      memberId,
      startDate,
      endDate,
    ]);

    // Transform data for chart
    const trendData = rows.map((row) => ({
      period: row.period_date,
      averageCalories: Math.round(row.avg_calories || 0),
      totalCalories: Math.round(row.total_calories || 0),
      daysCount: row.days_count,
      minCalories: Math.round(row.min_calories || 0),
      maxCalories: Math.round(row.max_calories || 0),
    }));

    return {
      success: true,
      data: trendData,
      period: period,
      startDate: startDate,
      endDate: endDate,
    };
  } catch (error) {
    console.error("Error in getCaloriesTrend:", error);

    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

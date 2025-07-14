"use server";

import pool from "@/lib/db.js";

/**
 * นับจำนวน Total Sessions ของ member ในช่วงวันที่ที่กำหนด
 * @param {number} memberId - ID ของ member
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data?: number, error?: string}>}
 */
export async function getTotalSessions(memberId, startDate, endDate) {
  try {
    // Validate input parameters
    if (!memberId || !startDate || !endDate) {
      return {
        success: false,
        error: "Missing required parameters: memberId, startDate, endDate",
      };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD format",
      };
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return {
        success: false,
        error: "Start date cannot be after end date",
      };
    }

    const connection = await pool.getConnection();

    try {
      // Query to count unique workout sessions
      const query = `
        SELECT COUNT(DISTINCT log_date) as total_sessions
        FROM exercise_log 
        WHERE member_id = ? 
        AND log_date BETWEEN ? AND ?
      `;

      const [rows] = await connection.execute(query, [
        memberId,
        startDate,
        endDate,
      ]);

      // Extract the count from the result
      const totalSessions = rows[0]?.total_sessions || 0;

      return {
        success: true,
        data: totalSessions,
      };
    } finally {
      connection.release(); // Release connection back to pool
    }
  } catch (error) {
    console.error("Error in getTotalSessions:", error);

    return {
      success: false,
      error: "Database error occurred while fetching total sessions",
    };
  }
}

"use server";

import pool from "@/lib/db";

/**
 * Summary รวมผลลัพธ์การออกกำลังกาย (group by week)
 * @param {Object} params
 * @param {number} params.member_id - member_id ที่ต้องการ summary
 * @param {string} [params.startDate] - (optional) วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} [params.endDate] - (optional) วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Array<{ week: string, volume: number, reps: number, duration: number }>>}
 */
export async function getExerciseSummary({ member_id, startDate, endDate }) {
  if (!member_id) {
    throw new Error("member_id is required");
  }
  const conn = await pool.getConnection();
  try {
    // SQL: join log + log_set, group by week (ISO week)
    // week format: 'YYYY-WW'
    const params = [member_id];
    let dateFilter = "";
    if (startDate) {
      dateFilter += " AND el.log_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += " AND el.log_date <= ?";
      params.push(endDate);
    }
    const [rows] = await conn.query(
      `SELECT 
        YEAR(el.log_date) as year,
        WEEK(el.log_date, 1) as week,
        MIN(el.log_date) as week_start,
        SUM(COALESCE(els.reps,0) * COALESCE(els.weight,0)) as volume,
        SUM(COALESCE(els.reps,0)) as reps,
        SUM(COALESCE(els.time,0)) as duration
      FROM exercise_log el
      JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? ${dateFilter}
      GROUP BY year, week
      ORDER BY year, week ASC`,
      params
    );
    // map เป็น array พร้อม key ที่ frontend ใช้
    return rows.map((row) => ({
      week: `${row.year}-W${String(row.week).padStart(2, "0")}`,
      week_start: row.week_start,
      volume: Number(row.volume) || 0, // kg
      reps: Number(row.reps) || 0,
      duration: Number(row.duration) || 0, // วินาที
    }));
  } catch (err) {
    // error handling แบบ early return
    console.error("getExerciseSummary error:", err);
    throw new Error("Database error: " + err.message);
  } finally {
    conn.release();
  }
}

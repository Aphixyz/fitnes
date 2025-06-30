"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล nutrition intake รายสัปดาห์ (7 วันย้อนหลัง)
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Array>} รายการ intake logs ใน 7 วันที่ผ่านมา
 */
export async function fetchWeeklyIntake(memberId, endDate = null) {
  try {
    // Validate input
    if (!memberId || typeof memberId !== "number") {
      throw new Error("Member ID is required and must be a number");
    }

    // ใช้วันนี้ถ้าไม่ได้ระบุวันที่สิ้นสุด
    const targetEndDate = endDate || new Date().toISOString().split("T")[0];

    // คำนวณวันที่เริ่มต้น (7 วันย้อนหลัง)
    const startDate = new Date(targetEndDate);
    startDate.setDate(startDate.getDate() - 6); // 7 วัน (0-6)
    const targetStartDate = startDate.toISOString().split("T")[0];

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetEndDate)) {
      throw new Error("End date must be in YYYY-MM-DD format");
    }

    const query = `
      SELECT 
        intake_id,
        member_id,
        date,
        calories,
        protein,
        carb,
        fat,
        create_at
      FROM intake_logs 
      WHERE member_id = ? 
        AND date >= ? 
        AND date <= ?
      ORDER BY date ASC
    `;

    const [rows] = await pool.execute(query, [
      memberId,
      targetStartDate,
      targetEndDate,
    ]);

    // สร้างรายการวันที่ครบ 7 วัน (กรณีบางวันไม่มีข้อมูล)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(targetStartDate);
      date.setDate(date.getDate() + i);
      weekDates.push(date.toISOString().split("T")[0]);
    }

    // Map ข้อมูลที่ได้กับวันที่ในสัปดาห์
    const weeklyData = weekDates.map((date) => {
      const dayData = rows.find((row) => row.date === date);
      const dayName = new Date(date).toLocaleDateString("th-TH", {
        weekday: "short",
      });

      if (dayData) {
        return {
          intake_id: dayData.intake_id,
          member_id: dayData.member_id,
          date: dayData.date,
          dayName,
          calories: parseFloat(dayData.calories) || 0,
          protein: parseFloat(dayData.protein) || 0,
          carb: parseFloat(dayData.carb) || 0,
          fat: parseFloat(dayData.fat) || 0,
          created_at: dayData.created_at,
          updated_at: dayData.updated_at,
        };
      } else {
        // วันที่ไม่มีข้อมูล
        return {
          intake_id: null,
          member_id: memberId,
          date,
          dayName,
          calories: 0,
          protein: 0,
          carb: 0,
          fat: 0,
          created_at: null,
          updated_at: null,
        };
      }
    });

    return weeklyData;
  } catch (error) {
    console.error("Error fetching weekly intake:", error);
    throw new Error(`Failed to fetch weekly intake: ${error.message}`);
  }
}

/**
 * ดึงข้อมูลสถิติรายสัปดาห์ (ค่าเฉลี่ย, รวม)
 * @param {number} memberId - ID ของสมาชิก
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD) หรือ null สำหรับวันนี้
 * @returns {Promise<Object>} สถิติรายสัปดาห์
 */
export async function fetchWeeklyStats(memberId, endDate = null) {
  try {
    const weeklyData = await fetchWeeklyIntake(memberId, endDate);

    // คำนวณสถิติ
    const totalDaysWithData = weeklyData.filter(
      (day) => day.calories > 0
    ).length;

    const totals = weeklyData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carb: acc.carb + day.carb,
        fat: acc.fat + day.fat,
      }),
      { calories: 0, protein: 0, carb: 0, fat: 0 }
    );

    const averages =
      totalDaysWithData > 0
        ? {
            calories: Math.round(totals.calories / totalDaysWithData),
            protein: Math.round(totals.protein / totalDaysWithData),
            carb: Math.round(totals.carb / totalDaysWithData),
            fat: Math.round(totals.fat / totalDaysWithData),
          }
        : {
            calories: 0,
            protein: 0,
            carb: 0,
            fat: 0,
          };

    return {
      weeklyData,
      totals,
      averages,
      totalDaysWithData,
      totalDays: 7,
    };
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    throw new Error(`Failed to fetch weekly stats: ${error.message}`);
  }
}

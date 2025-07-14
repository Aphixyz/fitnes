"use server";

import pool from "@/lib/db";

/**
 * คำนวณ Total Volume ของสมาชิกในช่วงเวลาที่กำหนด
 * Total Volume = sum(weight × reps) จาก exercise_log_set
 *
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} startDate - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} endDate - วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns {Promise<Object>} ผลลัพธ์การคำนวณ Total Volume
 */
export async function getTotalVolume(memberId, startDate, endDate) {
  try {
    // ตรวจสอบ parameters
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    if (!startDate || !endDate) {
      throw new Error("กรุณาระบุวันที่เริ่มต้นและสิ้นสุด");
    }

    // ตรวจสอบรูปแบบวันที่
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD");
    }

    // ตรวจสอบว่า startDate ไม่เกิน endDate
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
    }

    // Query เพื่อคำนวณ Total Volume
    // รวม weight × reps จาก exercise_log_set ที่มี weight และ reps ไม่เป็น null
    const [volumeData] = await pool.query(
      `SELECT 
        SUM(els.weight * els.reps) as total_volume,
        COUNT(DISTINCT el.log_date) as total_workout_days,
        COUNT(els.exercise_log_set_id) as total_sets
       FROM exercise_log el
       INNER JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
       WHERE el.member_id = ? 
       AND el.log_date BETWEEN ? AND ?
       AND els.weight IS NOT NULL 
       AND els.reps IS NOT NULL
       AND els.weight > 0 
       AND els.reps > 0`,
      [memberId, startDate, endDate]
    );

    // Query เพื่อดึงข้อมูลรายละเอียดแยกตามวัน
    const [dailyVolumeData] = await pool.query(
      `SELECT 
        el.log_date,
        SUM(els.weight * els.reps) as daily_volume,
        COUNT(els.exercise_log_set_id) as daily_sets,
        COUNT(DISTINCT el.workout_program_id) as daily_programs
       FROM exercise_log el
       INNER JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
       WHERE el.member_id = ? 
       AND el.log_date BETWEEN ? AND ?
       AND els.weight IS NOT NULL 
       AND els.reps IS NOT NULL
       AND els.weight > 0 
       AND els.reps > 0
       GROUP BY el.log_date
       ORDER BY el.log_date DESC`,
      [memberId, startDate, endDate]
    );

    // Query เพื่อดึงข้อมูลแยกตาม workout program
    const [programVolumeData] = await pool.query(
      `SELECT 
        wp.workout_plan_id,
        wp.program_name,
        wp.workout_program_id,
        SUM(els.weight * els.reps) as program_volume,
        COUNT(els.exercise_log_set_id) as program_sets,
        COUNT(DISTINCT el.log_date) as program_workout_days
       FROM exercise_log el
       INNER JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
       INNER JOIN workout_program wp ON el.workout_program_id = wp.workout_program_id
       WHERE el.member_id = ? 
       AND el.log_date BETWEEN ? AND ?
       AND els.weight IS NOT NULL 
       AND els.reps IS NOT NULL
       AND els.weight > 0 
       AND els.reps > 0
       GROUP BY wp.workout_program_id, wp.program_name
       ORDER BY program_volume DESC`,
      [memberId, startDate, endDate]
    );

    const result = volumeData[0];
    const totalVolume = result.total_volume || 0;
    const totalWorkoutDays = result.total_workout_days || 0;
    const totalSets = result.total_sets || 0;

    // คำนวณค่าเฉลี่ยต่อวัน
    const averageVolumePerDay =
      totalWorkoutDays > 0 ? totalVolume / totalWorkoutDays : 0;
    const averageVolumePerSet = totalSets > 0 ? totalVolume / totalSets : 0;

    return {
      success: true,
      data: {
        summary: {
          totalVolume: Math.round(totalVolume * 100) / 100, // ปัดเศษทศนิยม 2 ตำแหน่ง
          totalWorkoutDays,
          totalSets,
          averageVolumePerDay: Math.round(averageVolumePerDay * 100) / 100,
          averageVolumePerSet: Math.round(averageVolumePerSet * 100) / 100,
          period: {
            startDate,
            endDate,
            days:
              Math.ceil(
                (new Date(endDate) - new Date(startDate)) /
                  (1000 * 60 * 60 * 24)
              ) + 1,
          },
        },
        dailyBreakdown: dailyVolumeData.map((day) => ({
          date: day.log_date,
          volume: Math.round(day.daily_volume * 100) / 100,
          sets: day.daily_sets,
          programs: day.daily_programs,
        })),
        programBreakdown: programVolumeData.map((program) => ({
          planName: program.plan_name,
          programName: program.program_name,
          volume: Math.round(program.program_volume * 100) / 100,
          sets: program.program_sets,
          workoutDays: program.program_workout_days,
        })),
      },
    };
  } catch (error) {
    console.error("Error calculating total volume:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการคำนวณ Total Volume",
      data: null,
    };
  }
}

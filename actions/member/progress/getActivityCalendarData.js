"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลกิจกรรมรายวันสำหรับ Calendar Heat-map
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} months - จำนวนเดือนย้อนหลัง (ค่าเริ่มต้น 12 เดือน)
 * @returns {Promise<Object>} ข้อมูลกิจกรรมรายวัน
 */
export async function getActivityCalendarData(memberId, months = 12) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // ดึงข้อมูลการออกกำลังกายรายวัน
    const [workoutData] = await pool.query(`
      SELECT 
        DATE(el.log_date) as activity_date,
        COUNT(DISTINCT el.workout_program_id) as programs_completed,
        COUNT(els.exercise_log_set_id) as total_sets,
        SUM(CASE WHEN els.weight IS NOT NULL AND els.reps IS NOT NULL 
            THEN els.weight * els.reps ELSE 0 END) as daily_volume,
        'workout' as activity_type
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ? 
        AND el.log_date >= ? 
        AND el.log_date <= ?
      GROUP BY DATE(el.log_date)
    `, [memberId, startDate, endDate]);

    // ดึงข้อมูลการบันทึกโภชนาการรายวัน
    const [nutritionData] = await pool.query(`
      SELECT 
        DATE(date) as activity_date,
        calories,
        protein,
        carb,
        fat,
        'nutrition' as activity_type
      FROM intake_logs 
      WHERE member_id = ? 
        AND date >= ? 
        AND date <= ?
      ORDER BY date ASC
    `, [memberId, startDate, endDate]);

    // ดึงข้อมูลการบันทึกน้ำหนักและการวัดร่างกาย
    const [healthData] = await pool.query(`
      SELECT 
        DATE(member_health_measurementdate) as activity_date,
        member_health_weight as weight,
        member_health_bodyfat as body_fat,
        CASE 
          WHEN member_health_weight IS NOT NULL THEN 1 
          ELSE 0 
        END as has_weight,
        CASE 
          WHEN (member_health_chest IS NOT NULL OR 
                member_health_waist IS NOT NULL OR 
                member_health_hip IS NOT NULL OR 
                member_health_arm IS NOT NULL OR 
                member_health_thigh IS NOT NULL) THEN 1 
          ELSE 0 
        END as has_measurements,
        'health' as activity_type
      FROM member_health 
      WHERE member_id = ? 
        AND member_health_measurementdate >= ? 
        AND member_health_measurementdate <= ?
      ORDER BY member_health_measurementdate ASC
    `, [memberId, startDate, endDate]);

    // รวมข้อมูลทั้งหมดเป็นรายวัน
    const activityMap = new Map();

    // เพิ่มข้อมูลการออกกำลังกาย
    workoutData.forEach(workout => {
      const dateKey = workout.activity_date.toISOString().split('T')[0];
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, {
          date: dateKey,
          workout: null,
          nutrition: null,
          health: null,
          activity_count: 0,
          intensity: 0
        });
      }
      
      const dayData = activityMap.get(dateKey);
      dayData.workout = {
        programs_completed: workout.programs_completed,
        total_sets: workout.total_sets,
        daily_volume: parseFloat(workout.daily_volume || 0)
      };
      dayData.activity_count += 1;
      dayData.intensity += 1; // การออกกำลังกายให้คะแนน intensity 1
    });

    // เพิ่มข้อมูลโภชนาการ
    nutritionData.forEach(nutrition => {
      const dateKey = nutrition.activity_date.toISOString().split('T')[0];
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, {
          date: dateKey,
          workout: null,
          nutrition: null,
          health: null,
          activity_count: 0,
          intensity: 0
        });
      }
      
      const dayData = activityMap.get(dateKey);
      dayData.nutrition = {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carb: nutrition.carb,
        fat: nutrition.fat
      };
      dayData.activity_count += 1;
      dayData.intensity += 0.5; // การบันทึกโภชนาการให้คะแนน intensity 0.5
    });

    // เพิ่มข้อมูลสุขภาพ
    healthData.forEach(health => {
      const dateKey = health.activity_date.toISOString().split('T')[0];
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, {
          date: dateKey,
          workout: null,
          nutrition: null,
          health: null,
          activity_count: 0,
          intensity: 0
        });
      }
      
      const dayData = activityMap.get(dateKey);
      dayData.health = {
        weight: health.weight,
        body_fat: health.body_fat,
        has_weight: health.has_weight,
        has_measurements: health.has_measurements
      };
      dayData.activity_count += 1;
      dayData.intensity += 0.3; // การบันทึกสุขภาพให้คะแนน intensity 0.3
    });

    // แปลงเป็น array และเรียงตามวันที่
    const calendarData = Array.from(activityMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // สร้างข้อมูลสถิติ
    const totalDays = calendarData.length;
    const workoutDays = calendarData.filter(day => day.workout).length;
    const nutritionDays = calendarData.filter(day => day.nutrition).length;
    const healthDays = calendarData.filter(day => day.health).length;
    const activeDays = calendarData.filter(day => day.activity_count > 0).length;

    // หาระดับ intensity สูงสุดเพื่อใช้ในการ normalize
    const maxIntensity = Math.max(...calendarData.map(day => day.intensity), 0);

    // Normalize intensity (0-4 levels for heat-map colors)
    const normalizedData = calendarData.map(day => ({
      ...day,
      intensity_level: maxIntensity > 0 ? Math.min(Math.ceil((day.intensity / maxIntensity) * 4), 4) : 0
    }));

    return {
      success: true,
      data: {
        calendar_data: normalizedData,
        period: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        },
        statistics: {
          total_activity_days: totalDays,
          workout_days: workoutDays,
          nutrition_days: nutritionDays,
          health_tracking_days: healthDays,
          active_days: activeDays,
          consistency_percentage: totalDays > 0 ? ((activeDays / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) * 100).toFixed(1) : 0
        }
      },
      message: "ดึงข้อมูล Calendar Heat-map เรียบร้อยแล้ว"
    };

  } catch (error) {
    console.error("Error fetching activity calendar data:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
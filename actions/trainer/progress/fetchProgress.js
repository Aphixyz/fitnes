"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Progress สำหรับสมาชิก (Workout + Nutrition)
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} periodType - ช่วงเวลา: 'WEEK','1M','2M','3M','6M','1Y','ALL'
 * @param {string} startDate - วันที่เริ่มต้น (optional)
 * @param {string} endDate - วันที่สิ้นสุด (optional)
 * @returns {Promise<Object>} ข้อมูล workout progress + nutrition adherence
 */
export async function fetchProgress(
  memberId,
  periodType,
  startDate = null,
  endDate = null
) {
  let connection;

  try {
    // Validate parameters
    if (!memberId) {
      throw new Error("ไม่พบรหัสสมาชิก");
    }

    if (!periodType) {
      throw new Error("ไม่พบช่วงเวลาที่ต้องการ");
    }

    const validPeriods = ["WEEK", "1M", "2M", "3M", "6M", "1Y", "ALL"];
    if (!validPeriods.includes(periodType)) {
      throw new Error("ช่วงเวลาไม่ถูกต้อง");
    }

    // รับ connection จาก pool
    connection = await pool.getConnection();

    // ตรวจสอบว่าสมาชิกมีอยู่จริง
    const [memberCheck] = await connection.execute(
      `SELECT member_id FROM member WHERE member_id = ?`,
      [memberId]
    );

    if (!memberCheck || memberCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    // สร้าง date range สำหรับกรองข้อมูล
    const dateFilter = buildDateFilter(periodType, startDate, endDate);

    // SQL query สำหรับดึงข้อมูล workout progress
    const query = `
      SELECT 
        el.log_date,
        -- คำนวณ total_volume: ผลรวมของ (น้ำหนัก × จำนวนครั้ง)
        COALESCE(SUM(
          CASE 
            WHEN els.weight IS NOT NULL AND els.reps IS NOT NULL 
            THEN els.weight * els.reps 
            ELSE 0 
          END
        ), 0) as total_volume,
        
        -- คำนวณ total_reps: ผลรวมจำนวนครั้งทั้งหมด
        COALESCE(SUM(els.reps), 0) as total_reps,
        
        -- คำนวณ total_duration: ผลรวมเวลา (แปลงเป็นวินาที)
        COALESCE(SUM(
          CASE 
            WHEN els.time IS NOT NULL 
            THEN TIME_TO_SEC(els.time) 
            ELSE 0 
          END
        ), 0) as total_duration,
        
        -- คำนวณ total_distance: ผลรวมระยะทาง
        COALESCE(SUM(els.distance), 0) as total_distance,
        
        -- session_count: จำนวนวันที่บันทึก (distinct dates)
        COUNT(DISTINCT el.log_date) as session_count
        
      FROM exercise_log el
      LEFT JOIN exercise_log_set els ON el.exercise_log_id = els.exercise_log_id
      WHERE el.member_id = ?
        ${dateFilter.whereClause}
      GROUP BY el.log_date
      ORDER BY el.log_date DESC
    `;

    // Execute query ด้วย connection.execute()
    const [workoutData] = await connection.execute(query, [
      memberId,
      ...dateFilter.params,
    ]);

    // === ดึงข้อมูล Nutrition Adherence ===
    const nutritionData = await fetchNutritionData(connection, memberId, dateFilter);

    // คำนวณสถิติรวม
    const totalStats = calculateTotalStats(workoutData);
    const nutritionStats = calculateNutritionStats(nutritionData);

    // สร้าง summary data
    const summaryStats = createSummaryStats(
      workoutData,
      totalStats,
      periodType
    );
    const nutritionSummary = createNutritionSummary(
      nutritionData,
      nutritionStats,
      periodType
    );

    // Format ข้อมูลสำหรับส่งกลับ
    const formattedData = formatProgressData(
      workoutData,
      totalStats,
      summaryStats,
      nutritionData,
      nutritionStats,
      nutritionSummary,
      periodType
    );

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching workout progress:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล workout progress",
    };
  } finally {
    // Release connection กลับไปที่ pool
    if (connection) {
      connection.release();
    }
  }
}

/**
 * สร้าง date filter สำหรับ SQL query
 * @param {string} periodType - ช่วงเวลา
 * @param {string} startDate - วันที่เริ่มต้น
 * @param {string} endDate - วันที่สิ้นสุด
 * @returns {Object} date filter object
 */
function buildDateFilter(periodType, startDate, endDate) {
  let whereClause = "";
  let params = [];

  // ถ้ามี custom date range
  if (startDate && endDate) {
    whereClause = "AND el.log_date BETWEEN ? AND ?";
    params = [startDate, endDate];
    return { whereClause, params };
  }

  // ถ้ามีแค่ startDate
  if (startDate) {
    whereClause = "AND el.log_date >= ?";
    params = [startDate];
    return { whereClause, params };
  }

  // ถ้ามีแค่ endDate
  if (endDate) {
    whereClause = "AND el.log_date <= ?";
    params = [endDate];
    return { whereClause, params };
  }

  // ใช้ period type กำหนด date range
  switch (periodType) {
    case "WEEK":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
      break;
    case "1M":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
      break;
    case "2M":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)";
      break;
    case "3M":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
      break;
    case "6M":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
      break;
    case "1Y":
      whereClause = "AND el.log_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
      break;
    case "ALL":
    default:
      whereClause = ""; // ไม่มีการกรอง
      break;
  }

  return { whereClause, params };
}

/**
 * คำนวณสถิติรวมจากข้อมูล workout
 * @param {Array} workoutData - ข้อมูล workout raw data
 * @returns {Object} สถิติรวม
 */
function calculateTotalStats(workoutData) {
  if (!workoutData || workoutData.length === 0) {
    return {
      totalVolume: 0,
      totalReps: 0,
      totalDuration: 0, // วินาที
      totalDistance: 0,
      totalSessions: 0,
    };
  }

  return {
    totalVolume: workoutData.reduce(
      (sum, day) => sum + parseFloat(day.total_volume || 0),
      0
    ),
    totalReps: workoutData.reduce(
      (sum, day) => sum + parseInt(day.total_reps || 0),
      0
    ),
    totalDuration: workoutData.reduce(
      (sum, day) => sum + parseInt(day.total_duration || 0),
      0
    ),
    totalDistance: workoutData.reduce(
      (sum, day) => sum + parseFloat(day.total_distance || 0),
      0
    ),
    totalSessions: workoutData.length, // จำนวนวันที่มีการบันทึก
  };
}

/**
 * สร้างสถิติสรุปสำหรับแต่ละ period
 * @param {Array} workoutData - ข้อมูล workout raw data
 * @param {Object} totalStats - สถิติรวม
 * @param {string} periodType - ช่วงเวลา
 * @returns {Object} สถิติสรุป
 */
function createSummaryStats(workoutData, totalStats, periodType) {
  if (!workoutData || workoutData.length === 0) {
    return {
      averageVolumePerSession: 0,
      averageRepsPerSession: 0,
      averageDurationPerSession: 0,
      averageDistancePerSession: 0,
      workoutFrequency: 0,
      periodLabel: getPeriodLabel(periodType),
    };
  }

  const totalSessions = totalStats.totalSessions;

  return {
    averageVolumePerSession:
      totalSessions > 0
        ? Math.round(totalStats.totalVolume / totalSessions)
        : 0,
    averageRepsPerSession:
      totalSessions > 0 ? Math.round(totalStats.totalReps / totalSessions) : 0,
    averageDurationPerSession:
      totalSessions > 0
        ? Math.round(totalStats.totalDuration / totalSessions)
        : 0, // วินาที
    averageDistancePerSession:
      totalSessions > 0
        ? Math.round(totalStats.totalDistance / totalSessions)
        : 0,
    workoutFrequency: calculateWorkoutFrequency(workoutData, periodType),
    periodLabel: getPeriodLabel(periodType),
  };
}

/**
 * คำนวณความถี่ในการออกกำลังกาย
 * @param {Array} workoutData - ข้อมูล workout raw data
 * @param {string} periodType - ช่วงเวลา
 * @returns {number} ความถี่ (ครั้งต่อสัปดาห์)
 */
function calculateWorkoutFrequency(workoutData, periodType) {
  if (!workoutData || workoutData.length === 0) return 0;

  const sessions = workoutData.length;

  // แปลงเป็นครั้งต่อสัปดาห์
  switch (periodType) {
    case "WEEK":
      return sessions; // ครั้งต่อสัปดาห์
    case "1M":
      return Math.round((sessions / 4) * 10) / 10; // เฉลี่ยต่อสัปดาห์ใน 1 เดือน
    case "2M":
      return Math.round((sessions / 8) * 10) / 10;
    case "3M":
      return Math.round((sessions / 12) * 10) / 10;
    case "6M":
      return Math.round((sessions / 24) * 10) / 10;
    case "1Y":
      return Math.round((sessions / 52) * 10) / 10;
    case "ALL":
    default:
      // คำนวณจากวันแรกถึงวันสุดท้าย
      if (sessions < 2) return sessions;

      const firstDate = new Date(workoutData[workoutData.length - 1].log_date);
      const lastDate = new Date(workoutData[0].log_date);
      const daysDiff = Math.ceil(
        (lastDate - firstDate) / (1000 * 60 * 60 * 24)
      );
      const weeksDiff = daysDiff / 7;

      return weeksDiff > 0
        ? Math.round((sessions / weeksDiff) * 10) / 10
        : sessions;
  }
}

/**
 * ได้ป้ายกำกับของ period
 * @param {string} periodType - ช่วงเวลา
 * @returns {string} ป้ายกำกับ
 */
function getPeriodLabel(periodType) {
  const labels = {
    WEEK: "1 สัปดาห์ที่ผ่านมา",
    "1M": "1 เดือนที่ผ่านมา",
    "2M": "2 เดือนที่ผ่านมา",
    "3M": "3 เดือนที่ผ่านมา",
    "6M": "6 เดือนที่ผ่านมา",
    "1Y": "1 ปีที่ผ่านมา",
    ALL: "ข้อมูลทั้งหมด",
  };

  return labels[periodType] || "ไม่ระบุ";
}

/**
 * จัดรูปแบบข้อมูลสำหรับ response
 * @param {Array} workoutData - ข้อมูล workout raw data
 * @param {Object} totalStats - สถิติรวม workout
 * @param {Object} summaryStats - สถิติสรุป workout
 * @param {Object} nutritionData - ข้อมูล nutrition raw data
 * @param {Object} nutritionStats - สถิติรวม nutrition
 * @param {Object} nutritionSummary - สถิติสรุป nutrition
 * @param {string} periodType - ช่วงเวลา
 * @returns {Object} ข้อมูลที่จัดรูปแบบแล้ว
 */
function formatProgressData(workoutData, totalStats, summaryStats, nutritionData, nutritionStats, nutritionSummary, periodType) {
  // แปลงเวลาจากวินาทีเป็นรูปแบบที่อ่านง่าย
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}ช ${minutes}น ${secs}ส`;
    } else if (minutes > 0) {
      return `${minutes}น ${secs}ส`;
    } else {
      return `${secs}ส`;
    }
  };

  // จัดรูปแบบข้อมูลรายวัน
  const dailyProgress = workoutData.map((day) => ({
    date: day.log_date,
    metrics: {
      volume: parseFloat(day.total_volume || 0),
      reps: parseInt(day.total_reps || 0),
      duration: parseInt(day.total_duration || 0), // วินาที
      durationFormatted: formatDuration(parseInt(day.total_duration || 0)),
      distance: parseFloat(day.total_distance || 0),
    },
  }));

  // จัดรูปแบบข้อมูล nutrition รายวัน
  const dailyNutrition = nutritionData.intakeLogs.map((log) => ({
    date: log.date,
    actual: {
      calories: parseFloat(log.calories || 0),
      protein: parseFloat(log.protein || 0),
      carb: parseFloat(log.carb || 0),
      fat: parseFloat(log.fat || 0),
    },
    targets: nutritionStats.dailyTargets || { calories: 0, protein: 0, carb: 0, fat: 0 },
    adherence: {
      calories: (nutritionStats.dailyTargets && nutritionStats.dailyTargets.calories > 0)
        ? Math.round((parseFloat(log.calories || 0) / nutritionStats.dailyTargets.calories) * 100)
        : 0,
      protein: (nutritionStats.dailyTargets && nutritionStats.dailyTargets.protein > 0)
        ? Math.round((parseFloat(log.protein || 0) / nutritionStats.dailyTargets.protein) * 100)
        : 0,
      carb: (nutritionStats.dailyTargets && nutritionStats.dailyTargets.carb > 0)
        ? Math.round((parseFloat(log.carb || 0) / nutritionStats.dailyTargets.carb) * 100)
        : 0,
      fat: (nutritionStats.dailyTargets && nutritionStats.dailyTargets.fat > 0)
        ? Math.round((parseFloat(log.fat || 0) / nutritionStats.dailyTargets.fat) * 100)
        : 0,
    },
  }));

  return {
    period: {
      type: periodType,
      label: summaryStats.periodLabel,
      totalSessions: totalStats.totalSessions,
    },
    // === Workout Data ===
    workout: {
      totals: {
        volume: totalStats.totalVolume,
        reps: totalStats.totalReps,
        duration: totalStats.totalDuration, // วินาที
        durationFormatted: formatDuration(totalStats.totalDuration),
        distance: totalStats.totalDistance,
        sessions: totalStats.totalSessions,
      },
      averages: {
        volumePerSession: summaryStats.averageVolumePerSession,
        repsPerSession: summaryStats.averageRepsPerSession,
        durationPerSession: summaryStats.averageDurationPerSession, // วินาที
        durationPerSessionFormatted: formatDuration(
          summaryStats.averageDurationPerSession
        ),
        distancePerSession: summaryStats.averageDistancePerSession,
        workoutFrequency: summaryStats.workoutFrequency, // ครั้งต่อสัปดาห์
      },
      dailyProgress: dailyProgress,
    },
    // === Nutrition Data ===
    nutrition: {
      summary: nutritionSummary,
      adherence: nutritionStats.averageAdherence || { calories: 0, protein: 0, carb: 0, fat: 0 },
      targets: nutritionStats.dailyTargets || { calories: 0, protein: 0, carb: 0, fat: 0 },
      totals: {
        target: nutritionStats.totalTarget || { calories: 0, protein: 0, carb: 0, fat: 0 },
        actual: nutritionStats.totalActual || { calories: 0, protein: 0, carb: 0, fat: 0 },
      },
      dailyProgress: dailyNutrition,
      macroPlan: nutritionData.macroPlan,
    },
    // === Backward Compatibility (เก่า) ===
    totals: {
      volume: totalStats.totalVolume,
      reps: totalStats.totalReps,
      duration: totalStats.totalDuration,
      durationFormatted: formatDuration(totalStats.totalDuration),
      distance: totalStats.totalDistance,
      sessions: totalStats.totalSessions,
    },
    averages: {
      volumePerSession: summaryStats.averageVolumePerSession,
      repsPerSession: summaryStats.averageRepsPerSession,
      durationPerSession: summaryStats.averageDurationPerSession,
      durationPerSessionFormatted: formatDuration(
        summaryStats.averageDurationPerSession
      ),
      distancePerSession: summaryStats.averageDistancePerSession,
      workoutFrequency: summaryStats.workoutFrequency,
    },
    dailyProgress: dailyProgress,
    metadata: {
      generatedAt: new Date().toISOString(),
      memberId: parseInt(workoutData[0]?.member_id || 0),
      hasData: workoutData.length > 0,
      hasNutritionData: nutritionSummary.hasData,
    },
  };
}

/**
 * ดึงข้อมูล Nutrition Adherence (Macro Plan + Intake Logs)
 * @param {Object} connection - Database connection
 * @param {number} memberId - รหัสสมาชิก
 * @param {Object} dateFilter - Date filter object
 * @returns {Promise<Object>} ข้อมูล nutrition adherence
 */
async function fetchNutritionData(connection, memberId, dateFilter) {
  try {
    // 1. ดึง active macro plan ในช่วงเวลาที่เลือก
    const macroPlanQuery = `
      SELECT 
        macro_plan_id,
        calorie_target,
        protein_ratio,
        carb_ratio,
        fat_ratio,
        start_date,
        end_date
      FROM macro_plan 
      WHERE member_id = ? 
        AND plan_status = 'active'
        ${dateFilter.whereClause ? dateFilter.whereClause.replace('el.log_date', 'start_date') : ''}
      ORDER BY start_date DESC 
      LIMIT 1
    `;

    const [macroPlanData] = await connection.execute(macroPlanQuery, [
      memberId,
      ...dateFilter.params,
    ]);

    // 2. ดึงข้อมูล intake logs ในช่วงเวลาที่เลือก
    const intakeQuery = `
      SELECT 
        date,
        calories,
        protein,
        carb,
        fat
      FROM intake_logs 
      WHERE member_id = ?
        ${dateFilter.whereClause ? dateFilter.whereClause.replace('el.log_date', 'date') : ''}
      ORDER BY date DESC
    `;

    const [intakeData] = await connection.execute(intakeQuery, [
      memberId,
      ...dateFilter.params,
    ]);

    return {
      macroPlan: macroPlanData.length > 0 ? macroPlanData[0] : null,
      intakeLogs: intakeData || [],
    };
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return {
      macroPlan: null,
      intakeLogs: [],
    };
  }
}

/**
 * คำนวณสถิติ Nutrition Adherence
 * @param {Object} nutritionData - ข้อมูล nutrition raw data
 * @returns {Object} สถิติ nutrition adherence
 */
function calculateNutritionStats(nutritionData) {
  const { macroPlan, intakeLogs } = nutritionData;

  if (!macroPlan || !intakeLogs || intakeLogs.length === 0) {
    return {
      totalDays: 0,
      averageAdherence: {
        calories: 0,
        protein: 0,
        carb: 0,
        fat: 0,
      },
      dailyTargets: {
        calories: 0,
        protein: 0,
        carb: 0,
        fat: 0,
      },
      totalTarget: {
        calories: 0,
        protein: 0,
        carb: 0,
        fat: 0,
      },
      totalActual: {
        calories: 0,
        protein: 0,
        carb: 0,
        fat: 0,
      },
    };
  }

  // คำนวณ daily targets จาก macro plan
  const calorieTarget = macroPlan.calorie_target || 2000; // default ถ้าไม่มี
  const proteinTarget = Math.round((calorieTarget * (macroPlan.protein_ratio / 100)) / 4); // 1g protein = 4 cal
  const carbTarget = Math.round((calorieTarget * (macroPlan.carb_ratio / 100)) / 4); // 1g carb = 4 cal
  const fatTarget = Math.round((calorieTarget * (macroPlan.fat_ratio / 100)) / 9); // 1g fat = 9 cal

  // คำนวณ total actual และ adherence
  let totalActualCalories = 0;
  let totalActualProtein = 0;
  let totalActualCarb = 0;
  let totalActualFat = 0;
  let validDays = 0;

  intakeLogs.forEach((log) => {
    totalActualCalories += parseFloat(log.calories || 0);
    totalActualProtein += parseFloat(log.protein || 0);
    totalActualCarb += parseFloat(log.carb || 0);
    totalActualFat += parseFloat(log.fat || 0);
    validDays++;
  });

  // คำนวณ expected totals สำหรับจำนวนวันที่มีข้อมูล
  const totalTargetCalories = calorieTarget * validDays;
  const totalTargetProtein = proteinTarget * validDays;
  const totalTargetCarb = carbTarget * validDays;
  const totalTargetFat = fatTarget * validDays;

  // คำนวณ adherence percentages
  const calorieAdherence = totalTargetCalories > 0 
    ? Math.round((totalActualCalories / totalTargetCalories) * 100) 
    : 0;
  const proteinAdherence = totalTargetProtein > 0 
    ? Math.round((totalActualProtein / totalTargetProtein) * 100) 
    : 0;
  const carbAdherence = totalTargetCarb > 0 
    ? Math.round((totalActualCarb / totalTargetCarb) * 100) 
    : 0;
  const fatAdherence = totalTargetFat > 0 
    ? Math.round((totalActualFat / totalTargetFat) * 100) 
    : 0;

  return {
    totalDays: validDays,
    averageAdherence: {
      calories: calorieAdherence,
      protein: proteinAdherence,
      carb: carbAdherence,
      fat: fatAdherence,
    },
    dailyTargets: {
      calories: calorieTarget,
      protein: proteinTarget,
      carb: carbTarget,
      fat: fatTarget,
    },
    totalTarget: {
      calories: totalTargetCalories,
      protein: totalTargetProtein,
      carb: totalTargetCarb,
      fat: totalTargetFat,
    },
    totalActual: {
      calories: totalActualCalories,
      protein: totalActualProtein,
      carb: totalActualCarb,
      fat: totalActualFat,
    },
  };
}

/**
 * สร้างสถิติสรุปสำหรับ Nutrition
 * @param {Object} nutritionData - ข้อมูล nutrition raw data
 * @param {Object} nutritionStats - สถิติ nutrition
 * @param {string} periodType - ช่วงเวลา
 * @returns {Object} สถิติสรุป nutrition
 */
function createNutritionSummary(nutritionData, nutritionStats, periodType) {
  const { macroPlan } = nutritionData;
  
  if (!macroPlan || nutritionStats.totalDays === 0) {
    return {
      hasData: false,
      periodLabel: getPeriodLabel(periodType),
      adherenceLevel: 'no_data',
      averageScore: 0,
    };
  }

  // คำนวณคะแนนรวม adherence (เฉลี่ยของทั้ง 4 macros)
  const { calories, protein, carb, fat } = nutritionStats.averageAdherence;
  const averageScore = Math.round((calories + protein + carb + fat) / 4);

  // กำหนดระดับ adherence
  let adherenceLevel = 'excellent';
  if (averageScore < 60) adherenceLevel = 'poor';
  else if (averageScore < 75) adherenceLevel = 'fair';
  else if (averageScore < 90) adherenceLevel = 'good';

  return {
    hasData: true,
    periodLabel: getPeriodLabel(periodType),
    adherenceLevel,
    averageScore,
    loggedDays: nutritionStats.totalDays,
    planActive: macroPlan ? true : false,
  };
}

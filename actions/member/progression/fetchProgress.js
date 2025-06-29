"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูล Workout Progress สำหรับสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} periodType - ช่วงเวลา: 'WEEK','1M','2M','3M','6M','1Y','ALL'
 * @param {string} startDate - วันที่เริ่มต้น (optional)
 * @param {string} endDate - วันที่สิ้นสุด (optional)
 * @returns {Promise<Object>} ข้อมูล workout progress
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

    // คำนวณสถิติรวม
    const totalStats = calculateTotalStats(workoutData);

    // สร้าง summary data
    const summaryStats = createSummaryStats(
      workoutData,
      totalStats,
      periodType
    );

    // Format ข้อมูลสำหรับส่งกลับ
    const formattedData = formatProgressData(
      workoutData,
      totalStats,
      summaryStats,
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
 * @param {Object} totalStats - สถิติรวม
 * @param {Object} summaryStats - สถิติสรุป
 * @param {string} periodType - ช่วงเวลา
 * @returns {Object} ข้อมูลที่จัดรูปแบบแล้ว
 */
function formatProgressData(workoutData, totalStats, summaryStats, periodType) {
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

  return {
    period: {
      type: periodType,
      label: summaryStats.periodLabel,
      totalSessions: totalStats.totalSessions,
    },
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
    metadata: {
      generatedAt: new Date().toISOString(),
      memberId: parseInt(workoutData[0]?.member_id || 0),
      hasData: workoutData.length > 0,
    },
  };
}

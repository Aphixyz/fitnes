"use server";

import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

/**
 * ดึงข้อมูลประวัติการฝึกท่าออกกำลังกายเฉพาะท่าของสมาชิกคนหนึ่ง
 * @param {number} memberId - รหัสสมาชิก
 * @param {string} exerciseId - รหัสท่าออกกำลังกาย
 * @param {Object} options - ตัวเลือกสำหรับการกรองข้อมูล
 * @param {Date} options.startDate - วันที่เริ่มต้น
 * @param {Date} options.endDate - วันที่สิ้นสุด
 * @param {number} options.limit - จำนวนรายการสูงสุดที่ต้องการ
 * @param {string} options.sortBy - วิธีการเรียงลำดับ (date_asc, date_desc)
 * @returns {Promise<Object>} ข้อมูลประวัติการฝึกและข้อมูลสำหรับกราฟ
 */
export async function getExerciseLogByExerciseId(
  memberId,
  exerciseId,
  options = {}
) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberId || !exerciseId) {
      throw new Error("กรุณาระบุรหัสสมาชิกและรหัสท่าออกกำลังกาย");
    }

    // กำหนดค่าเริ่มต้นสำหรับตัวเลือก
    const {
      startDate = null,
      endDate = null,
      limit = 50,
      sortBy = "date_desc",
    } = options;

    // สร้างคำสั่ง SQL
    let query = `
      SELECT 
        el.*,
        wl.workout_date,
        wl.workout_log_id,
        wl.duration_minutes AS workout_duration,
        wl.intensity_level AS workout_intensity
      FROM 
        exercise_log el
      JOIN 
        workout_log wl ON el.workout_log_id = wl.workout_log_id
      WHERE 
        wl.member_id = ? 
      AND 
        el.exercise_id = ?
    `;

    // สร้าง array สำหรับ parameters
    const queryParams = [memberId, exerciseId];

    // เพิ่มเงื่อนไขวันที่ถ้ามีการระบุ
    if (startDate) {
      query += ` AND wl.workout_date >= ?`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND wl.workout_date <= ?`;
      queryParams.push(endDate);
    }

    // กำหนดการเรียงลำดับ
    if (sortBy === "date_asc") {
      query += ` ORDER BY wl.workout_date ASC`;
    } else {
      query += ` ORDER BY wl.workout_date DESC`;
    }

    // จำกัดจำนวนผลลัพธ์
    query += ` LIMIT ?`;
    queryParams.push(parseInt(limit));

    // ดึงข้อมูล
    const [logs] = await db.query(query, queryParams);

    // ดึงข้อมูลรายละเอียดของท่าออกกำลังกาย
    let exerciseDetails = {};
    try {
      const exercisesFilePath = path.join(
        process.cwd(),
        "public",
        "data",
        "exercises",
        "exercises.json"
      );
      const exercisesJson = await fs.readFile(exercisesFilePath, "utf8");
      const exercisesData = JSON.parse(exercisesJson);

      exerciseDetails = exercisesData.find((ex) => ex.id === exerciseId) || {
        id: exerciseId,
        name: "Unknown Exercise",
        thai_name: "ท่าออกกำลังกายที่ไม่รู้จัก",
        category: "",
        muscle_groups: [],
      };
    } catch (error) {
      console.error("Error reading exercise details:", error);
      exerciseDetails = {
        id: exerciseId,
        name: "Unknown Exercise",
        thai_name: "ท่าออกกำลังกายที่ไม่รู้จัก",
      };
    }

    // สร้างข้อมูลสำหรับกราฟ (เรียงตามวันที่จากเก่าไปใหม่)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.workout_date) - new Date(b.workout_date)
    );

    // แปลงข้อมูล weight_per_set และ reps_per_set เป็น array
    const processedLogs = sortedLogs.map((log) => {
      let weights = [];
      let reps = [];

      // แปลงข้อมูล weight_per_set และ reps_per_set
      if (log.weight_per_set) {
        weights = log.weight_per_set.split(",").map((w) => parseFloat(w) || 0);
      }

      if (log.reps_per_set) {
        reps = log.reps_per_set.split(",").map((r) => parseInt(r) || 0);
      }

      // คำนวณค่าเฉลี่ยและค่าสูงสุด
      const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
      const avgWeight =
        weights.length > 0
          ? weights.reduce((sum, w) => sum + w, 0) / weights.length
          : 0;

      const maxReps = reps.length > 0 ? Math.max(...reps) : 0;
      const totalReps =
        reps.length > 0 ? reps.reduce((sum, r) => sum + r, 0) : 0;

      const volume = weights.reduce((total, weight, i) => {
        const rep = reps[i] || 0;
        return total + weight * rep;
      }, 0);

      return {
        ...log,
        weights,
        reps,
        maxWeight,
        avgWeight,
        maxReps,
        totalReps,
        volume,
      };
    });

    // สร้างข้อมูลกราฟ
    const graphData = {
      dates: processedLogs.map((log) => log.workout_date),
      maxWeight: processedLogs.map((log) => log.maxWeight),
      avgWeight: processedLogs.map((log) => log.avgWeight),
      totalReps: processedLogs.map((log) => log.totalReps),
      volume: processedLogs.map((log) => log.volume),
    };

    // คำนวณสถิติสรุป
    const summary = {
      exercise_count: processedLogs.length,
      first_date:
        processedLogs.length > 0 ? processedLogs[0].workout_date : null,
      last_date:
        processedLogs.length > 0
          ? processedLogs[processedLogs.length - 1].workout_date
          : null,
      max_weight_ever:
        processedLogs.length > 0
          ? Math.max(...processedLogs.map((log) => log.maxWeight))
          : 0,
      max_volume_ever:
        processedLogs.length > 0
          ? Math.max(...processedLogs.map((log) => log.volume))
          : 0,
      max_reps_ever:
        processedLogs.length > 0
          ? Math.max(...processedLogs.map((log) => log.maxReps))
          : 0,
      progress: calculateProgress(processedLogs),
    };

    return {
      success: true,
      exercise: exerciseDetails,
      logs: processedLogs,
      graph_data: graphData,
      summary,
    };
  } catch (error) {
    console.error("Error fetching exercise logs by exercise ID:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการฝึก",
    };
  }
}

/**
 * คำนวณความก้าวหน้าของการฝึก
 * @param {Array} logs - ข้อมูลการฝึกทั้งหมด
 * @returns {Object} ข้อมูลความก้าวหน้า
 */
function calculateProgress(logs) {
  if (logs.length < 2) {
    return { weight: 0, reps: 0, volume: 0 };
  }

  const first = logs[0];
  const last = logs[logs.length - 1];

  // คำนวณเปอร์เซ็นต์ความก้าวหน้า
  const weightProgress =
    first.maxWeight > 0
      ? ((last.maxWeight - first.maxWeight) / first.maxWeight) * 100
      : 0;

  const repsProgress =
    first.totalReps > 0
      ? ((last.totalReps - first.totalReps) / first.totalReps) * 100
      : 0;

  const volumeProgress =
    first.volume > 0 ? ((last.volume - first.volume) / first.volume) * 100 : 0;

  return {
    weight: parseFloat(weightProgress.toFixed(2)),
    reps: parseFloat(repsProgress.toFixed(2)),
    volume: parseFloat(volumeProgress.toFixed(2)),
  };
}

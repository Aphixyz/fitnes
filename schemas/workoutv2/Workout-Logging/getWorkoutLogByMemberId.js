"use server";

import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

/**
 * ดึงประวัติการออกกำลังกายทั้งหมดของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {Object} options - ตัวเลือกสำหรับการกรองข้อมูล
 * @param {Date} options.startDate - วันที่เริ่มต้น
 * @param {Date} options.endDate - วันที่สิ้นสุด
 * @param {number} options.limit - จำนวนรายการสูงสุดที่ต้องการ
 * @param {string} options.sortBy - วิธีการเรียงลำดับ (date_asc, date_desc)
 * @returns {Promise<Object>} ข้อมูลประวัติการออกกำลังกาย
 */
export async function getWorkoutLogByMemberId(memberId, options = {}) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // กำหนดค่าเริ่มต้นสำหรับตัวเลือก
    const {
      startDate = null,
      endDate = null,
      limit = 100,
      sortBy = "date_desc",
    } = options;

    // สร้างคำสั่ง SQL พื้นฐาน
    let query = `
      SELECT 
        wl.*,
        wp.plan_name,
        wp.trainer_id,
        m.member_firstname,
        m.member_lastname,
        t.trainer_firstname,
        t.trainer_lastname
      FROM 
        workout_log wl
      LEFT JOIN 
        workout_plan wp ON wl.workout_plan_id = wp.workout_plan_id
      LEFT JOIN 
        member m ON wl.member_id = m.member_id
      LEFT JOIN 
        trainer t ON wp.trainer_id = t.trainer_id
      WHERE 
        wl.member_id = ?
    `;

    // สร้าง array สำหรับ parameters
    const queryParams = [memberId];

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

    // ดึงข้อมูล workout logs
    const [workoutLogs] = await db.query(query, queryParams);

    // อ่านข้อมูลท่าออกกำลังกายจาก exercises.json
    let exercisesData = [];
    try {
      const exercisesFilePath = path.join(
        process.cwd(),
        "public",
        "data",
        "exercises",
        "exercises.json"
      );
      const exercisesJson = await fs.readFile(exercisesFilePath, "utf8");
      exercisesData = JSON.parse(exercisesJson);
    } catch (error) {
      console.error("Error reading exercises data:", error);
      // ถ้าอ่านไฟล์ไม่สำเร็จ ก็ยังคงทำงานต่อไป
    }

    // สร้าง map ของท่าออกกำลังกายเพื่อค้นหาได้เร็ว
    const exercisesMap = {};
    exercisesData.forEach((exercise) => {
      exercisesMap[exercise.id] = exercise;
    });

    // ดึงข้อมูลที่บันทึกสำหรับแต่ละ workout log
    const workoutLogsWithDetail = await Promise.all(
      workoutLogs.map(async (log) => {
        // ดึงข้อมูลท่าออกกำลังกายที่บันทึก
        const [exerciseLogs] = await db.query(
          `
        SELECT * FROM exercise_log WHERE workout_log_id = ? ORDER BY exercise_order ASC
      `,
          [log.workout_log_id]
        );

        // เพิ่มข้อมูลท่าออกกำลังกาย
        const enrichedExerciseLogs = exerciseLogs.map((exerciseLog) => {
          const exerciseDetails = exercisesMap[exerciseLog.exercise_id] || {};
          return {
            ...exerciseLog,
            name: exerciseDetails.name || "",
            thai_name: exerciseDetails.thai_name || "",
            category: exerciseDetails.category || "",
            muscle_groups: exerciseDetails.muscle_groups || [],
            image: exerciseDetails.image || "",
          };
        });

        // จัดรูปแบบข้อมูล
        return {
          ...log,
          trainer_name:
            log.trainer_firstname && log.trainer_lastname
              ? `${log.trainer_firstname} ${log.trainer_lastname}`
              : "",
          member_name:
            log.member_firstname && log.member_lastname
              ? `${log.member_firstname} ${log.member_lastname}`
              : "",
          exercise_logs: enrichedExerciseLogs,
          exercise_count: enrichedExerciseLogs.length,
          unique_muscle_groups: [
            ...new Set(
              enrichedExerciseLogs.flatMap((ex) => ex.muscle_groups || [])
            ),
          ],
        };
      })
    );

    // คำนวณสถิติสรุป
    const summary = {
      total_workouts: workoutLogsWithDetail.length,
      total_exercise_minutes: workoutLogsWithDetail.reduce(
        (acc, log) => acc + (log.duration_minutes || 0),
        0
      ),
      average_intensity: workoutLogsWithDetail.length
        ? workoutLogsWithDetail.reduce(
            (acc, log) => acc + (log.intensity_level || 0),
            0
          ) / workoutLogsWithDetail.length
        : 0,
      average_completion: workoutLogsWithDetail.length
        ? workoutLogsWithDetail.reduce(
            (acc, log) => acc + (log.completion_percentage || 0),
            0
          ) / workoutLogsWithDetail.length
        : 0,
      recent_muscle_groups: [
        ...new Set(
          workoutLogsWithDetail
            .slice(0, 5)
            .flatMap((log) => log.unique_muscle_groups)
        ),
      ],
      most_recent_date:
        workoutLogsWithDetail.length > 0
          ? workoutLogsWithDetail[0].workout_date
          : null,
    };

    // สร้างข้อมูลสำหรับกราฟ
    const graphData = {
      dates: workoutLogsWithDetail.map((log) => log.workout_date),
      duration: workoutLogsWithDetail.map((log) => log.duration_minutes),
      intensity: workoutLogsWithDetail.map((log) => log.intensity_level),
      completion: workoutLogsWithDetail.map((log) => log.completion_percentage),
    };

    return {
      success: true,
      logs: workoutLogsWithDetail,
      summary,
      graph_data: graphData,
    };
  } catch (error) {
    console.error("Error fetching workout logs by member ID:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการออกกำลังกาย",
    };
  }
}

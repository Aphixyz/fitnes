"use server";

import { z } from "zod";
import pool from "@/lib/db";

// Schema สำหรับตรวจสอบข้อมูล
const getTodaySessionsSchema = z.object({
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  day: z.string().optional(), // จะใช้เมื่อต้องการดึงข้อมูลของวันอื่นที่ไม่ใช่วันนี้ (เช่น "จันทร์", "อังคาร")
});

/**
 * ดึงข้อมูลเซสชันการออกกำลังกายของวันนี้สำหรับสมาชิก
 * @param {Object} data - ข้อมูลสำหรับการค้นหาเซสชัน
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function getWorkoutSessionsForToday(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = getTodaySessionsSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const { member_id, day } = validatedData;

    // หาวันในสัปดาห์ของวันนี้ ถ้าไม่ได้ระบุ day
    let dayOfWeek = day;

    if (!dayOfWeek) {
      // รายการวันในสัปดาห์ภาษาไทย
      const thaiDays = [
        "อาทิตย์",
        "จันทร์",
        "อังคาร",
        "พุธ",
        "พฤหัสบดี",
        "ศุกร์",
        "เสาร์",
      ];

      // ดึงวันในสัปดาห์ปัจจุบัน
      const today = new Date();
      const dayIndex = today.getDay(); // 0-6 (อาทิตย์-เสาร์)

      // แปลงเป็นวันภาษาไทย
      dayOfWeek = thaiDays[dayIndex];
    }

    // ดึงข้อมูลแผนการออกกำลังกายที่ใช้งานอยู่
    const [activePlans] = await pool.query(
      `SELECT wp.* 
       FROM workout_plan wp 
       WHERE wp.member_id = ? 
       AND wp.plan_status = 'active' 
       AND wp.plan_startdate <= CURDATE() 
       AND wp.plan_enddate >= CURDATE()`,
      [member_id]
    );

    // ถ้าไม่พบแผนการออกกำลังกาย
    if (!activePlans.length) {
      return {
        success: true,
        data: {
          sessions: [],
          workoutPlan: null,
          todayDate: new Date().toISOString().split("T")[0],
          dayOfWeek,
        },
        message: "ไม่พบแผนการออกกำลังกายที่ใช้งานอยู่",
      };
    }

    // ใช้แผนแรกที่พบ
    const workoutPlan = activePlans[0];

    // ดึงเซสชันที่ตรงกับวันในสัปดาห์
    const [sessions] = await pool.query(
      `SELECT ws.* 
       FROM workout_session ws 
       WHERE ws.workout_plan_id = ? 
       AND ws.day_of_week = ? 
       ORDER BY ws.order_index`,
      [workoutPlan.workout_plan_id, dayOfWeek]
    );

    // ดึงข้อมูลท่าออกกำลังกายสำหรับแต่ละเซสชัน
    for (const session of sessions) {
      const [exercises] = await pool
        .query(
          `SELECT we.*, e.name as exercise_name, e.thai_name, e.description, 
                e.muscle_groups, e.difficulty 
         FROM workout_exercise we 
         LEFT JOIN (
           SELECT id, name, thai_name, description, muscle_groups, difficulty 
           FROM json_table(
             (SELECT JSON_ARRAYAGG(data) FROM (
               SELECT JSON_EXTRACT(content, '$') as data 
               FROM json_table(
                 (SELECT JSON_EXTRACT(CONVERT(LOAD_FILE('/Users/panyakkd/Desktop/Senior_Project/fitnes/public/data/exercises/exercises.json') USING utf8mb4), '$') as exercises), 
                 '$[*]' COLUMNS(content JSON PATH '$')
               ) as exercise_data
             ) as extracted_data),
             '$[*]' COLUMNS(
               id VARCHAR(100) PATH '$.id',
               name VARCHAR(100) PATH '$.name',
               thai_name VARCHAR(100) PATH '$.thai_name',
               description TEXT PATH '$.description',
               muscle_groups JSON PATH '$.muscle_groups',
               difficulty VARCHAR(50) PATH '$.difficulty'
             )
           ) as exercises
         ) as e ON we.exercise_id = e.id
         WHERE we.session_id = ?
         ORDER BY we.order_index`,
          [session.session_id]
        )
        .catch((error) => {
          // หากไม่สามารถดึงข้อมูลจาก JSON file ได้ ให้ดึงเฉพาะข้อมูลจาก DB
          console.error(
            "ไม่สามารถดึงข้อมูลท่าออกกำลังกายจาก JSON file:",
            error
          );
          return pool.query(
            `SELECT we.* FROM workout_exercise we 
           WHERE we.session_id = ? 
           ORDER BY we.order_index`,
            [session.session_id]
          );
        });

      // เพิ่มข้อมูลท่าออกกำลังกายลงในเซสชัน
      session.exercises = exercises;

      // ตรวจสอบว่ามีการบันทึกการออกกำลังกายสำหรับเซสชันนี้ในวันนี้หรือไม่
      const [existingLogs] = await pool.query(
        `SELECT wl.*, COUNT(el.exercise_log_id) as exercise_count 
         FROM workout_log wl 
         LEFT JOIN exercise_log el ON wl.workout_log_id = el.workout_log_id
         WHERE wl.member_id = ? 
         AND wl.workout_plan_id = ? 
         AND wl.workout_date = CURDATE()
         GROUP BY wl.workout_log_id`,
        [member_id, workoutPlan.workout_plan_id]
      );

      session.isCompleted = existingLogs.length > 0;
      session.workout_log = existingLogs.length > 0 ? existingLogs[0] : null;
    }

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        sessions,
        workoutPlan,
        todayDate: new Date().toISOString().split("T")[0],
        dayOfWeek,
      },
      message:
        sessions.length > 0
          ? `พบ ${sessions.length} เซสชันสำหรับวัน${dayOfWeek}`
          : `ไม่มีเซสชันการออกกำลังกายสำหรับวัน${dayOfWeek}`,
    };
  } catch (error) {
    // จัดการข้อผิดพลาดตามประเภท
    if (error instanceof z.ZodError) {
      console.error("ข้อมูลไม่ถูกต้อง:", error.errors);
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก",
      };
    }

    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเซสชันการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message:
        "เกิดข้อผิดพลาดในการดึงข้อมูลเซสชันการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  }
}

"use server";

import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

/**
 * ดึงข้อมูลรายละเอียดของแผนการออกกำลังกายตาม ID พร้อมเซสชันและท่าออกกำลังกาย
 * @param {number} workoutPlanId - รหัสแผนการออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดึงข้อมูล
 */
export async function getWorkoutPlanDetailById(workoutPlanId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!workoutPlanId) {
      throw new Error("กรุณาระบุรหัสแผนการออกกำลังกาย");
    }

    // ดึงข้อมูลแผนการออกกำลังกาย
    const [workoutPlans] = await db.query(
      `
      SELECT 
        wp.*,
        m.member_firstname, 
        m.member_lastname,
        t.trainer_firstname,
        t.trainer_lastname
      FROM 
        workout_plan wp
      LEFT JOIN 
        member m ON wp.member_id = m.member_id
      LEFT JOIN
        trainer t ON wp.trainer_id = t.trainer_id
      WHERE 
        wp.workout_plan_id = ?
    `,
      [workoutPlanId]
    );

    if (workoutPlans.length === 0) {
      throw new Error("ไม่พบแผนการออกกำลังกายที่ระบุ");
    }

    const workoutPlan = workoutPlans[0];

    // เพิ่มชื่อสมาชิกและเทรนเนอร์
    workoutPlan.member_name = `${workoutPlan.member_firstname || ""} ${
      workoutPlan.member_lastname || ""
    }`.trim();
    workoutPlan.trainer_name = `${workoutPlan.trainer_firstname || ""} ${
      workoutPlan.trainer_lastname || ""
    }`.trim();

    // ดึงข้อมูลเซสชัน
    const [sessions] = await db.query(
      `
      SELECT 
        * 
      FROM 
        workout_session 
      WHERE 
        workout_plan_id = ?
      ORDER BY
        order_index ASC
    `,
      [workoutPlanId]
    );

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

    // ดึงข้อมูลท่าออกกำลังกายสำหรับแต่ละเซสชัน
    const sessionsWithExercises = await Promise.all(
      sessions.map(async (session) => {
        const [exercises] = await db.query(
          `
        SELECT 
          * 
        FROM 
          workout_exercise 
        WHERE 
          session_id = ?
        ORDER BY
          order_index ASC
      `,
          [session.session_id]
        );

        // เพิ่มข้อมูลรายละเอียดของท่าออกกำลังกายจาก exercises.json
        const enrichedExercises = exercises.map((exercise) => {
          const exerciseDetails = exercisesMap[exercise.exercise_id] || {};
          return {
            ...exercise,
            name: exerciseDetails.name || "",
            thai_name: exerciseDetails.thai_name || "",
            description: exerciseDetails.description || "",
            muscle_groups: exerciseDetails.muscle_groups || [],
            category: exerciseDetails.category || "",
            difficulty: exerciseDetails.difficulty || "",
            image: exerciseDetails.image || "",
          };
        });

        return {
          ...session,
          exercises: enrichedExercises,
        };
      })
    );

    return {
      success: true,
      plan: {
        ...workoutPlan,
        sessions: sessionsWithExercises,
      },
    };
  } catch (error) {
    console.error("Error fetching workout plan detail by ID:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผนการออกกำลังกาย",
    };
  }
}

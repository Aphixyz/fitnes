"use server";

import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

/**
 * อ่านข้อมูลท่าออกกำลังกายจากไฟล์ JSON
 * @returns {Promise<Array>} - ข้อมูลท่าออกกำลังกายทั้งหมด
 */
async function readExercisesData() {
  try {
    const exercisesPath = path.join(
      process.cwd(),
      "public",
      "data",
      "exercises",
      "exercises.json"
    );
    const data = await fs.readFile(exercisesPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading exercises data:", error);
    return [];
  }
}

/**
 * ดึงข้อมูลโปรแกรมการฝึกที่ active ของสมาชิกพร้อมท่าออกกำลังกาย
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object|null>} - ข้อมูลโปรแกรมการฝึกพร้อมท่าออกกำลังกายที่จัดกลุ่มตามวัน หรือ null หากไม่พบ
 */
export async function getActiveWorkoutPlan(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลโปรแกรมการฝึกที่ active
    const [plans] = await db.query(
      `SELECT * FROM workout_plan 
       WHERE member_id = ? AND plan_status = 'active' 
       ORDER BY plan_startdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!plans || plans.length === 0) {
      return null;
    }

    const plan = plans[0];

    // ดึงข้อมูลท่าออกกำลังกายในโปรแกรม
    const [exercises] = await db.query(
      `SELECT * 
       FROM workout_exercise 
       WHERE workout_plan_id = ? 
       ORDER BY exercise_day, exercise_order`,
      [plan.workout_plan_id]
    );

    // อ่านข้อมูลท่าออกกำลังกายจากไฟล์ JSON
    const allExercises = await readExercisesData();
    const exercisesMap = allExercises.reduce((map, exercise) => {
      map[exercise.id] = exercise;
      return map;
    }, {});

    // เพิ่มข้อมูลรายละเอียดท่าออกกำลังกาย
    const exercisesWithDetails = exercises.map((exercise) => {
      const details = exercisesMap[exercise.exercise_id] || {};
      return {
        ...exercise,
        exercise_name: details.name || details.thai_name || "ไม่ระบุชื่อ",
        exercise_description: details.description || "",
        exercise_image: details.image || null,
        equipment: details.equipment || [],
        muscle_groups: details.muscle_groups || [],
      };
    });

    // จัดกลุ่มตามวัน
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    
    const groupedByDay = {};
    
    // สร้าง empty array สำหรับทุกวัน เพื่อให้แน่ใจว่ามีทุกวันแม้จะไม่มีท่าออกกำลังกาย
    daysOfWeek.forEach(day => {
      groupedByDay[day] = [];
    });
    
    // เพิ่มท่าออกกำลังกายเข้าไปตามวัน
    exercisesWithDetails.forEach((exercise) => {
      const day = exercise.exercise_day || "Unknown";
      if (groupedByDay[day]) {
        groupedByDay[day].push(exercise);
      } else {
        groupedByDay[day] = [exercise];
      }
    });

    return {
      plan,
      exercises: exercisesWithDetails,
      groupedByDay,
    };
  } catch (error) {
    console.error("Error fetching active workout plan:", error);
    return null;
  }
}
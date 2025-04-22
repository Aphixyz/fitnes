"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลแผนการฝึกและแผนโภชนาการที่กำลังใช้งานของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - แผนการฝึกและแผนโภชนาการที่กำลังใช้งาน
 */
export async function getActivePlans(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลแผนการฝึกที่ active
    const [workoutPlans] = await db.query(
      `SELECT wp.*, 
              t.trainer_firstname, 
              t.trainer_lastname 
       FROM workout_plan wp 
       JOIN trainer t ON wp.trainer_id = t.trainer_id 
       WHERE wp.member_id = ? 
       AND wp.plan_status = 'active' 
       ORDER BY wp.plan_startdate DESC 
       LIMIT 1`,
      [memberId]
    );

    // ดึงข้อมูลแผนโภชนาการที่ active
    const [nutritionPlans] = await db.query(
      `SELECT np.*, 
              t.trainer_firstname, 
              t.trainer_lastname 
       FROM nutrition_plan np 
       JOIN trainer t ON np.trainer_id = t.trainer_id 
       WHERE np.member_id = ? 
       AND np.plan_status = 'active' 
       ORDER BY np.plan_startdate DESC 
       LIMIT 1`,
      [memberId]
    );

    // ถ้ามีแผนโภชนาการ ให้ดึงข้อมูลมื้ออาหารด้วย
    let meals = [];
    if (nutritionPlans.length > 0) {
      const [mealResults] = await db.query(
        `SELECT * FROM meal_plan WHERE nutrition_plan_id = ?`,
        [nutritionPlans[0].nutrition_plan_id]
      );
      meals = mealResults;
    }

    // ถ้ามีแผนการฝึก ให้ดึงข้อมูลท่าออกกำลังกายสำหรับวันนี้
    let todayExercises = [];
    if (workoutPlans.length > 0) {
      // หาว่าวันนี้เป็นวันอะไร (1-7, โดย 1 คือ วันจันทร์)
      const today = new Date().getDay();
      const dayMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }; // แปลง 0 (วันอาทิตย์) เป็น 7
      const todayNumber = dayMap[today];

      // ดึงท่าออกกำลังกายสำหรับวันนี้
      const [exerciseResults] = await db.query(
        `SELECT * FROM workout_exercise 
         WHERE workout_plan_id = ? AND exercise_day = ? 
         ORDER BY exercise_order`,
        [workoutPlans[0].workout_plan_id, todayNumber.toString()]
      );
      todayExercises = exerciseResults;
    }

    return {
      workoutPlan: workoutPlans.length > 0 ? {
        ...workoutPlans[0],
        trainer_name: `${workoutPlans[0].trainer_firstname} ${workoutPlans[0].trainer_lastname}`,
        todayExercises
      } : null,
      nutritionPlan: nutritionPlans.length > 0 ? {
        ...nutritionPlans[0],
        trainer_name: `${nutritionPlans[0].trainer_firstname} ${nutritionPlans[0].trainer_lastname}`,
        meals
      } : null
    };
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return {
      workoutPlan: null,
      nutritionPlan: null,
      error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแผน"
    };
  }
}
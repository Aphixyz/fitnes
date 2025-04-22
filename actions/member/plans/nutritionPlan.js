"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลแผนโภชนาการที่กำลังใช้งานของสมาชิกพร้อมมื้ออาหารและรายการอาหาร
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object|null>} - ข้อมูลแผนโภชนาการพร้อมมื้ออาหารและรายการอาหาร หรือ null หากไม่พบ
 */
export async function getActiveNutritionPlan(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลแผนโภชนาการที่ active
    const [plans] = await db.query(
      `SELECT * FROM nutrition_plan 
       WHERE member_id = ? AND plan_status = 'active' 
       ORDER BY plan_startdate DESC 
       LIMIT 1`,
      [memberId]
    );

    if (!plans || plans.length === 0) {
      return null;
    }

    const plan = plans[0];

    // ดึงข้อมูลมื้ออาหารในแผนโภชนาการ
    const [meals] = await db.query(
      `SELECT * FROM meal_plan 
       WHERE nutrition_plan_id = ? 
       ORDER BY meal_plan_id`,
      [plan.nutrition_plan_id]
    );

    // เตรียมข้อมูลอาหารสำหรับแต่ละมื้อ
    const mealsWithFoods = await Promise.all(
      meals.map(async (meal) => {
        // ดึงข้อมูลรายการอาหารในแต่ละมื้อ
        const [mealFoods] = await db.query(
          `SELECT mf.*, f.* 
           FROM meal_food mf 
           JOIN food f ON mf.food_id = f.food_id 
           WHERE mf.meal_plan_id = ? 
           ORDER BY mf.meal_food_id`,
          [meal.meal_plan_id]
        );

        // คำนวณแคลอรี่รวมสำหรับมื้ออาหารนี้
        const totalMealCalories = mealFoods.reduce((sum, food) => {
          return sum + Math.round(food.calories * food.serving_quantity);
        }, 0);

        // คำนวณปริมาณสารอาหารรวม
        const totalMealNutrients = mealFoods.reduce(
          (acc, food) => {
            return {
              protein: acc.protein + food.protein * food.serving_quantity,
              carbs: acc.carbs + food.carbs * food.serving_quantity,
              fat: acc.fat + food.fat * food.serving_quantity,
            };
          },
          { protein: 0, carbs: 0, fat: 0 }
        );

        return {
          ...meal,
          foods: mealFoods,
          totalCalories: totalMealCalories,
          totalNutrients: totalMealNutrients,
        };
      })
    );

    // คำนวณแคลอรี่และสารอาหารรวมต่อวัน
    const dailyTotals = mealsWithFoods.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + meal.totalCalories,
          protein: acc.protein + meal.totalNutrients.protein,
          carbs: acc.carbs + meal.totalNutrients.carbs,
          fat: acc.fat + meal.totalNutrients.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // คำนวณเปอร์เซ็นต์ของเป้าหมายสารอาหาร
    const macroPercentages = {
      protein: plan.protein_target
        ? Math.min(
            Math.round((dailyTotals.protein / plan.protein_target) * 100),
            100
          )
        : 0,
      carbs: plan.carbs_target
        ? Math.min(
            Math.round((dailyTotals.carbs / plan.carbs_target) * 100),
            100
          )
        : 0,
      fat: plan.fat_target
        ? Math.min(Math.round((dailyTotals.fat / plan.fat_target) * 100), 100)
        : 0,
      calories: plan.daily_calories
        ? Math.min(
            Math.round((dailyTotals.calories / plan.daily_calories) * 100),
            100
          )
        : 0,
    };

    return {
      plan,
      meals: mealsWithFoods,
      dailyTotals,
      macroPercentages,
    };
  } catch (error) {
    console.error("Error fetching active nutrition plan:", error);
    return null;
  }
}

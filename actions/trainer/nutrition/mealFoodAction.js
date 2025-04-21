'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * ดึงข้อมูลอาหารในมื้อ
 */
export async function getMealFoods(mealId) {
  try {
    if (!mealId) {
      return { success: false, message: 'กรุณาระบุรหัสมื้ออาหาร' };
    }

    const [foodItems] = await db.query(
      `SELECT mf.*, 
              f.food_name,
              f.food_category,
              f.serving_size,
              f.calories,
              f.protein,
              f.carbs,
              f.fat,
              f.fiber,
              f.sugar,
              f.sodium,
              (f.calories * mf.serving_quantity) as total_calories,
              (f.protein * mf.serving_quantity) as total_protein,
              (f.carbs * mf.serving_quantity) as total_carbs,
              (f.fat * mf.serving_quantity) as total_fat
       FROM meal_food mf
       JOIN food f ON mf.food_id = f.food_id
       WHERE mf.meal_plan_id = ?
       ORDER BY mf.day_of_week, f.food_name`,
      [mealId]
    );

    return { success: true, foodItems };
  } catch (error) {
    console.error('Error fetching meal foods:', error);
    return { success: false, message: error.message };
  }
}

/**
 * เพิ่มอาหารในมื้อ
 */
export async function addFoodToMeal(data, trainerId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.meal_plan_id || !data.food_id || !trainerId) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // ตรวจสอบว่ามื้ออาหารนี้มีอยู่จริงและเทรนเนอร์มีสิทธิ์แก้ไข
    const [meals] = await db.query(
      `SELECT mp.meal_plan_id, mp.nutrition_plan_id 
       FROM meal_plan mp
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mp.meal_plan_id = ? AND np.trainer_id = ?`,
      [data.meal_plan_id, trainerId]
    );

    if (meals.length === 0) {
      return { success: false, message: 'ไม่พบมื้ออาหารหรือไม่มีสิทธิ์แก้ไข' };
    }

    const nutritionPlanId = meals[0].nutrition_plan_id;

    // ตรวจสอบว่าอาหารนี้มีอยู่จริง
    const [foods] = await db.query(
      'SELECT food_id FROM food WHERE food_id = ?',
      [data.food_id]
    );

    if (foods.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลอาหาร' };
    }

    // ตรวจสอบว่าอาหารนี้มีในมื้ออยู่แล้วหรือไม่
    const [existingItems] = await db.query(
      'SELECT meal_food_id FROM meal_food WHERE meal_plan_id = ? AND food_id = ? AND day_of_week = ?',
      [data.meal_plan_id, data.food_id, data.day_of_week || 'all']
    );

    if (existingItems.length > 0) {
      // ถ้ามีอยู่แล้ว ให้อัพเดตจำนวนเสิร์ฟ
      await db.query(
        `UPDATE meal_food SET 
          serving_quantity = serving_quantity + ?,
          notes = CASE WHEN ? IS NULL THEN notes ELSE ? END
         WHERE meal_food_id = ?`,
        [
          data.serving_quantity || 1,
          data.notes,
          data.notes,
          existingItems[0].meal_food_id
        ]
      );

      // Revalidate paths
      revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
      revalidatePath(`/trainer/meals/${data.meal_plan_id}`);

      return { 
        success: true, 
        message: 'อัพเดตจำนวนเสิร์ฟอาหารสำเร็จ',
        meal_food_id: existingItems[0].meal_food_id
      };
    } else {
      // ถ้ายังไม่มี ให้เพิ่มใหม่
      const [result] = await db.query(
        `INSERT INTO meal_food (
          meal_plan_id, food_id, serving_quantity, day_of_week, notes
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          data.meal_plan_id,
          data.food_id,
          data.serving_quantity || 1,
          data.day_of_week || 'all',
          data.notes || null
        ]
      );

      // Revalidate paths
      revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
      revalidatePath(`/trainer/meals/${data.meal_plan_id}`);

      return { 
        success: true, 
        message: 'เพิ่มอาหารในมื้อสำเร็จ',
        meal_food_id: result.insertId
      };
    }
  } catch (error) {
    console.error('Error adding food to meal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * อัพเดตอาหารในมื้อ
 */
export async function updateMealFood(mealFoodId, data, trainerId) {
  try {
    if (!mealFoodId || !data || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่าอาหารในมื้อนี้มีอยู่จริงและเทรนเนอร์มีสิทธิ์แก้ไข
    const [mealFoods] = await db.query(
      `SELECT mf.meal_food_id, mf.meal_plan_id, mp.nutrition_plan_id
       FROM meal_food mf
       JOIN meal_plan mp ON mf.meal_plan_id = mp.meal_plan_id
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mf.meal_food_id = ? AND np.trainer_id = ?`,
      [mealFoodId, trainerId]
    );

    if (mealFoods.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลอาหารในมื้อหรือไม่มีสิทธิ์แก้ไข' };
    }

    const mealPlanId = mealFoods[0].meal_plan_id;
    const nutritionPlanId = mealFoods[0].nutrition_plan_id;

    // ค้นหาโพรเพอร์ตี้ที่จะอัพเดตและสร้าง SQL
    const updateProperties = Object.entries(data)
      .filter(([key]) => {
        // กรองฟิลด์ที่ไม่อนุญาตให้แก้ไข
        return !['meal_food_id', 'meal_plan_id', 'food_id'].includes(key);
      })
      .map(([key]) => `${key} = ?`);
    
    if (updateProperties.length === 0) {
      return { success: false, message: 'ไม่มีข้อมูลที่ต้องการแก้ไข' };
    }

    const updateValues = Object.entries(data)
      .filter(([key]) => !['meal_food_id', 'meal_plan_id', 'food_id'].includes(key))
      .map(([_, value]) => value);
      
    // เพิ่มค่า mealFoodId สำหรับ WHERE
    updateValues.push(mealFoodId);
    
    await db.query(
      `UPDATE meal_food SET ${updateProperties.join(', ')} WHERE meal_food_id = ?`,
      updateValues
    );

    // Revalidate paths
    revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
    revalidatePath(`/trainer/meals/${mealPlanId}`);

    return { success: true, message: 'อัพเดตอาหารในมื้อสำเร็จ' };
  } catch (error) {
    console.error('Error updating meal food:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ลบอาหารในมื้อ
 */
export async function deleteMealFood(mealFoodId, trainerId) {
  try {
    if (!mealFoodId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่าอาหารในมื้อนี้มีอยู่จริงและเทรนเนอร์มีสิทธิ์ลบ
    const [mealFoods] = await db.query(
      `SELECT mf.meal_food_id, mf.meal_plan_id, mp.nutrition_plan_id
       FROM meal_food mf
       JOIN meal_plan mp ON mf.meal_plan_id = mp.meal_plan_id
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mf.meal_food_id = ? AND np.trainer_id = ?`,
      [mealFoodId, trainerId]
    );

    if (mealFoods.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลอาหารในมื้อหรือไม่มีสิทธิ์ลบ' };
    }

    const mealPlanId = mealFoods[0].meal_plan_id;
    const nutritionPlanId = mealFoods[0].nutrition_plan_id;

    // ลบอาหารในมื้อ
    await db.query(
      'DELETE FROM meal_food WHERE meal_food_id = ?',
      [mealFoodId]
    );

    // Revalidate paths
    revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
    revalidatePath(`/trainer/meals/${mealPlanId}`);

    return { success: true, message: 'ลบอาหารในมื้อสำเร็จ' };
  } catch (error) {
    console.error('Error deleting meal food:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ดึงข้อมูลสรุปโภชนาการของมื้ออาหาร
 */
export async function getMealNutritionSummary(mealId) {
  try {
    if (!mealId) {
      return { success: false, message: 'กรุณาระบุรหัสมื้ออาหาร' };
    }

    const [summary] = await db.query(
      `SELECT 
        SUM(f.calories * mf.serving_quantity) as total_calories,
        SUM(f.protein * mf.serving_quantity) as total_protein,
        SUM(f.carbs * mf.serving_quantity) as total_carbs,
        SUM(f.fat * mf.serving_quantity) as total_fat,
        SUM(f.fiber * mf.serving_quantity) as total_fiber,
        SUM(f.sugar * mf.serving_quantity) as total_sugar,
        COUNT(mf.meal_food_id) as food_count
       FROM meal_food mf
       JOIN food f ON mf.food_id = f.food_id
       WHERE mf.meal_plan_id = ?`,
      [mealId]
    );

    return { 
      success: true, 
      summary: summary[0] || {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        total_sugar: 0,
        food_count: 0
      }
    };
  } catch (error) {
    console.error('Error fetching meal nutrition summary:', error);
    return { success: false, message: error.message };
  }
}

/**
 * คัดลอกอาหารจากมื้อหนึ่งไปยังอีกมื้อหนึ่ง
 */
export async function copyFoodsToMeal(sourceMealId, targetMealId, trainerId) {
  try {
    if (!sourceMealId || !targetMealId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่ามื้อต้นทางและปลายทางมีอยู่จริง และเทรนเนอร์มีสิทธิ์
    const [meals] = await db.query(
      `SELECT 
        source.meal_plan_id as source_id, 
        source.nutrition_plan_id as source_plan_id,
        target.meal_plan_id as target_id,
        target.nutrition_plan_id as target_plan_id
       FROM 
        meal_plan as source,
        meal_plan as target,
        nutrition_plan as np_source,
        nutrition_plan as np_target
       WHERE 
        source.meal_plan_id = ? AND
        target.meal_plan_id = ? AND
        source.nutrition_plan_id = np_source.nutrition_plan_id AND
        target.nutrition_plan_id = np_target.nutrition_plan_id AND
        np_source.trainer_id = ? AND
        np_target.trainer_id = ?`,
      [sourceMealId, targetMealId, trainerId, trainerId]
    );

    if (meals.length === 0) {
      return { success: false, message: 'ไม่พบมื้ออาหารหรือไม่มีสิทธิ์ในการดำเนินการ' };
    }

    const targetPlanId = meals[0].target_plan_id;

    // เริ่ม transaction
    await db.query('START TRANSACTION');
    
    try {
      // ดึงข้อมูลอาหารจากมื้อต้นทาง
      const [sourceFoods] = await db.query(
        `SELECT * FROM meal_food WHERE meal_plan_id = ?`,
        [sourceMealId]
      );
      
      if (sourceFoods.length === 0) {
        await db.query('COMMIT');
        return { success: true, message: 'ไม่มีอาหารในมื้อต้นทาง', copied: 0 };
      }
      
      // คัดลอกอาหารแต่ละรายการไปยังมื้อปลายทาง
      for (const food of sourceFoods) {
        // ตรวจสอบว่ามีอาหารนี้ในมื้อปลายทางแล้วหรือไม่
        const [existing] = await db.query(
          `SELECT meal_food_id FROM meal_food 
           WHERE meal_plan_id = ? AND food_id = ? AND day_of_week = ?`,
          [targetMealId, food.food_id, food.day_of_week]
        );
        
        if (existing.length > 0) {
          // ถ้ามีแล้ว ให้อัพเดตจำนวน
          await db.query(
            `UPDATE meal_food SET serving_quantity = serving_quantity + ? WHERE meal_food_id = ?`,
            [food.serving_quantity, existing[0].meal_food_id]
          );
        } else {
          // ถ้ายังไม่มี ให้เพิ่มใหม่
          await db.query(
            `INSERT INTO meal_food 
             (meal_plan_id, food_id, serving_quantity, day_of_week, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              targetMealId,
              food.food_id,
              food.serving_quantity,
              food.day_of_week,
              food.notes
            ]
          );
        }
      }
      
      // Commit transaction หากทุกอย่างสำเร็จ
      await db.query('COMMIT');
      
      // Revalidate paths
      revalidatePath(`/trainer/nutrition/${targetPlanId}`);
      revalidatePath(`/trainer/meals/${targetMealId}`);
      
      return { 
        success: true, 
        message: `คัดลอกอาหาร ${sourceFoods.length} รายการสำเร็จ`,
        copied: sourceFoods.length 
      };
    } catch (error) {
      // Rollback หากเกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error copying foods between meals:', error);
    return { success: false, message: error.message };
  }
}
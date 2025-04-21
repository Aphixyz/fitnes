'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * ดึงข้อมูลมื้ออาหารทั้งหมดในแผนโภชนาการ
 */
export async function getMealsByNutritionPlan(nutritionPlanId) {
  try {
    if (!nutritionPlanId) {
      return { success: false, message: 'กรุณาระบุรหัสแผนโภชนาการ' };
    }

    const [meals] = await db.query(
      `SELECT mp.*,
              COUNT(mf.meal_food_id) as food_count,
              SUM(f.calories * mf.serving_quantity) as total_calories,
              SUM(f.protein * mf.serving_quantity) as total_protein,
              SUM(f.carbs * mf.serving_quantity) as total_carbs,
              SUM(f.fat * mf.serving_quantity) as total_fat
       FROM meal_plan mp
       LEFT JOIN meal_food mf ON mp.meal_plan_id = mf.meal_plan_id
       LEFT JOIN food f ON mf.food_id = f.food_id
       WHERE mp.nutrition_plan_id = ?
       GROUP BY mp.meal_plan_id
       ORDER BY 
         CASE 
           WHEN mp.meal_name = 'breakfast' THEN 1
           WHEN mp.meal_name = 'lunch' THEN 2 
           WHEN mp.meal_name = 'dinner' THEN 3
           ELSE 4
         END,
         mp.meal_time`,
      [nutritionPlanId]
    );

    return { success: true, meals };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ดึงข้อมูลมื้ออาหารตาม ID
 */
export async function getMealById(mealId) {
  try {
    if (!mealId) {
      return { success: false, message: 'กรุณาระบุรหัสมื้ออาหาร' };
    }

    const [meals] = await db.query(
      `SELECT mp.*,
              np.plan_name,
              np.trainer_id,
              np.member_id 
       FROM meal_plan mp
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mp.meal_plan_id = ?`,
      [mealId]
    );

    if (meals.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลมื้ออาหาร' };
    }

    return { success: true, meal: meals[0] };
  } catch (error) {
    console.error('Error fetching meal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * เพิ่มมื้ออาหารใหม่ในแผนโภชนาการ
 */
export async function createMeal(data) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.nutrition_plan_id || !data.meal_name) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // ตรวจสอบว่าแผนโภชนาการนี้มีอยู่จริง
    const [plans] = await db.query(
      'SELECT nutrition_plan_id, trainer_id, member_id FROM nutrition_plan WHERE nutrition_plan_id = ?',
      [data.nutrition_plan_id]
    );

    if (plans.length === 0) {
      return { success: false, message: 'ไม่พบแผนโภชนาการ' };
    }

    // สร้างมื้ออาหารใหม่
    const [result] = await db.query(
      `INSERT INTO meal_plan (
        nutrition_plan_id, meal_name, meal_time, calories_target, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        data.nutrition_plan_id,
        data.meal_name,
        data.meal_time || null,
        data.calories_target || null,
        data.notes || null
      ]
    );

    // Revalidate paths
    revalidatePath(`/trainer/nutrition/${data.nutrition_plan_id}`);
    
    return { 
      success: true, 
      message: 'เพิ่มมื้ออาหารสำเร็จ',
      meal_id: result.insertId 
    };
  } catch (error) {
    console.error('Error creating meal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * อัพเดตข้อมูลมื้ออาหาร
 */
export async function updateMeal(mealId, data, trainerId) {
  try {
    if (!mealId || !data || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่ามื้ออาหารนี้มีอยู่จริงและเทรนเนอร์มีสิทธิ์แก้ไข
    const [meals] = await db.query(
      `SELECT mp.meal_plan_id, mp.nutrition_plan_id 
       FROM meal_plan mp
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mp.meal_plan_id = ? AND np.trainer_id = ?`,
      [mealId, trainerId]
    );

    if (meals.length === 0) {
      return { success: false, message: 'ไม่พบมื้ออาหารหรือไม่มีสิทธิ์แก้ไข' };
    }

    const nutritionPlanId = meals[0].nutrition_plan_id;

    // ค้นหาโพรเพอร์ตี้ที่จะอัพเดตและสร้าง SQL
    const updateProperties = Object.entries(data)
      .filter(([key]) => {
        // กรองฟิลด์ที่ไม่อนุญาตให้แก้ไข
        return !['meal_plan_id', 'nutrition_plan_id'].includes(key);
      })
      .map(([key]) => `${key} = ?`);
    
    if (updateProperties.length === 0) {
      return { success: false, message: 'ไม่มีข้อมูลที่ต้องการแก้ไข' };
    }

    const updateValues = Object.entries(data)
      .filter(([key]) => !['meal_plan_id', 'nutrition_plan_id'].includes(key))
      .map(([_, value]) => value);
      
    // เพิ่มค่า mealId สำหรับ WHERE
    updateValues.push(mealId);
    
    await db.query(
      `UPDATE meal_plan SET ${updateProperties.join(', ')} WHERE meal_plan_id = ?`,
      updateValues
    );

    // Revalidate paths
    revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
    revalidatePath(`/trainer/meals/${mealId}`);

    return { success: true, message: 'อัพเดตมื้ออาหารสำเร็จ' };
  } catch (error) {
    console.error('Error updating meal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ลบมื้ออาหาร
 */
export async function deleteMeal(mealId, trainerId) {
  try {
    if (!mealId || !trainerId) {
      return { success: false, message: 'กรุณาระบุข้อมูลให้ครบถ้วน' };
    }

    // ตรวจสอบว่ามื้ออาหารนี้มีอยู่จริงและเทรนเนอร์มีสิทธิ์ลบ
    const [meals] = await db.query(
      `SELECT mp.meal_plan_id, mp.nutrition_plan_id 
       FROM meal_plan mp
       JOIN nutrition_plan np ON mp.nutrition_plan_id = np.nutrition_plan_id
       WHERE mp.meal_plan_id = ? AND np.trainer_id = ?`,
      [mealId, trainerId]
    );

    if (meals.length === 0) {
      return { success: false, message: 'ไม่พบมื้ออาหารหรือไม่มีสิทธิ์ลบ' };
    }

    const nutritionPlanId = meals[0].nutrition_plan_id;

    // เริ่ม transaction เพื่อลบข้อมูลที่เกี่ยวข้องทั้งหมด
    await db.query('START TRANSACTION');
    
    try {
      // ลบอาหารในมื้อก่อน (แม้ว่า foreign key จะมี CASCADE ก็ตาม)
      await db.query('DELETE FROM meal_food WHERE meal_plan_id = ?', [mealId]);
      
      // ลบมื้ออาหาร
      await db.query('DELETE FROM meal_plan WHERE meal_plan_id = ?', [mealId]);
      
      // Commit transaction หากทุกอย่างสำเร็จ
      await db.query('COMMIT');
      
      // Revalidate paths
      revalidatePath(`/trainer/nutrition/${nutritionPlanId}`);
      
      return { success: true, message: 'ลบมื้ออาหารสำเร็จ' };
    } catch (error) {
      // Rollback หากเกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    return { success: false, message: error.message };
  }
}

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
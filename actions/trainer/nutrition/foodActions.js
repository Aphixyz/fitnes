'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Add a new food entry
 */
export async function addFood(data) {
  try {
    const result = await db.query(
      `INSERT INTO food 
      (trainer_id, food_name, food_category, serving_size, calories, 
       protein, carbs, fat, fiber, sugar, sodium) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.trainer_id,
        data.food_name,
        data.food_category,
        data.serving_size,
        data.calories,
        data.protein,
        data.carbs,
        data.fat,
        data.fiber,
        data.sugar,
        data.sodium
      ]
    )
    
    revalidatePath('/trainer/nutrition')
    return { success: true, food_id: result.insertId }
  } catch (error) {
    console.error('Error adding food:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update an existing food entry
 */
export async function updateFood(food_id, data) {
  try {
    await db.query(
      `UPDATE food SET 
        food_name = ?, 
        food_category = ?, 
        serving_size = ?, 
        calories = ?, 
        protein = ?, 
        carbs = ?, 
        fat = ?, 
        fiber = ?, 
        sugar = ?, 
        sodium = ?
       WHERE food_id = ? AND trainer_id = ?`,
      [
        data.food_name,
        data.food_category,
        data.serving_size,
        data.calories,
        data.protein,
        data.carbs,
        data.fat,
        data.fiber,
        data.sugar,
        data.sodium,
        food_id,
        data.trainer_id
      ]
    )
    
    revalidatePath('/trainer/nutrition')
    return { success: true }
  } catch (error) {
    console.error('Error updating food:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a food entry
 */
export async function deleteFood(food_id, trainer_id) {
  try {
    await db.query(
      'DELETE FROM food WHERE food_id = ? AND trainer_id = ?',
      [food_id, trainer_id]
    )
    
    revalidatePath('/trainer/nutrition')
    return { success: true }
  } catch (error) {
    console.error('Error deleting food:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get food by ID
 */
export async function getFoodById(food_id) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM food WHERE food_id = ?',
      [food_id]
    )
    
    if (rows.length === 0) {
      return { success: false, error: 'Food not found' }
    }
    
    return { success: true, food: rows[0] }
  } catch (error) {
    console.error('Error getting food:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all foods created by a specific trainer
 */
export async function getFoodsByTrainer(trainer_id) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM food WHERE trainer_id = ? ORDER BY food_name',
      [trainer_id]
    )
    
    return { success: true, foods: rows }
  } catch (error) {
    console.error('Error getting trainer foods:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Search for foods based on name and category
 */
export async function searchFoods(searchTerm, trainer_id = null) {
  try {
    let query = `
      SELECT * FROM food 
      WHERE food_name LIKE ? OR food_category LIKE ?
    `
    let params = [`%${searchTerm}%`, `%${searchTerm}%`]
    
    if (trainer_id) {
      query += ` AND (trainer_id = ? OR trainer_id IS NULL)`
      params.push(trainer_id)
    }
    
    query += ` ORDER BY food_name`
    
    const [rows] = await db.query(query, params)
    
    return { success: true, foods: rows }
  } catch (error) {
    console.error('Error searching foods:', error)
    return { success: false, error: error.message }
  }
}
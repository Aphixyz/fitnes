"use server"

import pool from '@/lib/db'

export async function addPackage(formData) {
  const trainerId = formData.get('trainer_id')
  const name = formData.get('name')
  const durationInMonths = formData.get('duration_in_months')
  const price = formData.get('price')
  const description = formData.get('description')

  if (!trainerId || !name || !durationInMonths || !price) {
    return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
  }

  try {
    await pool.execute(
      `INSERT INTO packages (trainer_id, packages_name, packages_duration_months, packages_price, packages_description)
       VALUES (?, ?, ?, ?, ?)`,
      [trainerId, name, durationInMonths, price, description || null]
    )

    return { success: true, message: 'เพิ่มแพ็คเกจเรียบร้อยแล้ว' }
  } catch (error) {
    console.error('DB error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก' }
  }
}
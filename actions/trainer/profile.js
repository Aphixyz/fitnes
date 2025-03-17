// actions/trainer/profile.js
'use server'

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

export async function updateTrainerProfile(prevState, formData) {
  try {
    const trainerId = formData.get('trainer_id');
    const firstName = formData.get('trainer_firstname');
    const lastName = formData.get('trainer_lastname');
    const email = formData.get('trainer_email');
    const phone = formData.get('trainer_phone') || null;
    const exp = formData.get('trainer_exp') || null;
    const status = formData.get('trainer_status') || 'active';
    const bio = formData.get('trainer_bio') || null;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !firstName || !lastName || !email) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น'
      };
    }
    
    // อัพเดทข้อมูลในฐานข้อมูล
    await query(
      `UPDATE trainer 
       SET trainer_firstname = ?, trainer_lastname = ?, trainer_email = ?, 
           trainer_phone = ?, trainer_bio = ?, trainer_exp = ?, trainer_status = ?
       WHERE trainer_id = ?`,
      [firstName, lastName, email, phone, bio, exp, status, trainerId]
    );
    
    // Revalidate หน้าเว็บที่เกี่ยวข้อง
    revalidatePath(`/trainer/${trainerId}/profile`);
    
    return {
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ'
    };
  } catch (error) {
    console.error('Error updating trainer profile:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล: ' + error.message
    };
  }
}
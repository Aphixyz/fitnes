// actions/member/profile.js
'use server'

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';

export async function updateMemberProfile(formData) {
  try {
    // รับค่าจาก formData
    const memberId = formData.get('member_id');
    const firstName = formData.get('first_name');
    const lastName = formData.get('last_name');
    const email = formData.get('email');
    const phone = formData.get('phone') || null;
    const dateOfBirth = formData.get('date_of_birth') || null;
    const gender = formData.get('gender') || null;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberId || !firstName || !lastName || !email) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น'
      };
    }
    
    // อัพเดทข้อมูลในฐานข้อมูล
    await pool.query(
      `UPDATE member 
       SET first_name = ?, last_name = ?, email = ?, phone = ?,
           date_of_birth = ?, gender = ?
       WHERE member_id = ?`,
      [firstName, lastName, email, phone, dateOfBirth, gender, memberId]
    );
    
    // Revalidate หน้าเว็บที่เกี่ยวข้อง
    revalidatePath(`/member/${memberId}/profile`);
    revalidatePath(`/member/dashboard`);
    
    return {
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ'
    };
  } catch (error) {
    console.error('Error updating member profile:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล'
    };
  }
}
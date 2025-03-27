'use server';

import db from '@/lib/db';
import crypto from 'crypto';

/**
 * สร้างลิงก์ลงทะเบียนสำหรับเทรนเนอร์
 * @param {Object} data - ข้อมูลสำหรับการสร้างลิงก์
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ข้อมูลลิงก์ที่สร้างขึ้น
 */
export async function generateRegistrationLink({ trainerId }) {
  try {
    if (!trainerId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์');
    }

    // ตรวจสอบว่าเทรนเนอร์มีอยู่จริงหรือไม่
    const [trainerResult] = await db.query(
      'SELECT trainer_id, trainer_firstname, trainer_lastname, trainer_status FROM trainer WHERE trainer_id = ?',
      [trainerId]
    );

    if (!trainerResult || trainerResult.length === 0) {
      throw new Error('ไม่พบข้อมูลเทรนเนอร์');
    }

    const trainer = trainerResult[0];

    // ตรวจสอบสถานะของเทรนเนอร์
    if (trainer.trainer_status !== 'active') {
      throw new Error('เทรนเนอร์ไม่อยู่ในสถานะที่สามารถสร้างลิงก์ลงทะเบียนได้');
    }

    // สร้างโทเค็นแบบสุ่ม
    const token = crypto.randomBytes(32).toString('hex');
    
    // สร้าง URL สำหรับการลงทะเบียน (ในเวอร์ชันนี้เราไม่เก็บโทเค็นในฐานข้อมูล)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const registrationUrl = `${baseUrl}/register?trainer=${trainerId}&token=${token}`;
    
    // กำหนดวันหมดอายุ (1 วัน)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    return {
      success: true,
      url: registrationUrl,
      trainer_id: trainerId,
      trainer_name: `${trainer.trainer_firstname} ${trainer.trainer_lastname}`,
      expires_at: expiryDate,
      message: 'สร้างลิงก์ลงทะเบียนสำเร็จ'
    };
  } catch (error) {
    console.error('Error generating registration link:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างลิงก์ลงทะเบียน'
    };
  }
}

/**
 * ตรวจสอบความถูกต้องของพารามิเตอร์ในลิงก์ลงทะเบียน
 * @param {string} token - โทเค็นยืนยัน
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ข้อมูลเทรนเนอร์ที่เกี่ยวข้อง
 */
export async function verifyRegistrationParams(token, trainerId) {
  try {
    if (!token || !trainerId) {
      throw new Error('ข้อมูลไม่ครบถ้วน');
    }

    // ตรวจสอบข้อมูลเทรนเนอร์
    const [trainerResult] = await db.query(
      `SELECT trainer_id, trainer_firstname, trainer_lastname, trainer_email, trainer_phone 
       FROM trainer
       WHERE trainer_id = ? AND trainer_status = 'active'`,
      [trainerId]
    );

    if (!trainerResult || trainerResult.length === 0) {
      throw new Error('ไม่พบข้อมูลเทรนเนอร์หรือเทรนเนอร์ไม่อยู่ในสถานะพร้อมให้บริการ');
    }

    const trainer = trainerResult[0];

    return {
      success: true,
      trainer: {
        id: trainer.trainer_id,
        name: `${trainer.trainer_firstname} ${trainer.trainer_lastname}`,
        email: trainer.trainer_email,
        phone: trainer.trainer_phone
      }
    };
  } catch (error) {
    console.error('Error verifying registration parameters:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลลงทะเบียน'
    };
  }
}
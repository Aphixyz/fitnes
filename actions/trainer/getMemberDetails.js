'use server';

import db from '@/lib/db';

/**
 * ดึงข้อมูลพื้นฐานของสมาชิกสำหรับเทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลสมาชิก
 */
export async function getMemberDetails(trainerId, memberId) {
  try {
    if (!trainerId || !memberId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์และรหัสสมาชิก');
    }

    // ตรวจสอบว่าสมาชิกอยู่ภายใต้การดูแลของเทรนเนอร์นี้หรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id FROM registration 
       WHERE trainer_id = ? AND member_id = ?`,
      [trainerId, memberId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error('ไม่พบข้อมูลการลงทะเบียนของสมาชิกภายใต้เทรนเนอร์นี้');
    }

    // ดึงข้อมูลสมาชิกและข้อมูลการลงทะเบียน
    const [memberData] = await db.query(
      `SELECT m.*, r.registration_id, r.registration_status, 
              r.registration_startdate, r.registration_enddate 
       FROM member m
       JOIN registration r ON m.member_id = r.member_id
       WHERE r.trainer_id = ? AND m.member_id = ?
       ORDER BY r.registration_id DESC
       LIMIT 1`,
      [trainerId, memberId]
    );

    if (!memberData || memberData.length === 0) {
      throw new Error('ไม่พบข้อมูลสมาชิก');
    }

    // ตรวจสอบสถานะการลงทะเบียน (หมดอายุหรือไม่)
    const member = memberData[0];
    if (member.registration_status === 1 && 
        member.registration_enddate && 
        new Date(member.registration_enddate) < new Date()) {
      member.is_expired = true;
    } else {
      member.is_expired = false;
    }

    return {
      success: true,
      member: member
    };
  } catch (error) {
    console.error('Error fetching member details:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก'
    };
  }
}

/**
 * ตรวจสอบว่าเทรนเนอร์มีสิทธิ์ในการเข้าถึงข้อมูลสมาชิกหรือไม่
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number} memberId - รหัสสมาชิก 
 * @returns {Promise<boolean>} - ผลการตรวจสอบสิทธิ์
 */
export async function checkMemberAccess(trainerId, memberId) {
  try {
    if (!trainerId || !memberId) {
      return false;
    }

    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM registration 
       WHERE trainer_id = ? AND member_id = ?`,
      [trainerId, memberId]
    );

    return result[0].count > 0;
  } catch (error) {
    console.error('Error checking member access:', error);
    return false;
  }
}



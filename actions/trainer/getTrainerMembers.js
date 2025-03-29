'use server';

import db from '@/lib/db';

/**
 * ดึงข้อมูลสมาชิกที่อยู่ภายใต้เทรนเนอร์
 * @param {Object} params - พารามิเตอร์
 * @param {number} params.trainerId - รหัสเทรนเนอร์
 * @param {number} params.page - หน้าปัจจุบัน (เริ่มที่ 1)
 * @param {number} params.pageSize - จำนวนรายการต่อหน้า
 * @param {string} params.searchTerm - คำค้นหา
 * @param {string} params.status - สถานะการลงทะเบียน (active, pending, expired, rejected)
 * @returns {Promise<Object>} - ข้อมูลสมาชิก
 */
export async function getTrainerMembers({ trainerId, page = 1, pageSize = 10, searchTerm = '', status = 'all' }) {
  try {
    if (!trainerId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์');
    }

    // สร้าง query พื้นฐาน
    let query = `
      SELECT 
        m.member_id, 
        m.member_firstname, 
        m.member_lastname, 
        m.member_email, 
        m.member_phone, 
        m.member_gender,
        m.member_dob,
        m.member_profileimage,
        m.member_status,
        r.registration_id,
        r.registration_status,
        r.registration_startdate,
        r.registration_enddate
      FROM member m
      JOIN registration r ON m.member_id = r.member_id
      WHERE r.trainer_id = ?
    `;

    // พารามิเตอร์สำหรับ query
    const queryParams = [trainerId];

    // เพิ่มเงื่อนไขค้นหา
    if (searchTerm) {
      query += ` AND (
        m.member_firstname LIKE ? OR 
        m.member_lastname LIKE ? OR 
        m.member_email LIKE ? OR 
        m.member_phone LIKE ?
      )`;
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // เพิ่มเงื่อนไขสถานะ
    if (status !== 'all') {
      if (status === 'active') {
        query += ` AND r.registration_status = 1 AND (r.registration_enddate > NOW() OR r.registration_enddate IS NULL)`;
      } else if (status === 'pending') {
        query += ` AND r.registration_status = 0`;
      } else if (status === 'expired') {
        query += ` AND (r.registration_status = 2 OR (r.registration_status = 1 AND r.registration_enddate < NOW()))`;
      } else if (status === 'rejected') {
        query += ` AND r.registration_status = 3`;
      }
    }

    // Query สำหรับนับจำนวนทั้งหมด
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countResult] = await db.query(countQuery, queryParams);
    const totalItems = countResult[0].total;

    // เพิ่ม ORDER BY และ LIMIT สำหรับ pagination
    query += ` ORDER BY 
      CASE 
        WHEN r.registration_status = 0 THEN 1 /* pending ขึ้นก่อน */
        WHEN r.registration_status = 1 THEN 2 /* active */
        ELSE 3
      END, 
      m.member_firstname, m.member_lastname`;
    query += ` LIMIT ? OFFSET ?`;
    
    const offset = (page - 1) * pageSize;
    queryParams.push(pageSize, offset);

    // ดึงข้อมูล
    const [members] = await db.query(query, queryParams);

    // แปลงสถานะการลงทะเบียนเป็นข้อความ
    const statusMapping = {
      0: 'pending',
      1: 'active',
      2: 'expired',
      3: 'rejected'
    };

    // แปลงข้อมูลที่ได้
    const formattedMembers = members.map(member => {
      // ตรวจสอบหากเป็น active แต่วันหมดอายุแล้ว
      let registrationStatus = statusMapping[member.registration_status] || 'unknown';
      if (registrationStatus === 'active' && 
          member.registration_enddate && 
          new Date(member.registration_enddate) < new Date()) {
        registrationStatus = 'expired';
      }

      return {
        ...member,
        registration_status_text: registrationStatus,
        full_name: `${member.member_firstname} ${member.member_lastname}`,
      };
    });

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      success: true,
      members: formattedMembers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage,
        hasPreviousPage
      }
    };
  } catch (error) {
    console.error('Error fetching trainer members:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก'
    };
  }
}

/**
 * ดึงสรุปจำนวนสมาชิกแยกตามสถานะ
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - สรุปจำนวนสมาชิก
 */
export async function getMemberSummaryByStatus(trainerId) {
  try {
    if (!trainerId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์');
    }

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN r.registration_status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE 
            WHEN r.registration_status = 1 AND (r.registration_enddate > NOW() OR r.registration_enddate IS NULL)
            THEN 1 ELSE 0 END) as active,
        SUM(CASE 
            WHEN r.registration_status = 2 OR (r.registration_status = 1 AND r.registration_enddate < NOW())
            THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN r.registration_status = 3 THEN 1 ELSE 0 END) as rejected
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      WHERE r.trainer_id = ?
    `;

    const [result] = await db.query(query, [trainerId]);

    return {
      success: true,
      summary: result[0]
    };
  } catch (error) {
    console.error('Error fetching member summary:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุปสมาชิก'
    };
  }
}
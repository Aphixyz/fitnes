"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลสมาชิกที่ได้รับการยืนยัน พร้อมชื่อเทรนเนอร์
 */
export async function getMemberWithTrainer() {
  try {
    const [results] = await db.query(`
      SELECT 
        m.member_id,
        m.member_username,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_status,
        t.trainer_id,
        t.trainer_firstname,
        t.trainer_lastname,
        t.trainer_status
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
      WHERE r.registration_status IN (1, 2, 3)
      ORDER BY m.member_id
    `);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error fetching member with trainer:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}


export async function getMemberWithTrainerPaginated(page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize;

    // 1. Query ข้อมูลแบบแบ่งหน้า
    const [members] = await db.query(`
      SELECT 
        m.member_id,
        m.member_username,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_status,
        t.trainer_id,
        t.trainer_firstname,
        t.trainer_lastname,
        t.trainer_status
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
      WHERE r.registration_status IN (1, 2, 3)
      ORDER BY m.member_id
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    // 2. Query หาจำนวนรวมทั้งหมด (ใช้สำหรับคำนวณจำนวนหน้า)
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      WHERE r.registration_status IN (1, 2, 3)
    `);

    return {
      success: true,
      data: members,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Error in getMemberWithTrainerPaginated:", error);
    return {
      success: false,
      message: "ไม่สามารถโหลดข้อมูลสมาชิกแบบแบ่งหน้าได้",
    };
  }
}

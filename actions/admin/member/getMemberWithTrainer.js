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
      JOIN trainer t ON r.trainer_id = t.trainer_id
      WHERE r.registration_status = 1
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

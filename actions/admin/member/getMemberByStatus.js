'use server';

import pool from '@/lib/db'; // ใช้ mysql2

export async function getMemberByStatus(status) {
  try {
    let query = "SELECT * FROM member";
    let values = [];

    if (status) {
      query += " WHERE member_status = ?";
      values.push(status);
    }

    const [rows] = await pool.query(query, values);

    // ส่งผลลัพธ์ที่มีโครงสร้าง { success, data }
    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error("Error fetching member by status:", error);

    // ส่งผลลัพธ์เมื่อเกิดข้อผิดพลาด
    return {
      success: false,
      error: "ไม่สามารถโหลดข้อมูลสมาชิกตามสถานะได้",
    };
  }
}

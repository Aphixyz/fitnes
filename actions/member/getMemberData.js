"use server";

import { pool } from "@/lib/db";

export async function getMemberById(id) {
  try {
    if (!id) {
      throw new Error("กรุณาระบุ ID ของสมาชิก");
    }

    // ทำการ query ข้อมูลจากฐานข้อมูล
    const [rows] = await pool.query(
      `SELECT 
        member_id,
        member_username,
        member_firstname,
        member_lastname,
        member_email,
        member_phone,
        member_gender,
        member_dob
      FROM member
      WHERE member_id = ?`,
      [id]
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (rows.length === 0) {
      return null;
    }

    // แปลงข้อมูลให้เป็นรูปแบบที่ใช้งานง่าย
    const member = {
      id: rows[0].member_id,
      username: rows[0].member_username,
      firstName: rows[0].member_firstname,
      lastName: rows[0].member_lastname,
      email: rows[0].member_email,
      phone: rows[0].member_phone,
      gender: rows[0].member_gender,
      dateOfBirth: rows[0].member_dob,
    };

    return member;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสมาชิกได้");
  }
}

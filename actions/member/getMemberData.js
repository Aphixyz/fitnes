"use server";

import pool from "@/lib/db";

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

/**
 * ตรวจสอบสิทธิ์การเข้าใช้งานของสมาชิก (Date-Based Logic)
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลสิทธิ์การเข้าใช้งาน
 */
export async function checkMemberAccess(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const [result] = await pool.query(
      `SELECT 
        r.registration_id,
        r.trainer_id,
        r.packages_id,
        r.registration_startdate,
        r.registration_enddate,
        p.packages_name,
        t.trainer_firstname,
        t.trainer_lastname,
        CASE 
          WHEN r.registration_enddate >= CURDATE() THEN 1
          ELSE 0
        END as has_access,
        DATEDIFF(r.registration_enddate, CURDATE()) as days_remaining
       FROM registration r
       LEFT JOIN packages p ON r.packages_id = p.packages_id
       LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
       WHERE r.member_id = ? 
       ORDER BY r.registration_enddate DESC
       LIMIT 1`,
      [memberId]
    );

    if (!result || result.length === 0) {
      return {
        success: false,
        has_access: false,
        message: "ไม่พบข้อมูลการลงทะเบียน",
      };
    }

    const data = result[0];

    return {
      success: true,
      has_access: Boolean(data.has_access),
      registration_info: {
        registration_id: data.registration_id,
        trainer_id: data.trainer_id,
        trainer_name:
          data.trainer_firstname && data.trainer_lastname
            ? `${data.trainer_firstname} ${data.trainer_lastname}`
            : null,
        package_id: data.packages_id,
        package_name: data.packages_name,
        start_date: data.registration_startdate,
        end_date: data.registration_enddate,
        days_remaining: data.days_remaining,
      },
      message: data.has_access ? "มีสิทธิ์เข้าใช้งาน" : "หมดอายุการใช้งานแล้ว",
    };
  } catch (error) {
    console.error("Error checking member access:", error);
    return {
      success: false,
      has_access: false,
      message: error.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
    };
  }
}

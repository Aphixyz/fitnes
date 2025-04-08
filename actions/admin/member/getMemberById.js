"use server";

import pool from "@/lib/db";

export async function getMemberById(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    const [memberRows] = await pool.query(
      `SELECT 
            member_id,
            member_username,
            member_firstname,
            member_lastname,
            member_email,
            member_phone,
            member_gender,
            member_dob,
            member_profileimage,
            member_status
         FROM member
         WHERE member_id = ?`,
      [memberId]
    );

    if (memberRows.length === 0) {
      return null;
    }

    const member = {
      id: memberRows[0].member_id,
      username: memberRows[0].member_username,
      firstname: memberRows[0].member_firstname,
      lastname: memberRows[0].member_lastname,
      email: memberRows[0].member_email,
      phone: memberRows[0].member_phone,
      gender: memberRows[0].member_gender,
      dob: memberRows[0].member_dob,
      profileimage: memberRows[0].member_profileimage,
      status: memberRows[0].member_status,
      trainers: [],
    };

    // ดึงรายชื่อเทรนเนอร์ที่ดูแลสมาชิกนี้
    const [trainerRows] = await pool.query(
      `SELECT 
            t.trainer_id as id,
            t.trainer_firstname as firstname,
            t.trainer_lastname as lastname,
            t.trainer_email as email
         FROM registration r
         JOIN trainer t ON r.trainer_id = t.trainer_id
         WHERE r.member_id = ? AND r.registration_status = 1`,
      [memberId]
    );

    member.trainers = trainerRows;

    return member;
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสมาชิกได้: " + error.message);
  }
}

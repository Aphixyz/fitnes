"use server";

import pool from "@/lib/db";

export async function getTrainerById(id) {
  try {
    if (!id) {
      throw new Error("กรุณาระบุ ID ของผู้ฝึกสอน");
    }

    // ทำการ query ข้อมูลจากฐานข้อมูล - ไม่ดึงข้อมูล password เพื่อความปลอดภัย
    const [rows] = await pool.query(
      `
      SELECT 
        trainer_id,
        trainer_username,
        trainer_firstname,
        trainer_lastname,
        trainer_email,
        trainer_password,
        trainer_nickname,
        trainer_phone,
        trainer_dob,
        trainer_gender,
        trainer_exp,
        trainer_profile_image,
        trainer_bio,
        trainer_specialization,
        trainer_certification,
        trainer_startdate,
        trainer_enddate,
        trainer_status
      FROM trainer
      WHERE trainer_id = ?
      `,
      [id]
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (rows.length === 0) {
      return null;
    }

    // ฟังก์ชันแปลงวันที่เป็นรูปแบบ YYYY-MM-DD สำหรับ input type="date"
    const formatDateForInput = (date) => {
      if (!date) return "";

      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";

        // แปลงเป็น YYYY-MM-DD format
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    // แปลงข้อมูลให้เป็นรูปแบบที่ใช้งานได้
    const trainer = {
      trainer_id: rows[0].trainer_id,
      trainer_username: rows[0].trainer_username,
      trainer_firstname: rows[0].trainer_firstname,
      trainer_lastname: rows[0].trainer_lastname,
      trainer_password: rows[0].trainer_password,
      trainer_email: rows[0].trainer_email,
      trainer_nickname: rows[0].trainer_nickname,
      trainer_phone: rows[0].trainer_phone,
      trainer_dob: formatDateForInput(rows[0].trainer_dob), // แปลงรูปแบบวันที่
      trainer_gender: rows[0].trainer_gender,
      trainer_exp: rows[0].trainer_exp,
      trainer_profile_image: rows[0].trainer_profile_image,
      trainer_bio: rows[0].trainer_bio,
      trainer_specialization: rows[0].trainer_specialization,
      trainer_certification: rows[0].trainer_certification,
      trainer_startdate: formatDateForInput(rows[0].trainer_startdate), // แปลงรูปแบบวันที่
      trainer_enddate: formatDateForInput(rows[0].trainer_enddate), // แปลงรูปแบบวันที่
      trainer_status: rows[0].trainer_status,
    };

    // console.log("Formatted trainer data:", trainer);

    return trainer;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ฝึกสอน:", error);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ฝึกสอนได้");
  }
}

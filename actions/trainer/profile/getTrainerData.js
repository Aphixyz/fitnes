"use server";

import pool from "@/lib/db";
// import { updateTrainer } from "../admin/updateTrainer";

export async function getTrainerById(id) {
  try {
    if (!id) {
      throw new Error("กรุณาระบุ ID ของผู้ฝึกสอน");
    }

    // ทำการ query ข้อมูลจากฐานข้อมูล - ไม่ดึงข้อมูล password เพื่อความปลอดภัย
    const [rows] = await pool.query(
      `SELECT 
        trainer_id,
        trainer_username,
        trainer_firstname,
        trainer_lastname, 
        trainer_email,
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
      WHERE trainer_id = ?`,
      [id]
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (rows.length === 0) {
      return null;
    }

    // ใช้ชื่อตรงกับฐานข้อมูล (snake_case)
    const trainer = {
      trainer_id: rows[0].trainer_id,
      trainer_username: rows[0].trainer_username,
      trainer_firstname: rows[0].trainer_firstname,
      trainer_lastname: rows[0].trainer_lastname,
      trainer_email: rows[0].trainer_email,
      trainer_nickname: rows[0].trainer_nickname,
      trainer_phone: rows[0].trainer_phone,
      trainer_dob: rows[0].trainer_dob,
      trainer_gender: rows[0].trainer_gender,
      trainer_exp: rows[0].trainer_exp,
      trainer_profile_image: rows[0].trainer_profile_image,
      trainer_bio: rows[0].trainer_bio,
      trainer_specialization: rows[0].trainer_specialization,
      trainer_certification: rows[0].trainer_certification,
      trainer_startdate: rows[0].trainer_startdate,
      trainer_enddate: rows[0].trainer_enddate,
      trainer_status: rows[0].trainer_status,
    };

    return trainer;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ฝึกสอน:", error);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ฝึกสอนได้");
  }
}

export default getTrainerById;

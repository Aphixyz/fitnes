'use server';

import pool from "@/lib/db";
// import { updateTrainer } from "../admin/updateTrainer";

export async function getTrainerById(id) {
  try {
    if (!id) {
      throw new Error('กรุณาระบุ ID ของผู้ฝึกสอน');
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

    // แปลงข้อมูลให้เป็นรูปแบบ camelCase ที่ใช้งานง่าย
    const trainer = {
      id: rows[0].trainer_id,
      username: rows[0].trainer_username,
      firstName: rows[0].trainer_firstname,
      lastName: rows[0].trainer_lastname,
      email: rows[0].trainer_email,
      nickname: rows[0].trainer_nickname,
      phone: rows[0].trainer_phone,
      dateOfBirth: rows[0].trainer_dob,
      gender: rows[0].trainer_gender,
      experience: rows[0].trainer_exp,
      profileImage: rows[0].trainer_profile_image,
      bio: rows[0].trainer_bio,
      specialization: rows[0].trainer_specialization,
      certification: rows[0].trainer_certification,
      startDate: rows[0].trainer_startdate,
      endDate: rows[0].trainer_enddate,
      status: rows[0].trainer_status,
    };

    return trainer;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ฝึกสอน:', error);
    throw new Error('ไม่สามารถดึงข้อมูลผู้ฝึกสอนได้');
  }
}

export default getTrainerById;

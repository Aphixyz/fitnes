"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs"; // ใช้ bcryptjs ถ้ามีปัญหากับ bcrypt
import { saveBase64Image } from "./upload";

export async function updateTrainer(data) {
  try {
    // เช็คว่ามีการส่งข้อมูลรูปภาพหรือไม่ (เป็น base64 string)
    if (data.trainer_profile_image?.startsWith("data:image/")) {
      // แปลง Base64 ไปเป็นไฟล์แล้วเก็บ path ของไฟล์นั้น
      const imagePath = await saveBase64Image(data.trainer_profile_image);
      if (imagePath) {
        data.trainer_profile_image = imagePath; // อัปเดต path ของภาพ
      }
    }

    // หากมีการเปลี่ยนแปลงรหัสผ่าน ให้ทำการเข้ารหัสรหัสผ่านใหม่
    let hashedPassword = data.trainer_password;
    if (data.trainer_password) {
      hashedPassword = await bcrypt.hash(data.trainer_password, 10);
    }

    // ทำการอัปเดตข้อมูลในฐานข้อมูล
    const [result] = await pool.query(
      `UPDATE trainer SET 
                trainer_username = ?,
                trainer_password = ?,
                trainer_firstname = ?,
                trainer_lastname = ?,
                trainer_email = ?,
                trainer_nickname = ?,
                trainer_phone = ?,
                trainer_dob = ?,
                trainer_gender = ?,
                trainer_exp = ?,
                trainer_profile_image = ?,
                trainer_bio = ?,
                trainer_specialization = ?,
                trainer_certification = ?,
                trainer_status = ?
            WHERE trainer_id = ?`,
      [
        data.trainer_username,
        hashedPassword, // ใช้รหัสผ่านที่เข้ารหัสใหม่
        data.trainer_firstname,
        data.trainer_lastname,
        data.trainer_email,
        data.trainer_nickname,
        data.trainer_phone,
        data.trainer_dob,
        data.trainer_gender,
        data.trainer_exp,
        data.trainer_profile_image,
        data.trainer_bio,
        data.trainer_specialization,
        data.trainer_certification,
        data.trainer_status,
        data.trainer_id, // ใช้ id เพื่ออัปเดตข้อมูลของ trainer ที่ตรงกับ id
      ]
    );

    // หากมีการอัปเดตจริง
    if (result.affectedRows > 0) {
      return true; // การอัปเดตสำเร็จ
    } else {
      console.log("No rows updated."); // ถ้าไม่มีข้อมูลที่อัปเดต
      return false;
    }
  } catch (error) {
    // การจัดการข้อผิดพลาด
    console.error("Error updating trainer:", error);
    return false; // หากเกิดข้อผิดพลาด
  }
}

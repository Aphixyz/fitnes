"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs"; // ใช้ bcryptjs ถ้ามีปัญหากับ bcrypt
import { saveBase64Image } from "./upload";

export async function updateTrainer(data) {
  try {
    // Debug: แสดงข้อมูลที่ส่งเข้ามา
    console.log("updateTrainer received data:", data);

    // ตรวจสอบว่ามี trainer_id หรือไม่
    if (!data.trainer_id) {
      console.error("trainer_id is required");
      return false;
    }

    // ดึงข้อมูลปัจจุบันจาก database
    const [currentData] = await pool.query(
      "SELECT * FROM trainer WHERE trainer_id = ?",
      [data.trainer_id]
    );

    if (currentData.length === 0) {
      console.error("Trainer not found");
      return false;
    }

    const currentTrainer = currentData[0];

    // เตรียมข้อมูลสำหรับอัปเดต โดยใช้ข้อมูลปัจจุบันเป็นค่า default
    const updateData = {
      trainer_username:
        data.trainer_username !== undefined &&
        data.trainer_username !== null &&
        data.trainer_username !== ""
          ? data.trainer_username
          : currentTrainer.trainer_username,
      trainer_password: currentTrainer.trainer_password, // ใช้รหัสผ่านเดิม
      trainer_firstname:
        data.trainer_firstname !== undefined &&
        data.trainer_firstname !== null &&
        data.trainer_firstname !== ""
          ? data.trainer_firstname
          : currentTrainer.trainer_firstname,
      trainer_lastname:
        data.trainer_lastname !== undefined &&
        data.trainer_lastname !== null &&
        data.trainer_lastname !== ""
          ? data.trainer_lastname
          : currentTrainer.trainer_lastname,
      trainer_email:
        data.trainer_email !== undefined &&
        data.trainer_email !== null &&
        data.trainer_email !== ""
          ? data.trainer_email
          : currentTrainer.trainer_email,
      trainer_nickname:
        data.trainer_nickname !== undefined
          ? data.trainer_nickname
          : currentTrainer.trainer_nickname,
      trainer_phone:
        data.trainer_phone !== undefined
          ? data.trainer_phone
          : currentTrainer.trainer_phone,
      trainer_dob:
        data.trainer_dob !== undefined
          ? data.trainer_dob
          : currentTrainer.trainer_dob,
      trainer_gender:
        data.trainer_gender !== undefined
          ? data.trainer_gender
          : currentTrainer.trainer_gender,
      trainer_exp:
        data.trainer_exp !== undefined
          ? data.trainer_exp
          : currentTrainer.trainer_exp,
      trainer_profile_image: currentTrainer.trainer_profile_image, // จะอัปเดตด้านล่าง
      trainer_bio:
        data.trainer_bio !== undefined
          ? data.trainer_bio
          : currentTrainer.trainer_bio,
      trainer_specialization:
        data.trainer_specialization !== undefined
          ? data.trainer_specialization
          : currentTrainer.trainer_specialization,
      trainer_certification:
        data.trainer_certification !== undefined
          ? data.trainer_certification
          : currentTrainer.trainer_certification,
      trainer_status:
        data.trainer_status !== undefined &&
        data.trainer_status !== null &&
        data.trainer_status !== ""
          ? data.trainer_status
          : currentTrainer.trainer_status,
    };

    // จัดการรูปภาพ
    if (data.trainer_profile_image !== undefined) {
      if (data.trainer_profile_image === null) {
        // ถ้าส่งมาเป็น null แสดงว่าต้องการลบรูป
        updateData.trainer_profile_image = null;
      } else if (data.trainer_profile_image?.startsWith("data:image/")) {
        // ถ้าเป็น base64 string ให้แปลงเป็นไฟล์
        const imagePath = await saveBase64Image(data.trainer_profile_image);
        if (imagePath) {
          updateData.trainer_profile_image = imagePath;
        }
      } else {
        // ถ้าเป็น path ของไฟล์ปกติ
        updateData.trainer_profile_image = data.trainer_profile_image;
      }
    }

    // จัดการรหัสผ่าน - อัปเดตเฉพาะเมื่อมีการส่งมา
    if (data.trainer_password && data.trainer_password.trim() !== "") {
      updateData.trainer_password = await bcrypt.hash(
        data.trainer_password,
        10
      );
    }

    // Debug: แสดงข้อมูลที่จะอัปเดต
    console.log("Final updateData:", {
      ...updateData,
      trainer_password: updateData.trainer_password
        ? "[HASHED]"
        : "[UNCHANGED]",
    });

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
        updateData.trainer_username,
        updateData.trainer_password,
        updateData.trainer_firstname,
        updateData.trainer_lastname,
        updateData.trainer_email,
        updateData.trainer_nickname,
        updateData.trainer_phone,
        updateData.trainer_dob,
        updateData.trainer_gender,
        updateData.trainer_exp,
        updateData.trainer_profile_image,
        updateData.trainer_bio,
        updateData.trainer_specialization,
        updateData.trainer_certification,
        updateData.trainer_status,
        data.trainer_id,
      ]
    );

    // หากมีการอัปเดตจริง
    if (result.affectedRows > 0) {
      return true;
    } else {
      console.log("No rows updated.");
      return false;
    }
  } catch (error) {
    console.error("Error updating trainer:", error);
    return false;
  }
}

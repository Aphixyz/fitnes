"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function changePassword(data) {
  try {
    const { trainer_id, current_password, new_password } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainer_id || !current_password || !new_password) {
      return {
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      };
    }

    // ตรวจสอบความยาวรหัสผ่านใหม่
    if (new_password.length < 6) {
      return {
        success: false,
        message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
      };
    }

    // ดึงข้อมูลรหัสผ่านปัจจุบันจากฐานข้อมูล
    const [rows] = await pool.query(
      "SELECT trainer_password FROM trainer WHERE trainer_id = ?",
      [trainer_id]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลผู้ฝึกสอน",
      };
    }

    const currentHashedPassword = rows[0].trainer_password;

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      currentHashedPassword
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      };
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ไม่เหมือนรหัสผ่านเก่า
    const isSamePassword = await bcrypt.compare(
      new_password,
      currentHashedPassword
    );

    if (isSamePassword) {
      return {
        success: false,
        message: "รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเก่า",
      };
    }

    // เข้ารหัสรหัสผ่านใหม่
    const newHashedPassword = await bcrypt.hash(new_password, 12);

    // อัพเดตรหัสผ่านในฐานข้อมูล
    const [result] = await pool.query(
      "UPDATE trainer SET trainer_password = ? WHERE trainer_id = ?",
      [newHashedPassword, trainer_id]
    );

    if (result.affectedRows > 0) {
      return {
        success: true,
        message: "เปลี่ยนรหัสผ่านสำเร็จ",
      };
    } else {
      return {
        success: false,
        message: "ไม่สามารถเปลี่ยนรหัสผ่านได้",
      };
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    };
  }
}

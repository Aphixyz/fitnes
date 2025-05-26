"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * สร้างบัญชีสมาชิกใหม่
 * สร้าง member record เท่านั้น โดยไม่มีการเลือกแพ็คเกจ
 *
 * @param {Object} data - ข้อมูลสมาชิกใหม่
 * @param {number} trainerId - รหัสเทรนเนอร์ (สำหรับ reference)
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างบัญชี
 */
export async function registerNewMember(data, trainerId) {
  try {
    if (!data || !trainerId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const requiredFields = [
      "member_username",
      "member_password",
      "member_email",
      "member_firstname",
      "member_lastname",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`กรุณากรอก ${field}`);
      }
    }

    // ตรวจสอบ trainer
    const [trainerCheck] = await db.query(
      "SELECT trainer_id FROM trainer WHERE trainer_id = ? AND trainer_status = 'active'",
      [trainerId]
    );

    if (!trainerCheck || trainerCheck.length === 0) {
      throw new Error(
        "ไม่พบข้อมูลเทรนเนอร์หรือเทรนเนอร์ไม่อยู่ในสถานะพร้อมให้บริการ"
      );
    }

    // ตรวจสอบว่า email หรือ username ซ้ำหรือไม่
    const [existingMember] = await db.query(
      "SELECT member_id FROM member WHERE member_email = ? OR member_username = ?",
      [data.member_email, data.member_username]
    );

    if (existingMember && existingMember.length > 0) {
      throw new Error("อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(data.member_password, 10);

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // สร้าง member record ด้วยสถานะ active
      const [memberResult] = await db.query(
        `INSERT INTO member 
         (member_username, member_password, member_firstname, member_lastname, 
          member_email, member_phone, member_gender, member_dob, member_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          data.member_username,
          hashedPassword,
          data.member_firstname,
          data.member_lastname,
          data.member_email,
          data.member_phone || null,
          data.member_gender || null,
          data.member_dob || null,
        ]
      );

      const memberId = memberResult.insertId;

      await db.query(
        `INSERT INTO registration 
         (member_id, trainer_id, packages_id, registration_status) 
         VALUES (?, ?, NULL, 'active')`,
        [memberId, trainerId]
      );

      await db.query("COMMIT");

      return {
        success: true,
        member_id: memberId,
        trainer_id: trainerId,
        message:
          "สร้างบัญชีสำเร็จ กรุณาทำการ Onboarding เพื่อตั้งค่าเป้าหมายของคุณ",
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating new member:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้างบัญชี",
    };
  }
}

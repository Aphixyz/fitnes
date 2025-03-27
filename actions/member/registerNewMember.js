"use server";

import db from "@/lib/db";
// ลบการ import bcrypt

/**
 * เก็บข้อมูลการลงทะเบียนสมาชิกใหม่เข้าสู่ตาราง registration เท่านั้น
 * ข้อมูลสมาชิกจะถูกบันทึกในตาราง member เมื่อได้รับการยืนยันจาก trainer
 *
 * @param {Object} data - ข้อมูลสมาชิกใหม่
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ผลลัพธ์การลงทะเบียน
 */
export async function registerNewMember(data, trainerId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data || !trainerId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const requiredFields = [
      "member_username",
      "member_password",
      "member_firstname",
      "member_lastname",
      "member_email",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`กรุณากรอก ${field}`);
      }
    }

    // ตรวจสอบข้อมูลเทรนเนอร์
    const [trainerCheck] = await db.query(
      "SELECT trainer_id FROM trainer WHERE trainer_id = ? AND trainer_status = 'active'",
      [trainerId]
    );

    if (!trainerCheck || trainerCheck.length === 0) {
      throw new Error(
        "ไม่พบข้อมูลเทรนเนอร์หรือเทรนเนอร์ไม่อยู่ในสถานะพร้อมให้บริการ"
      );
    }

    // ตรวจสอบว่าอีเมลหรือชื่อผู้ใช้ซ้ำหรือไม่ (เช็คในตาราง pending_registration และ member)
    const [existingMember] = await db.query(
      "SELECT member_id FROM member WHERE member_email = ? OR member_username = ?",
      [data.member_email, data.member_username]
    );

    if (existingMember && existingMember.length > 0) {
      throw new Error("อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
    }

    // แปลงข้อมูลเป็น JSON string เพื่อเก็บในตาราง registration
    const memberDataJson = JSON.stringify(data); // เก็บรหัสผ่านเป็น plaintext

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // บันทึกข้อมูลลงในตาราง registration
      // registration_status = 0 (รอการยืนยัน)
      const [registrationResult] = await db.query(
        `INSERT INTO registration 
         (trainer_id, registration_status, member_data) 
         VALUES (?, 0, ?)`,
        [trainerId, memberDataJson]
      );

      if (!registrationResult || !registrationResult.insertId) {
        throw new Error("ไม่สามารถลงทะเบียนได้");
      }

      // Commit transaction
      await db.query("COMMIT");

      return {
        success: true,
        registration_id: registrationResult.insertId,
        message: "ลงทะเบียนสำเร็จ กรุณารอการยืนยันจากเทรนเนอร์",
      };
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error registering new member:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลงทะเบียน",
    };
  }
}

/**
 * ตรวจสอบสถานะการลงทะเบียนของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @returns {Promise<Object>} - ข้อมูลสถานะการลงทะเบียน
 */
export async function checkRegistrationStatus(memberId) {
  try {
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ดึงข้อมูลการลงทะเบียนล่าสุดของสมาชิก
    const [registrationResult] = await db.query(
      `SELECT r.*, t.trainer_firstname, t.trainer_lastname 
       FROM registration r
       INNER JOIN trainer t ON r.trainer_id = t.trainer_id
       WHERE r.member_id = ?
       ORDER BY r.registration_id DESC
       LIMIT 1`,
      [memberId]
    );

    if (!registrationResult || registrationResult.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลการลงทะเบียน",
      };
    }

    const registration = registrationResult[0];

    // แปลงสถานะการลงทะเบียนจากตัวเลขเป็นข้อความ
    let statusText = "ไม่ทราบสถานะ";
    switch (registration.registration_status) {
      case 0:
        statusText = "รอการยืนยัน";
        break;
      case 1:
        statusText = "ยืนยันแล้ว";
        break;
      case 2:
        statusText = "หมดอายุ";
        break;
      case 3:
        statusText = "ปฏิเสธ";
        break;
    }

    return {
      success: true,
      registration: {
        ...registration,
        trainer_name: `${registration.trainer_firstname} ${registration.trainer_lastname}`,
        status_text: statusText,
      },
    };
  } catch (error) {
    console.error("Error checking registration status:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะการลงทะเบียน",
    };
  }
}

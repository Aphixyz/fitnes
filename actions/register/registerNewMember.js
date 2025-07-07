"use server";

import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { verifyRegistrationToken } from "@/actions/register/verifyRegistrationToken";

/**
 * สร้าง Member และ Registration ใหม่จาก JWT Token
 * @param {Object} memberData - ข้อมูลสมาชิก
 * @param {string} token - JWT token จากลิงก์ลงทะเบียน
 * @returns {Promise<Object>} - ผลลัพธ์การลงทะเบียน
 */
export async function createMemberAndRegistration(memberData, token) {
  const connection = await pool.getConnection();

  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberData || !token) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบและ decode JWT token
    const tokenVerification = await verifyRegistrationToken(token);

    if (!tokenVerification.success) {
      throw new Error(tokenVerification.message);
    }

    const { trainer, package: packageInfo, token_data } = tokenVerification;
    const { trainer_id, package_id } = token_data;

    // เริ่ม transaction
    await connection.query("START TRANSACTION");

    // 1. เช็คว่า username หรือ email ซ้ำหรือไม่
    const [existingMember] = await connection.query(
      "SELECT member_id FROM member WHERE member_username = ? OR member_email = ?",
      [memberData.member_username, memberData.member_email]
    );

    if (existingMember.length > 0) {
      throw new Error("ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว");
    }

    // 2. สร้าง member record
    const hashedPassword = await bcrypt.hash(memberData.member_password, 10);

    const [memberResult] = await connection.query(
      `INSERT INTO member (
        member_username, member_password, member_firstname, member_lastname, 
        member_email, member_phone, member_gender, member_dob
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memberData.member_username,
        hashedPassword,
        memberData.member_firstname,
        memberData.member_lastname,
        memberData.member_email,
        memberData.member_phone || null,
        memberData.member_gender || null,
        memberData.member_dob || null,
      ]
    );

    const memberId = memberResult.insertId;

    // 3. คำนวณวันเริ่มต้นและสิ้นสุดอัตโนมัติ
    const startDate = new Date(); // วันนี้
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + packageInfo.duration_months);

    // 4. สร้าง registration record (ใช้งานได้ทันที)
    const [registrationResult] = await connection.query(
      `INSERT INTO registration (
        member_id, trainer_id, packages_id, 
        registration_startdate, registration_enddate
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        memberId,
        trainer_id,
        package_id,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ]
    );

    await connection.query("COMMIT");

    return {
      success: true,
      member_id: memberId,
      registration_id: registrationResult.insertId,
      trainer_info: {
        id: trainer.id,
        name: trainer.name,
      },
      package_info: {
        id: packageInfo.id,
        name: packageInfo.name,
        duration_months: packageInfo.duration_months,
        price: packageInfo.price,
      },
      registration_period: {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
      message: "ลงทะเบียนสำเร็จ! คุณสามารถเข้าใช้งานได้ทันที",
    };
  } catch (error) {
    await connection.query("ROLLBACK");
    console.error("Error creating member and registration:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลงทะเบียน",
    };
  } finally {
    connection.release();
  }
}


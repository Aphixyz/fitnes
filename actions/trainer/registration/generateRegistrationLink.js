"use server";

import pool from "@/lib/db";
import jwt from "jsonwebtoken";

/**
 * สร้างลิงก์ลงทะเบียนสำหรับเทรนเนอร์ พร้อมแพ็คเกจที่เลือก (JWT Simple Version)
 * @param {Object} data - ข้อมูลสำหรับการสร้างลิงก์
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {number} data.packageId - รหัสแพ็คเกจที่เลือก
 * @param {number} data.expiryHours - จำนวนชั่วโมงหมดอายุของลิงก์ (default 24 ชม. = 1 วัน)
 * @returns {Promise<Object>} - ข้อมูลลิงก์ที่สร้างขึ้น
 */
export async function generateRegistrationLink({
  trainerId,
  packageId,
  expiryHours = 24, // 1 วัน
}) {
  try {
    // ตรวจสอบ trainer และ package
    const [verification] = await pool.query(
      `
      SELECT 
        t.trainer_id, t.trainer_firstname, t.trainer_lastname,
        p.packages_id, p.packages_name, p.packages_price
      FROM trainer t, packages p 
      WHERE t.trainer_id = ? AND t.trainer_status = 'active'
      AND p.packages_id = ?
    `,
      [trainerId, packageId]
    );

    if (!verification || verification.length === 0) {
      throw new Error("ไม่พบข้อมูลเทรนเนอร์หรือแพ็คเกจ");
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // สร้าง JWT payload (แบบง่าย ไม่มี usage control)
    const payload = {
      trainer_id: trainerId,
      package_id: packageId,
      iat: currentTime,
      exp: currentTime + expiryHours * 3600, // หมดอายุตามที่กำหนด
    };

    // สร้าง JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    // ใช้ base64url encoding เพื่อให้ URL สั้นลง
    const shortToken = Buffer.from(token).toString("base64url");

    const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register/${shortToken}`;

    return {
      success: true,
      url: registrationUrl,
      token: shortToken,
      expires_at: new Date(payload.exp * 1000).toISOString(),
      trainer_info: {
        id: verification[0].trainer_id,
        name: `${verification[0].trainer_firstname} ${verification[0].trainer_lastname}`,
      },
      package_info: {
        id: verification[0].packages_id,
        name: verification[0].packages_name,
        price: verification[0].packages_price,
      },
    };
  } catch (error) {
    console.error("Error generating registration link:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้างลิงก์",
    };
  }
}
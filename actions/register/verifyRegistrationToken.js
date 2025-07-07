"use server";

import pool from "@/lib/db";
import jwt from "jsonwebtoken";

/**
 * ตรวจสอบและ decode JWT token จากลิงก์ลงทะเบียน
 * @param {string} token - JWT token (base64url encoded)
 * @returns {Promise<Object>} - ข้อมูลเทรนเนอร์และแพ็คเกจที่ decode จาก token
 */
export async function verifyRegistrationToken(token) {
    try {
      if (!token) {
        throw new Error("ไม่พบ token");
      }
  
      // decode จาก base64url กลับเป็น JWT
      const jwtToken = Buffer.from(token, "base64url").toString();
  
      // verify และ decode JWT
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
  
      const { trainer_id, package_id } = decoded;
  
      // ตรวจสอบข้อมูลเทรนเนอร์และแพ็คเกจจากฐานข้อมูล
      const [result] = await pool.query(
        `SELECT 
          t.trainer_id, t.trainer_firstname, t.trainer_lastname, t.trainer_email, t.trainer_phone,
          p.packages_id, p.packages_name, p.packages_price, p.packages_duration_months, p.packages_description
         FROM trainer t, packages p
         WHERE t.trainer_id = ? AND t.trainer_status = 'active' 
         AND p.packages_id = ?`,
        [trainer_id, package_id]
      );
  
      if (!result || result.length === 0) {
        throw new Error(
          "ไม่พบข้อมูลเทรนเนอร์หรือแพ็คเกจ หรือเทรนเนอร์ไม่อยู่ในสถานะพร้อมให้บริการ"
        );
      }
  
      const data = result[0];
  
      return {
        success: true,
        trainer: {
          id: data.trainer_id,
          name: `${data.trainer_firstname} ${data.trainer_lastname}`,
          email: data.trainer_email,
          phone: data.trainer_phone,
        },
        package: {
          id: data.packages_id,
          name: data.packages_name,
          price: data.packages_price,
          duration_months: data.packages_duration_months,
          description: data.packages_description,
        },
        token_data: {
          trainer_id: decoded.trainer_id,
          package_id: decoded.package_id,
          issued_at: new Date(decoded.iat * 1000),
          expires_at: new Date(decoded.exp * 1000),
        },
      };
    } catch (error) {
      console.error("Error verifying registration token:", error);
  
      // ให้ข้อความที่เข้าใจง่ายสำหรับ JWT errors
      let message = "เกิดข้อผิดพลาดในการตรวจสอบลิงก์";
  
      if (error.name === "TokenExpiredError") {
        message =
          "ลิงก์ลงทะเบียนหมดอายุแล้ว กรุณาติดต่อเทรนเนอร์เพื่อขอลิงก์ใหม่";
      } else if (error.name === "JsonWebTokenError") {
        message = "ลิงก์ลงทะเบียนไม่ถูกต้อง";
      }
  
      return {
        success: false,
        message: message,
      };
    }
  }

"use server";

import pool from "@/lib/db";

/**
 * บันทึกน้ำหนักปัจจุบันของสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 * @param {number} weight - น้ำหนัก (กิโลกรัม)
 * @param {string} date - วันที่บันทึก (YYYY-MM-DD) ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน
 * @returns {Promise<Object>} ผลลัพธ์การบันทึก
 */
export async function insertWeight(memberId, weight, date = null) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    if (!weight || weight <= 0) {
      throw new Error("กรุณาระบุน้ำหนักที่ถูกต้อง (มากกว่า 0)");
    }

    // ตรวจสอบรูปแบบน้ำหนัก (ไม่เกิน 999.99 kg)
    if (weight > 999.99) {
      throw new Error("น้ำหนักไม่สามารถเกิน 999.99 กิโลกรัม");
    }

    // กำหนดวันที่ถ้าไม่ระบุ
    const measurementDate = date || new Date().toISOString().split("T")[0];

    // ตรวจสอบรูปแบบวันที่
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(measurementDate)) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD");
    }

    // ตรวจสอบว่าวันที่อยู่ในอนาคตหรือไม่
    const today = new Date().toISOString().split("T")[0];
    if (measurementDate > today) {
      throw new Error("ไม่สามารถบันทึกข้อมูลในอนาคตได้");
    }

    // บันทึกข้อมูลใหม่เสมอ (ไม่เช็ค existing data)
    const [insertResult] = await pool.query(
      `INSERT INTO member_health 
       (member_id, member_health_weight, member_health_measurementdate) 
       VALUES (?, ?, ?)`,
      [memberId, weight, measurementDate]
    );

    const result = {
      success: true,
      member_health_id: insertResult.insertId,
      weight: weight,
      measurement_date: measurementDate,
      message: `บันทึกน้ำหนัก ${weight} กิโลกรัมเรียบร้อยแล้ว`,
    };

    return result;
  } catch (error) {
    console.error("Error inserting weight:", error);
    throw new Error(`ไม่สามารถบันทึกน้ำหนักได้: ${error.message}`);
  }
}


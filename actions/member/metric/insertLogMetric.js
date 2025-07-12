"use server";

import  pool  from "@/lib/db";

/**
 * บันทึก metric log ของสมาชิก (สัดส่วนร่างกาย)
 * @param {Object} data - ข้อมูล metric ที่จะบันทึก
 * @param {number} data.member_id - ID ของสมาชิก
 * @param {number} data.bodyfat - เปอร์เซ็นต์ไขมันในร่างกาย
 * @param {number} data.chest - รอบอก (cm)
 * @param {number} data.waist - รอบเอว (cm)
 * @param {number} data.hip - รอบสะโพก (cm)
 * @param {number} data.arm - รอบแขน (cm)
 * @param {number} data.thigh - รอบต้นขา (cm)
 * @param {string} data.measurement_date - วันที่วัด (YYYY-MM-DD)
 * @returns {Object} ผลลัพธ์การบันทึก
 */
export const insertLogMetric = async (data) => {
  try {
    // ===== Validation =====
    const {
      member_id,
      bodyfat,
      chest,
      waist,
      hip,
      arm,
      thigh,
      measurement_date,
    } = data;

    // ตรวจสอบ required fields
    if (!member_id) {
      return {
        success: false,
        message: "กรุณาระบุ member_id",
      };
    }

    // ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 ตัว
    const hasMetricData = bodyfat || chest || waist || hip || arm || thigh;
    if (!hasMetricData) {
      return {
        success: false,
        message: "กรุณาระบุข้อมูล metric อย่างน้อย 1 ตัว",
      };
    }

    // ตรวจสอบ measurement_date
    const validDate =
      measurement_date || new Date().toISOString().split("T")[0];

    // ===== Database Insert =====
    const query = `
      INSERT INTO member_health (
        member_id,
        member_health_bodyfat,
        member_health_chest,
        member_health_waist,
        member_health_hip,
        member_health_arm,
        member_health_thigh,
        member_health_measurementdate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      member_id,
      bodyfat || null,
      chest || null,
      waist || null,
      hip || null,
      arm || null,
      thigh || null,
      validDate,
    ];

    const [result] = await pool.query(query, values);

    return {
      success: true,
      message: "บันทึก metric log สำเร็จ",
      data: {
        member_health_id: result.insertId,
        member_id,
        measurement_date: validDate,
      },
    };
  } catch (error) {
    console.error("Error inserting metric log:", error);

    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึก metric log",
      error: error.message,
    };
  }
};

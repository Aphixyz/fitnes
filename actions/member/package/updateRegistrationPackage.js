// actions/member/package/updateRegistrationPackage.js
"use server";

import db from "@/lib/db";

/**
 * อัพเดท registration ด้วย package ที่เลือกและตั้งสถานะเป็น pending
 *
 * @param {number} registrationId - รหัสการลงทะเบียน
 * @param {number} packageId - รหัสแพ็คเกจที่เลือก
 * @returns {Promise<Object>} - ผลลัพธ์การอัพเดท
 */
export async function updateRegistrationPackage(registrationId, packageId) {
  try {
    if (!registrationId || !packageId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบว่า registration มีอยู่จริง
    const [registrationCheck] = await db.query(
      "SELECT registration_id, member_id, trainer_id FROM registration WHERE registration_id = ?",
      [registrationId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียน");
    }

    const registration = registrationCheck[0];

    // ตรวจสอบว่าแพ็คเกจมีอยู่จริงและเป็นของเทรนเนอร์คนเดียวกัน
    const [packageCheck] = await db.query(
      `SELECT packages_id, packages_name, packages_duration_months, packages_price 
       FROM packages 
       WHERE packages_id = ? AND trainer_id = ?`,
      [packageId, registration.trainer_id]
    );

    if (!packageCheck || packageCheck.length === 0) {
      throw new Error("ไม่พบแพ็คเกจที่เลือกหรือแพ็คเกจไม่ตรงกับเทรนเนอร์");
    }

    const selectedPackage = packageCheck[0];

    // เริ่ม transaction
    await db.query("START TRANSACTION");

    try {
      // อัพเดท registration ด้วย package ที่เลือกและตั้งสถานะเป็น pending
      const [updateResult] = await db.query(
        `UPDATE registration 
         SET packages_id = ?, 
             registration_status = 'pending',
             registration_startdate = NOW(),
             registration_enddate = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE registration_id = ?`,
        [packageId, selectedPackage.packages_duration_months, registrationId]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("ไม่สามารถอัพเดทข้อมูลการลงทะเบียนได้");
      }

      await db.query("COMMIT");

      return {
        success: true,
        registration_id: registrationId,
        package_info: selectedPackage,
        message: `เลือกแพ็คเกจ "${selectedPackage.packages_name}" สำเร็จ`,
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating registration package:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัพเดทแพ็คเกจ",
    };
  }
}

//actions/member/packeage/packageSelection.js
"use server";

import db from "@/lib/db";

export async function selectPackage(memberId, trainerId, packageId) {
  try {
    if (!memberId || !trainerId || !packageId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบว่าแพ็คเกจมีอยู่จริง
    const [packageCheck] = await db.query(
      `SELECT packages_id, packages_name, packages_duration_months, packages_price, packages_description
       FROM packages 
       WHERE packages_id = ? AND trainer_id = ?`,
      [packageId, trainerId]
    );

    if (!packageCheck || packageCheck.length === 0) {
      throw new Error("ไม่พบแพ็คเกจที่เลือก");
    }

    const selectedPackage = packageCheck[0];
    const packageDurationMonths = selectedPackage.packages_duration_months;

    // ตรวจสอบว่ามี registration record อยู่แล้วหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id 
       FROM registration 
       WHERE member_id = ? AND trainer_id = ? AND packages_id IS NULL`,
      [memberId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียน");
    }

    await db.query("START TRANSACTION");

    try {
      await db.query(
        `UPDATE registration 
         SET packages_id = ?,
             registration_startdate = NOW(),
             registration_enddate = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE member_id = ? AND trainer_id = ? AND packages_id IS NULL`,
        [packageId, packageDurationMonths, memberId, trainerId]
      );

      await db.query("COMMIT");

      return {
        success: true,
        package_info: selectedPackage,
        registration_id: registrationCheck[0].registration_id,
        message: `เลือกแพ็คเกจ "${selectedPackage.packages_name}" สำเร็จ (ระยะเวลา ${packageDurationMonths} เดือน)`,
      };
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error selecting package:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการเลือกแพ็คเกจ",
    };
  }
}

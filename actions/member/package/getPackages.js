// actions/member/package/getPackages.js
"use server";

import db from "@/lib/db";

export async function getTrainerPackages(trainerId) {
  try {
    if (!trainerId) {
      throw new Error("กรุณาระบุรหัสเทรนเนอร์");
    }

    const [packages] = await db.query(
      `SELECT packages_id, packages_name, packages_duration_months, packages_price, packages_description 
         FROM packages 
         WHERE trainer_id = ?`,
      [trainerId]
    );

    if (!packages || packages.length === 0) {
      throw new Error("ไม่พบแพ็คเกจสำหรับเทรนเนอร์นี้");
    }

    return {
      success: true,
      packages,
    };
  } catch (error) {
    console.error("Error fetching trainer packages:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
    };
  }
}

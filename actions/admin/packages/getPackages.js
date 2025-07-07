"use server";

import db from "@/lib/db";

/**
 * ดึงแพ็คเกจกลางทั้งหมดสำหรับ Trainer
 * Trainer สามารถดูแพ็คเกจทั้งหมดแต่ไม่สามารถแก้ไขได้
 */
export async function getPackages() {
  try {
    // ดึง packages ทั้งหมด
    const [packages] = await db.query(
      `SELECT 
        packages_id,
        packages_name,
        packages_duration_months,
        packages_price,
        packages_description
      FROM packages
      ORDER BY packages_price ASC`
    );

    return {
      success: true,
      packages,
    };
  } catch (error) {
    console.error("Error fetching packages:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
    };
  }
}

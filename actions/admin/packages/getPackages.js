"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูล packages ทั้งหมด (ไม่กรอง trainer)
 * @returns {Promise<Object>} - ข้อมูล packages
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
      packages: packages || [],
    };
  } catch (error) {
    console.error("Error fetching trainer packages:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
      packages: [],
    };
  }
}
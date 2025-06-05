"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูล packages ของ trainer
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ข้อมูล packages
 */
export async function getTrainerPackages(trainerId) {
  try {
    if (!trainerId) {
      throw new Error("ไม่พบข้อมูล trainer ID");
    }

    // ดึง packages ทั้งหมดของ trainer
    const [packages] = await db.query(
      `SELECT 
        packages_id,
        packages_name,
        packages_duration_months,
        packages_price,
        packages_description
      FROM packages 
      WHERE trainer_id = ?
      ORDER BY packages_price ASC`,
      [trainerId]
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
 
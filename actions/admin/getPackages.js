"use server";

import db from "@/lib/db";

export async function getPackages() {
  try {
    const [packages] = await db.query(
      `SELECT 
    p.packages_id,
    p.packages_name,
    p.packages_duration_months,
    p.packages_price,
    p.packages_description,
    t.trainer_id,
    t.trainer_firstname,
    t.trainer_lastname
  FROM packages p
  LEFT JOIN trainer t ON p.trainer_id = t.trainer_id`
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

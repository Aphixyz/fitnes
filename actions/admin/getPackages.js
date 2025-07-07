"use server";

import db from "@/lib/db";

export async function getPackages() {
  try {
    // ดึงแพ็คเกจกลางทั้งหมด (ไม่มี trainer_id แล้ว)
    const [packages] = await db.query(`
      SELECT 
        p.packages_id,
        p.packages_name,
        p.packages_duration_months,
        p.packages_price,
        p.packages_description,
        COUNT(r.registration_id) as sold_count,
        COALESCE(SUM(p.packages_price), 0) as total_revenue
      FROM packages p
      LEFT JOIN registration r ON p.packages_id = r.packages_id
      GROUP BY p.packages_id
      ORDER BY p.packages_price ASC
    `);

    // สถิติรวม
    const [totalStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT p.packages_id) as total_packages,
        COUNT(r.registration_id) as total_sales,
        COALESCE(SUM(p.packages_price), 0) as total_revenue,
        COUNT(CASE WHEN r.registration_enddate >= CURDATE() THEN 1 END) as active_registrations
      FROM packages p
      LEFT JOIN registration r ON p.packages_id = r.packages_id
    `);

    return {
      success: true,
      packages,
      stats: totalStats[0] || {
        total_packages: 0,
        total_sales: 0,
        total_revenue: 0,
        active_registrations: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching packages:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
    };
  }
}

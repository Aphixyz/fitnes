"use server";

import db from "@/lib/db";

/**
<<<<<<< HEAD:actions/trainer/packages/getPackages.js
 * ดึงแพ็คเกจกลางทั้งหมดสำหรับ Trainer
 * Trainer สามารถดูแพ็คเกจทั้งหมดแต่ไม่สามารถแก้ไขได้
=======
 * ดึงข้อมูล packages ทั้งหมด (ไม่กรอง trainer)
 * @returns {Promise<Object>} - ข้อมูล packages
>>>>>>> origin/develop:actions/admin/packages/getPackages.js
 */
export async function getPackages() {
  try {
<<<<<<< HEAD:actions/trainer/packages/getPackages.js
    if (!trainerId) {
      throw new Error("กรุณาระบุรหัสเทรนเนอร์");
    }

    // ตรวจสอบว่า trainer มีอยู่จริงและ active
    const [trainerCheck] = await db.query(
      "SELECT trainer_id FROM trainer WHERE trainer_id = ? AND trainer_status = 'active'",
      [trainerId]
    );

    if (!trainerCheck || trainerCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลเทรนเนอร์หรือเทรนเนอร์ไม่อยู่ในสถานะ active");
    }

    // ดึงแพ็คเกจกลางทั้งหมด พร้อมสถิติการใช้งานของ trainer นี้
    const [packages] = await db.query(
      `
      SELECT 
        p.packages_id,
        p.packages_name,
        p.packages_duration_months,
        p.packages_price,
        p.packages_description,
        COUNT(r.registration_id) as total_sales,
        COUNT(CASE WHEN r.trainer_id = ? THEN 1 END) as my_sales,
        COUNT(CASE WHEN r.registration_enddate >= CURDATE() AND r.trainer_id = ? THEN 1 END) as my_active_members
      FROM packages p
      LEFT JOIN registration r ON p.packages_id = r.packages_id
      GROUP BY p.packages_id
      ORDER BY p.packages_price ASC
    `,
      [trainerId, trainerId]
    );

    // สถิติของ trainer นี้
    const [myStats] = await db.query(
      `
      SELECT 
        COUNT(r.registration_id) as my_total_sales,
        COALESCE(SUM(p.packages_price), 0) as my_total_revenue,
        COUNT(CASE WHEN r.registration_enddate >= CURDATE() THEN 1 END) as my_active_members
      FROM registration r
      INNER JOIN packages p ON r.packages_id = p.packages_id
      WHERE r.trainer_id = ?
    `,
      [trainerId]
=======
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
>>>>>>> origin/develop:actions/admin/packages/getPackages.js
    );

    return {
      success: true,
      packages,
      my_stats: myStats[0] || {
        my_total_sales: 0,
        my_total_revenue: 0,
        my_active_members: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching trainer packages:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
    };
  }
<<<<<<< HEAD:actions/trainer/packages/getPackages.js
}
=======
}
>>>>>>> origin/develop:actions/admin/packages/getPackages.js

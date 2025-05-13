"use server";

import pool from "@/lib/db";

export async function getRevenueByPackage() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.packages_id,
        p.packages_name,
        DATE_FORMAT(r.registration_startdate, '%Y-%m') AS revenue_month,
        COUNT(r.registration_id) AS registrations_count,
        p.packages_price,
        p.packages_price * COUNT(r.registration_id) AS monthly_revenue
      FROM 
        packages p
      INNER JOIN 
        registration r ON p.packages_id = r.packages_id
      WHERE 
        r.registration_status = 1
        AND r.registration_startdate IS NOT NULL
        AND r.registration_startdate <= CURDATE()
      GROUP BY 
        p.packages_id, p.packages_name, revenue_month, p.packages_price
      ORDER BY 
        revenue_month ASC, p.packages_id;
    `);

    console.log("Query Result:", rows); // ดีบักผลลัพธ์
    return {
      success: true,
      data: rows
    };
  } catch (error) {
    console.error('Error fetching revenue by package:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายได้แพ็กเกจ'
    };
  }
}
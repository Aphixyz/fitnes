"use server";

import pool from "@/lib/db";

export async function getRevenueByPackage() {
  try {
    const [rows] = await pool.execute(`
    SELECT 
      DATE_FORMAT(r.registration_startdate, '%Y-%m') AS revenue_month,
      SUM(p.packages_price) AS total_monthly_revenue
    FROM 
      registration r
    INNER JOIN 
      packages p ON r.packages_id = p.packages_id
    WHERE 
      r.registration_status = 'active'
      AND r.registration_startdate IS NOT NULL
    GROUP BY 
      DATE_FORMAT(r.registration_startdate, '%Y-%m')
    ORDER BY 
      revenue_month ASC;
    `);

    // console.log("Query Result:", rows);
    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error("Error fetching revenue by package:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายได้แพ็กเกจ",
    };
  }
}

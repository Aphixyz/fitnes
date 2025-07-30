import pool from "@/lib/db";

/**
 * ดึงข้อมูล Package ปัจจุบันของ Member พร้อมการคำนวณการใช้งาน
 * @param {number} memberId - ID ของ Member
 * @returns {Object} ข้อมูล Package และการใช้งาน
 */
export async function getMemberPackageInfo(memberId) {
  try {
    // Input validation
    if (!memberId || isNaN(Number(memberId))) {
      throw new Error("Invalid member ID provided");
    }

    const connection = await pool.getConnection();

    try {
      // Query ข้อมูล Package ปัจจุบันพร้อม Trainer
      const [rows] = await connection.execute(
        `
        SELECT 
          r.registration_id,
          r.registration_startdate,
          r.registration_enddate,
          p.packages_id,
          p.packages_name,
          p.packages_price,
          p.packages_duration_months,
          p.packages_description,
          t.trainer_id,
          t.trainer_firstname,
          t.trainer_lastname,
          t.trainer_email,
          t.trainer_phone,
          t.trainer_specialization
        FROM registration r
        INNER JOIN packages p ON r.packages_id = p.packages_id
        INNER JOIN trainer t ON r.trainer_id = t.trainer_id
        WHERE r.member_id = ? 
        AND r.registration_enddate >= CURDATE()
        ORDER BY r.registration_startdate DESC
        LIMIT 1
      `,
        [memberId]
      );

      if (rows.length === 0) {
        return {
          success: false,
          message: "ไม่พบ Package ที่ใช้งานอยู่",
          data: null,
        };
      }

      const packageData = rows[0];
      const currentDate = new Date();
      const startDate = new Date(packageData.registration_startdate);
      const endDate = new Date(packageData.registration_enddate);

      // คำนวณการใช้งาน
      const totalDays = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const daysUsed = Math.ceil(
        (currentDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = Math.ceil(
        (endDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      const usagePercentage = Math.min((daysUsed / totalDays) * 100, 100);
      const isActive = currentDate <= endDate;

      // จัดรูปแบบข้อมูล
      const result = {
        success: true,
        data: {
          package: {
            id: packageData.packages_id,
            name: packageData.packages_name,
            price: packageData.packages_price,
            duration: packageData.packages_duration_months,
            description: packageData.packages_description,
          },
          usage: {
            startDate: packageData.registration_startdate,
            endDate: packageData.registration_enddate,
            daysRemaining: Math.max(0, daysRemaining),
            daysUsed: Math.max(0, daysUsed),
            totalDays: totalDays,
            usagePercentage: Math.round(usagePercentage * 100) / 100,
            isActive: isActive,
          },
          trainer: {
            id: packageData.trainer_id,
            name: `${packageData.trainer_firstname} ${packageData.trainer_lastname}`,
            specialization: packageData.trainer_specialization,
            email: packageData.trainer_email,
            phone: packageData.trainer_phone,
          },
        },
      };

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error in getMemberPackageInfo:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล Package",
      error: error.message,
    };
  }
}

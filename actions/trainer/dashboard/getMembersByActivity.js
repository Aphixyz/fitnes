"use server";

import pool from "@/lib/db";

/**
 * ดึงข้อมูลสมาชิกตามประเภทกิจกรรม
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {string} activityType - ประเภท: 'all', 'active_7days', 'inactive_7days'
 * @param {string} searchTerm - คำค้นหา
 * @returns {Promise<Object>} รายชื่อสมาชิก
 */
export async function getMembersByActivity(trainerId, activityType = 'all', searchTerm = '') {
  const connection = await pool.getConnection();

  try {
    const trainerIdNum = parseInt(trainerId, 10);
    if (isNaN(trainerIdNum)) {
      throw new Error("Invalid trainerId");
    }

    const cleanSearchTerm = searchTerm?.trim() || "";

    // สร้าง search condition
    let searchCondition = "";
    let searchParams = [];

    if (cleanSearchTerm) {
      searchCondition = `AND (CONCAT(m.member_firstname, ' ', m.member_lastname) LIKE ? 
          OR m.member_firstname LIKE ? 
          OR m.member_lastname LIKE ?
          OR m.member_email LIKE ?)`;
      searchParams = [
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
      ];
    }

    let query = "";
    let params = [];

    switch (activityType) {
      case 'all':
        // สมาชิกทั้งหมด
        query = `
          SELECT DISTINCT
            m.member_id,
            m.member_firstname,
            m.member_lastname,
            m.member_email,
            m.member_phone,
            m.member_profileimage,
            r.registration_startdate,
            r.registration_enddate,
            CASE 
              WHEN r.registration_enddate >= CURDATE() THEN 'active'
              ELSE 'expired' 
            END as registration_status
          FROM member m
          INNER JOIN registration r ON m.member_id = r.member_id
          WHERE r.trainer_id = ?
          ${searchCondition}
          ORDER BY m.member_firstname ASC
        `;
        params = [trainerIdNum, ...searchParams];
        break;

      case 'active_7days':
        // สมาชิกที่มีกิจกรรมใน 7 วันที่ผ่านมา
        query = `
          SELECT DISTINCT
            m.member_id,
            m.member_firstname,
            m.member_lastname,
            m.member_email,
            m.member_phone,
            m.member_profileimage,
            r.registration_startdate,
            r.registration_enddate,
            'active' as registration_status,
            MAX(COALESCE(el.log_date, il.date, mh.member_health_measurementdate)) as last_activity_date
          FROM member m
          INNER JOIN registration r ON m.member_id = r.member_id
          LEFT JOIN exercise_log el ON m.member_id = el.member_id 
            AND el.log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          LEFT JOIN intake_logs il ON m.member_id = il.member_id 
            AND il.date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          LEFT JOIN member_health mh ON m.member_id = mh.member_id 
            AND mh.member_health_measurementdate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          WHERE r.trainer_id = ? 
            AND r.registration_enddate >= CURDATE()
            AND (el.log_date IS NOT NULL OR il.date IS NOT NULL OR mh.member_health_measurementdate IS NOT NULL)
          ${searchCondition}
          GROUP BY m.member_id, m.member_firstname, m.member_lastname, 
                   m.member_email, m.member_phone, m.member_profileimage,
                   r.registration_startdate, r.registration_enddate
          ORDER BY last_activity_date DESC, m.member_firstname ASC
        `;
        params = [trainerIdNum, ...searchParams];
        break;

      case 'inactive_7days':
        // สมาชิกที่ไม่มีกิจกรรมใน 7 วันที่ผ่านมา
        query = `
          SELECT DISTINCT
            m.member_id,
            m.member_firstname,
            m.member_lastname,
            m.member_email,
            m.member_phone,
            m.member_profileimage,
            r.registration_startdate,
            r.registration_enddate,
            'inactive' as registration_status
          FROM member m
          INNER JOIN registration r ON m.member_id = r.member_id
          WHERE r.trainer_id = ? 
            AND r.registration_enddate >= CURDATE()
            AND m.member_id NOT IN (
              SELECT DISTINCT m2.member_id
              FROM member m2
              INNER JOIN registration r2 ON m2.member_id = r2.member_id
              LEFT JOIN exercise_log el2 ON m2.member_id = el2.member_id 
                AND el2.log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              LEFT JOIN intake_logs il2 ON m2.member_id = il2.member_id 
                AND il2.date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              LEFT JOIN member_health mh2 ON m2.member_id = mh2.member_id 
                AND mh2.member_health_measurementdate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              WHERE r2.trainer_id = ?
                AND r2.registration_enddate >= CURDATE()
                AND (el2.log_date IS NOT NULL OR il2.date IS NOT NULL OR mh2.member_health_measurementdate IS NOT NULL)
            )
          ${searchCondition}
          ORDER BY m.member_firstname ASC
        `;
        params = [trainerIdNum, trainerIdNum, ...searchParams];
        break;

      default:
        throw new Error("Invalid activity type");
    }

    const [result] = await connection.query(query, params);

    // จัดรูปแบบข้อมูล
    const members = result.map(member => ({
      memberId: member.member_id,
      firstName: member.member_firstname,
      lastName: member.member_lastname,
      fullName: `${member.member_firstname} ${member.member_lastname}`,
      email: member.member_email,
      phone: member.member_phone,
      profileImage: member.member_profileimage,
      registrationStartDate: member.registration_startdate,
      registrationEndDate: member.registration_enddate,
      registrationStatus: member.registration_status,
      lastActivityDate: member.last_activity_date || null
    }));

    return {
      success: true,
      data: {
        members,
        activityType,
        searchTerm: cleanSearchTerm,
        total: members.length
      }
    };

  } catch (error) {
    console.error("Error fetching members by activity:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก",
      error: error.message
    };
  } finally {
    connection.release();
  }
}

export default getMembersByActivity;
"use server";

import pool from "@/lib/db";

export const fetchRegistrationData = async ({
  trainerId,
  page = 1,
  pageSize = 10,
  sortBy = "registration_id",
  sortOrder = "desc",
  searchTerm = "",
}) => {
  const connection = await pool.getConnection();

  try {
    // แปลง trainerId เป็นตัวเลข
    const trainerIdNum = parseInt(trainerId, 10);
    if (isNaN(trainerIdNum)) {
      return {
        success: false,
        message: "Invalid trainerId",
      };
    }

    // คำนวณ offset สำหรับ pagination
    const offset = (page - 1) * pageSize;

    // ตรวจสอบ searchTerm
    const cleanSearchTerm = searchTerm?.trim() || "";

    // สร้าง search condition และ parameters แบบไดนามิก
    let searchCondition = "";
    let searchParams = [];

    if (cleanSearchTerm) {
      searchCondition += ` AND (
        CONCAT(COALESCE(m.member_firstname, ''), ' ', COALESCE(m.member_lastname, '')) LIKE ? 
        OR COALESCE(m.member_email, '') LIKE ?
        OR COALESCE(m.member_phone, '') LIKE ?
        OR CAST(r.registration_id AS CHAR) LIKE ?
      )`;
      searchParams.push(
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`
      );
    }

    // สร้าง ORDER BY clause ตาม schema ที่มี
    let orderClause;
    switch (sortBy) {
      case "member_name":
        orderClause = `ORDER BY CONCAT(COALESCE(m.member_firstname, ''), ' ', COALESCE(m.member_lastname, '')) COLLATE utf8mb4_unicode_ci ${sortOrder.toUpperCase()}`;
        break;
      case "registration_startdate":
        orderClause = `ORDER BY r.registration_startdate ${sortOrder.toUpperCase()}`;
        break;
      case "registration_enddate":
        orderClause = `ORDER BY r.registration_enddate ${sortOrder.toUpperCase()}`;
        break;
      case "packages_name":
        orderClause = `ORDER BY p.packages_name ${sortOrder.toUpperCase()}`;
        break;
      default:
        orderClause = `ORDER BY r.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Query หลักสำหรับดึงข้อมูล registrations ตาม schema
    const registrationsQuery = `
      SELECT 
        r.registration_id,
        r.member_id,
        r.trainer_id,
        r.packages_id,
        r.registration_startdate,
        r.registration_enddate,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_phone,
        m.member_gender,
        m.member_dob,
        m.member_profileimage,
        p.packages_name,
        p.packages_price,
        p.packages_duration_months,
        p.packages_description
      FROM registration r
      LEFT JOIN member m ON r.member_id = m.member_id
      LEFT JOIN packages p ON r.packages_id = p.packages_id
      WHERE r.trainer_id = ?
      ${searchCondition}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    // Query สำหรับนับจำนวนทั้งหมด (filtered by search term)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM registration r
      LEFT JOIN member m ON r.member_id = m.member_id
      WHERE r.trainer_id = ?
      ${searchCondition}
    `;

    // Query สำหรับ statistics ทั้งหมด (ไม่ filter ด้วย search term)
    const statsQuery = `
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE 
          WHEN r.registration_enddate IS NULL THEN 0
          WHEN DATE(r.registration_enddate) < CURDATE() THEN 0
          ELSE 1 
        END) as active_packages,
        SUM(CASE 
          WHEN r.registration_enddate IS NULL THEN 0
          WHEN DATE(r.registration_enddate) < CURDATE() THEN 1
          ELSE 0 
        END) as expired_packages
      FROM registration r
      WHERE r.trainer_id = ?
    `;

    // สร้าง Parameters arrays
    const queryParams = [trainerIdNum, ...searchParams, pageSize, offset];
    const countParams = [trainerIdNum, ...searchParams];
    const statsParams = [trainerIdNum];

    // ดำเนินการ query แบบ parallel
    const [registrationsResult, countResult, statsResult] = await Promise.all([
      connection.query(registrationsQuery, queryParams),
      connection.query(countQuery, countParams),
      connection.query(statsQuery, statsParams),
    ]);

    const totalItems = countResult[0][0]?.total || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // ข้อมูล statistics ทั้งหมด
    const stats = statsResult[0][0] || {};
    const totalRegistrations = stats.total_registrations || 0;
    const activePackages = stats.active_packages || 0;
    const expiredPackages = stats.expired_packages || 0;

    // Return ข้อมูลดิบจากฐานข้อมูลโดยไม่แปลง
    const registrations = registrationsResult[0].map((reg) => ({
      registration_id: reg.registration_id,
      member_id: reg.member_id,
      trainer_id: reg.trainer_id,
      packages_id: reg.packages_id,
      registration_startdate: reg.registration_startdate,
      registration_enddate: reg.registration_enddate,
      member_firstname: reg.member_firstname,
      member_lastname: reg.member_lastname,
      member_email: reg.member_email,
      member_phone: reg.member_phone,
      member_gender: reg.member_gender,
      member_dob: reg.member_dob,
      member_profileimage: reg.member_profileimage,
      packages_name: reg.packages_name,
      packages_price: reg.packages_price,
      packages_duration_months: reg.packages_duration_months,
      packages_description: reg.packages_description,
    }));

    return {
      success: true,
      data: {
        registrations,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        // เพิ่ม statistics ทั้งหมดจากฐานข้อมูล
        statistics: {
          total: totalRegistrations,
          active: activePackages,
          expired: expiredPackages,
          filtered: totalItems, // จำนวนที่ filter แล้ว (สำหรับ search)
        },
        summary: {
          total: totalItems,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching registration data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน",
      error: error.message,
    };
  } finally {
    connection.release();
  }
};

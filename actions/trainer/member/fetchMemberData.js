"use server";

import pool from "@/lib/db";

export const fetchMemberData = async ({
  trainerId,
  page = 1,
  pageSize = 10,
  sortBy = "member_firstname",
  sortOrder = "asc",
  searchTerm = "",
}) => {
  const connection = await pool.getConnection();

  try {
    // แปลง trainerId เป็นตัวเลข (เพราะ URL params เป็น string เสมอ)
    const trainerIdNum = parseInt(trainerId, 10);
    if (isNaN(trainerIdNum)) {
      return {
        success: false,
        message: "Invalid trainerId",
      };
    }

    // คำนวณ offset สำหรับ pagination
    const offset = (page - 1) * pageSize;

    // ตรวจสอบ searchTerm ให้ไม่ empty และ trim
    const cleanSearchTerm = searchTerm?.trim() || "";

    // สร้าง search condition และ parameters แบบไดนามิก
    let searchCondition = "";
    let searchParams = [];

    if (cleanSearchTerm) {
      searchCondition = `AND (CONCAT(m.member_firstname, ' ', m.member_lastname) LIKE ? 
          OR m.member_firstname LIKE ? 
          OR m.member_lastname LIKE ?)`;
      searchParams = [
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
        `%${cleanSearchTerm}%`,
      ];
    }

    // สร้าง ORDER BY clause ที่รองรับภาษาไทยและอังกฤษ
    let orderClause;
    if (sortBy === "member_firstname" || sortBy === "full_name") {
      orderClause = `ORDER BY CONCAT(m.member_firstname, ' ', m.member_lastname) COLLATE utf8mb4_unicode_ci ${sortOrder.toUpperCase()}`;
    } else {
      orderClause = `ORDER BY ${sortBy} COLLATE utf8mb4_unicode_ci ${sortOrder.toUpperCase()}`;
    }

    // Query หลักสำหรับดึงข้อมูล members พร้อม JOIN ข้อมูลที่ครบถ้วน
    const membersQuery = `
      SELECT 
        m.member_id,
        m.member_firstname,
        m.member_lastname,
        m.member_profileimage,
        r.registration_id,
        r.registration_status,
        fg.fitness_goal_id,
        fg.fitness_goal_type,
        wp.workout_plan_id,
        wp.plan_name,
        wp.plan_status
      FROM member m
      INNER JOIN registration r ON m.member_id = r.member_id
      LEFT JOIN fitness_goal fg ON m.member_id = fg.member_id 
        AND fg.fitness_goal_status = 'active'
      LEFT JOIN workout_plan wp ON m.member_id = wp.member_id 
        AND wp.plan_status = 'active'
      WHERE r.trainer_id = ? 
        AND r.registration_status = 'active'
      ${searchCondition}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    // Query สำหรับนับจำนวนทั้งหมด
    const countQuery = `
      SELECT COUNT(DISTINCT m.member_id) as total
      FROM member m
      INNER JOIN registration r ON m.member_id = r.member_id
      WHERE r.trainer_id = ? 
        AND r.registration_status = 'active'
      ${searchCondition}
    `;

    // สร้าง Parameters arrays
    const queryParams = [trainerIdNum, ...searchParams, pageSize, offset];
    const countParams = [trainerIdNum, ...searchParams];

    // ดำเนินการ query
    const [membersResult] = await connection.query(membersQuery, queryParams);
    const [countResult] = await connection.query(countQuery, countParams);

    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการสำหรับ Data Table
    const members = membersResult.map((member) => ({
      member_id: member.member_id,
      member_firstname: member.member_firstname,
      member_lastname: member.member_lastname,
      member_profileimage: member.member_profileimage,
      full_name: `${member.member_firstname} ${member.member_lastname}`,
      fitness_goal_id: member.fitness_goal_id,
      fitness_goal_type: member.fitness_goal_type || "ยังไม่ได้กำหนด",
      workout_plan_id: member.workout_plan_id,
      plan_name: member.plan_name || "ยังไม่มีแผน",
      plan_status: member.plan_status,
      registration_id: member.registration_id,
      registration_status: member.registration_status,
      status_display:
        member.registration_status === "active"
          ? "Active"
          : member.registration_status,
    }));

    return {
      success: true,
      data: {
        members,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          total: totalItems,
          active: members.filter((m) => m.registration_status === "active")
            .length,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching member data:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก",
      error: error.message,
    };
  } finally {
    connection.release();
  }
};

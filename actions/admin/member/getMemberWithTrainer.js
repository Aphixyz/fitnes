"use server";

import db from "@/lib/db";

/**
 * ดึงข้อมูลสมาชิกพร้อมชื่อเทรนเนอร์ (Date-Based Logic)
 */
export async function getMemberWithTrainer() {
  try {
    const [results] = await db.query(`
      SELECT 
        m.member_id,
        m.member_username,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        CASE 
          WHEN r.registration_enddate >= CURDATE() THEN 'active'
          ELSE 'expired'
        END as registration_status,
        t.trainer_id,
        t.trainer_firstname,
        t.trainer_lastname,
        t.trainer_status,
        r.registration_startdate,
        r.registration_enddate
      FROM member m
      JOIN registration r ON m.member_id = r.member_id
      LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
      ORDER BY m.member_id
    `);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error fetching member with trainer:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}

export async function getMemberWithTrainerPaginated(
  page = 1,
  pageSize = 10,
  statusFilter = "",
  sortField = "member_id",
  sortOrder = "asc"
) {
  try {
    const offset = (page - 1) * pageSize;

    // สร้าง WHERE clause สำหรับ date-based status
    let whereClause = "";
    if (statusFilter === "active") {
      whereClause = "WHERE r.registration_enddate >= CURDATE()";
    } else if (statusFilter === "expired") {
      whereClause = "WHERE r.registration_enddate < CURDATE()";
    }

    const validSortFields = ["member_id", "member_firstname"];
    const validSortOrders = ["asc", "desc"];
    const finalSortField = validSortFields.includes(sortField)
      ? sortField
      : "member_id";
    const finalSortOrder = validSortOrders.includes(sortOrder)
      ? sortOrder
      : "asc";

    const orderByClause =
      finalSortField === "member_firstname"
        ? `ORDER BY m.member_firstname ${finalSortOrder}, m.member_lastname ${finalSortOrder}`
        : `ORDER BY m.${finalSortField} ${finalSortOrder}`;

    const [members] = await db.query(
      `
      SELECT 
        m.member_id,
        m.member_username,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_profileimage,
        CASE 
          WHEN r.registration_enddate >= CURDATE() THEN 'active'
          ELSE 'expired'
        END as registration_status,
        t.trainer_id,
        t.trainer_firstname,
        t.trainer_lastname,
        t.trainer_status
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `,
      [pageSize, offset]
    );

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      ${whereClause}
    `;

    const [[{ total }]] = await db.query(countQuery);

    return {
      success: true,
      data: members,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Error in getMemberWithTrainerPaginated:", error);
    return {
      success: false,
      message: "ไม่สามารถโหลดข้อมูลสมาชิกแบบแบ่งหน้าได้",
    };
  }
}

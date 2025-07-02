"use server";

import pool from "@/lib/db";

export async function getTrainerData() {
    try {
        const [trainers] = await pool.query("SELECT * FROM trainer"); // ดึงข้อมูลทั้งหมด
        return trainers || []; // ถ้าไม่มีข้อมูล ให้คืนเป็นอาร์เรย์ว่าง
    } catch (error) {
        console.error("Error fetching trainer data:", error);
        return [];
    }
}

export async function getTrainerPaginated(
  page = 1,
  pageSize = 10,
  statusFilter = "",
  sortField = "trainer_id",
  sortOrder = "asc"
) {
  try {
    const offset = (page - 1) * pageSize;

    const validSortFields = [
      "trainer_id",
      "trainer_firstname",
      "trainer_lastname",
      "trainer_email",
      "trainer_status",
      "trainer_startdate",
      "trainer_enddate"
    ];
    const validSortOrders = ["asc", "desc"];

    const finalSortField = validSortFields.includes(sortField)
      ? sortField
      : "trainer_id";

    const finalSortOrder = validSortOrders.includes(sortOrder)
      ? sortOrder
      : "asc";

    // WHERE clause
    const whereClause = statusFilter
      ? "WHERE trainer_status = ?"
      : "";

    // ORDER BY clause
    const orderByClause = `ORDER BY ${finalSortField} ${finalSortOrder}`;

    // Query main data
    const queryParams = statusFilter
      ? [statusFilter, pageSize, offset]
      : [pageSize, offset];

    const [trainers] = await pool.query(
      `
      SELECT
        trainer_id,
        trainer_username,
        trainer_firstname,
        trainer_lastname,
        trainer_email,
        trainer_phone,
        trainer_status,
        trainer_profile_image,
        trainer_startdate,
        trainer_enddate
      FROM trainer
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
      `,
      queryParams
    );

    // Query count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM trainer
      ${statusFilter ? "WHERE trainer_status = ?" : ""}
    `;

    const [[{ total }]] = await pool.query(
      countQuery,
      statusFilter ? [statusFilter] : []
    );

    return {
      success: true,
      data: trainers,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching paginated trainers:", error);
    return {
      success: false,
      message: "ไม่สามารถโหลดข้อมูลเทรนเนอร์แบบแบ่งหน้าได้",
    };
  }
}

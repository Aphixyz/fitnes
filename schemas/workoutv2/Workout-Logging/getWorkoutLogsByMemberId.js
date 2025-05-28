"use server";

import { z } from "zod";
import pool from "@/lib/db";

// Schema สำหรับตรวจสอบข้อมูล
const getLogsSchema = z.object({
  trainer_id: z.coerce.number().positive("ต้องระบุรหัสเทรนเนอร์"),
  member_id: z.coerce.number().positive("ต้องระบุรหัสสมาชิก"),
  limit: z.coerce.number().int().nonnegative().optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  startDate: z.string().optional(), // ถ้าต้องการกรองตามช่วงวันที่
  endDate: z.string().optional(),
  includeDetails: z.boolean().optional().default(false), // ถ้าต้องการดึงข้อมูลการบันทึกท่าออกกำลังกาย
});

/**
 * ดึงข้อมูลบันทึกการออกกำลังกายของสมาชิก
 * @param {Object} data - ข้อมูลสำหรับการค้นหาบันทึกการออกกำลังกาย
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function getWorkoutLogsByMemberId(data) {
  try {
    // ตรวจสอบข้อมูลด้วย Zod
    const validatedData = getLogsSchema.parse(data);

    // แยกข้อมูลที่ผ่านการตรวจสอบแล้ว
    const {
      trainer_id,
      member_id,
      limit,
      offset,
      startDate,
      endDate,
      includeDetails,
    } = validatedData;

    // ตรวจสอบว่าสมาชิกนี้อยู่ภายใต้การดูแลของเทรนเนอร์คนนี้หรือไม่
    const [memberCheck] = await pool.query(
      "SELECT registration_id FROM registration WHERE trainer_id = ? AND member_id = ? AND registration_status = 1",
      [trainer_id, member_id]
    );

    if (!memberCheck.length) {
      return {
        success: false,
        error: "authorization_error",
        message: "สมาชิกนี้ไม่ได้อยู่ภายใต้การดูแลของคุณ",
      };
    }

    // สร้าง SQL query พื้นฐาน
    let query = `
      SELECT wl.*, wp.plan_name, wp.workout_plan_id  
      FROM workout_log wl 
      LEFT JOIN workout_plan wp ON wl.workout_plan_id = wp.workout_plan_id 
      WHERE wl.member_id = ?
    `;

    // สร้าง parameters array
    let parameters = [member_id];

    // เพิ่มเงื่อนไขการกรองตามวันที่ถ้ามีการระบุ
    if (startDate) {
      query += " AND wl.workout_date >= ?";
      parameters.push(startDate);
    }

    if (endDate) {
      query += " AND wl.workout_date <= ?";
      parameters.push(endDate);
    }

    // เรียงตามวันที่ล่าสุดก่อน
    query += " ORDER BY wl.workout_date DESC, wl.created_at DESC";

    // จำกัดจำนวนผลลัพธ์
    if (limit) {
      query += " LIMIT ? OFFSET ?";
      parameters.push(limit, offset);
    }

    // ดึงข้อมูลบันทึกการออกกำลังกาย
    const [logs] = await pool.query(query, parameters);

    // ดึงจำนวนบันทึกทั้งหมด (ไม่มีการจำกัด limit) เพื่อใช้ในการแบ่งหน้า
    let countQuery =
      "SELECT COUNT(*) AS total FROM workout_log WHERE member_id = ?";
    const countParams = [member_id];

    // เพิ่มเงื่อนไขการกรองตามวันที่สำหรับการนับ
    if (startDate) {
      countQuery += " AND workout_date >= ?";
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += " AND workout_date <= ?";
      countParams.push(endDate);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].total;

    // ถ้าต้องการข้อมูลรายละเอียดการบันทึกท่าออกกำลังกาย
    if (includeDetails && logs.length > 0) {
      for (const log of logs) {
        // ดึงข้อมูลท่าออกกำลังกายที่บันทึกในแต่ละบันทึก
        const [exercises] = await pool.query(
          `SELECT el.*, e.name as exercise_name, e.thai_name 
           FROM exercise_log el 
           LEFT JOIN exercises e ON el.exercise_id = e.id 
           WHERE el.workout_log_id = ? 
           ORDER BY el.exercise_order`,
          [log.workout_log_id]
        );

        // เพิ่มข้อมูลท่าออกกำลังกายลงในบันทึก
        log.exercises = exercises;
      }
    }

    // คืนค่าผลลัพธ์ในรูปแบบมาตรฐาน
    return {
      success: true,
      data: {
        logs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + logs.length < totalCount,
        },
      },
      message:
        logs.length > 0
          ? "ดึงข้อมูลบันทึกการออกกำลังกายสำเร็จ"
          : "ไม่พบบันทึกการออกกำลังกายของสมาชิกนี้",
    };
  } catch (error) {
    // จัดการข้อผิดพลาดตามประเภท
    if (error instanceof z.ZodError) {
      console.error("ข้อมูลไม่ถูกต้อง:", error.errors);
      return {
        success: false,
        error: "validation_error",
        validationErrors: error.errors,
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก",
      };
    }

    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกการออกกำลังกาย:", error);
    return {
      success: false,
      error: "database_error",
      message:
        "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกการออกกำลังกาย กรุณาลองใหม่อีกครั้ง",
    };
  }
}

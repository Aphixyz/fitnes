"use server";

import pool from "@/lib/db";

export const deleteMember = async (trainerId, memberId) => {
  const connection = await pool.getConnection();

  try {
    // แปลงเป็นตัวเลข
    const trainerIdNum = parseInt(trainerId, 10);
    const memberIdNum = parseInt(memberId, 10);

    if (isNaN(trainerIdNum) || isNaN(memberIdNum)) {
      return {
        success: false,
        message: "Invalid trainerId or memberId",
      };
    }

    // ตรวจสอบว่า member นี้อยู่ภายใต้ trainer นี้จริงหรือไม่
    const [checkResult] = await connection.query(
      `SELECT r.registration_id 
         FROM registration r 
         WHERE r.trainer_id = ? AND r.member_id = ? AND r.registration_status = 'active'`,
      [trainerIdNum, memberIdNum]
    );

    if (checkResult.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลสมาชิกที่ต้องการลบ",
      };
    }

    // เริ่ม transaction เพื่อลบข้อมูล
    await connection.beginTransaction();

    try {
      // ลบข้อมูล registration ก่อน (เนื่องจากมี FK constraint)
      await connection.query(
        "DELETE FROM registration WHERE trainer_id = ? AND member_id = ?",
        [trainerIdNum, memberIdNum]
      );

      // ลบข้อมูล member
      await connection.query("DELETE FROM member WHERE member_id = ?", [
        memberIdNum,
      ]);

      await connection.commit();

      return {
        success: true,
        message: "ลบข้อมูลสมาชิกเรียบร้อยแล้ว",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูลสมาชิก",
      error: error.message,
    };
  } finally {
    connection.release();
  }
};

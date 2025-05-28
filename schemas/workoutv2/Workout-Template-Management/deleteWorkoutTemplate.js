"use server";

import db from "@/lib/db";

/**
 * ลบเทมเพลตโปรแกรมออกกำลังกาย และข้อมูลที่เกี่ยวข้อง
 * @param {number} templateId - รหัสเทมเพลต
 * @param {number} trainerId - รหัสเทรนเนอร์ (ใช้ตรวจสอบสิทธิ์)
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
export async function deleteWorkoutTemplate(templateId, trainerId) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!templateId || !trainerId) {
      throw new Error("กรุณาระบุรหัสเทมเพลตและรหัสเทรนเนอร์");
    }

    // ตรวจสอบว่าเทมเพลตนี้เป็นของเทรนเนอร์นี้หรือไม่
    const [templates] = await db.query(
      `SELECT template_id, template_name FROM workout_template 
       WHERE template_id = ? AND trainer_id = ?`,
      [templateId, trainerId]
    );

    if (templates.length === 0) {
      throw new Error(
        "ไม่พบเทมเพลตที่ระบุ หรือคุณไม่มีสิทธิ์ในการลบเทมเพลตนี้"
      );
    }

    const templateName = templates[0].template_name;

    // ตรวจสอบว่ามี workout_plan ที่ใช้เทมเพลตนี้อยู่หรือไม่
    const [relatedPlans] = await db.query(
      `SELECT COUNT(*) as count FROM workout_plan WHERE template_id = ?`,
      [templateId]
    );

    const hasRelatedPlans = relatedPlans[0].count > 0;

    // เริ่ม Transaction
    await db.query("START TRANSACTION");

    try {
      // ถ้ามีแผนที่ใช้เทมเพลตนี้ ให้อัปเดต workout_plan ให้ template_id เป็น NULL
      if (hasRelatedPlans) {
        await db.query(
          `UPDATE workout_plan SET template_id = NULL WHERE template_id = ?`,
          [templateId]
        );
      }

      // ลบข้อมูลท่าออกกำลังกายในเทมเพลต (template_exercise)
      // เราต้องลบ template_exercise ก่อนลบ template_session เพราะมี foreign key constraint
      await db.query(
        `DELETE te FROM template_exercise te
         JOIN template_session ts ON te.session_id = ts.session_id
         WHERE ts.template_id = ?`,
        [templateId]
      );

      // ลบข้อมูลเซสชันในเทมเพลต (template_session)
      await db.query(`DELETE FROM template_session WHERE template_id = ?`, [
        templateId,
      ]);

      // ลบเทมเพลตหลัก
      await db.query(`DELETE FROM workout_template WHERE template_id = ?`, [
        templateId,
      ]);

      // ยืนยันการทำรายการ
      await db.query("COMMIT");

      return {
        success: true,
        message: `ลบเทมเพลต "${templateName}" สำเร็จ${
          hasRelatedPlans ? " และอัปเดตแผนที่เกี่ยวข้องแล้ว" : ""
        }`,
        hasRelatedPlans,
      };
    } catch (error) {
      // ยกเลิกการทำรายการหากเกิดข้อผิดพลาด
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting workout template:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการลบเทมเพลตโปรแกรมการออกกำลังกาย",
    };
  }
}

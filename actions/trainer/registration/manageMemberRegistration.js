"use server";

import db from "@/lib/db";

/**
 * ดึงรายการลงทะเบียนทั้งหมดของเทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {string|null} status - สถานะการลงทะเบียนที่ต้องการดึง (optional: 'pending', 'paid', 'active', 'expired')
 * @returns {Promise<Object>} - รายการลงทะเบียน
 */
export async function getTrainerRegistrations(trainerId, status = null) {
  try {
    if (!trainerId) {
      throw new Error("กรุณาระบุรหัสเทรนเนอร์");
    }

    let query = `
      SELECT r.*, 
             m.member_firstname, 
             m.member_lastname, 
             m.member_email, 
             m.member_phone, 
             m.member_profileimage 
      FROM registration r
      LEFT JOIN member m ON r.member_id = m.member_id
      WHERE r.trainer_id = ?
    `;

    const queryParams = [trainerId];

    if (status !== null) {
      query += ` AND r.registration_status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY 
      CASE 
        WHEN r.registration_status = 'pending' THEN 1
        WHEN r.registration_status = 'paid' THEN 2
        WHEN r.registration_status = 'active' THEN 3
        ELSE 4
      END, 
      r.registration_id DESC`;

    const [registrations] = await db.query(query, queryParams);

    return {
      success: true,
      registrations: registrations.map((reg) => ({
        ...reg,
        member_name: reg.member_id
          ? `${reg.member_firstname || ""} ${reg.member_lastname || ""}`.trim()
          : "ไม่ทราบชื่อ", // ถ้าไม่มี member_id ให้ใช้ค่าเริ่มต้น
        member_email: reg.member_id ? reg.member_email || "" : "",
        is_pending: reg.registration_status === "pending",
        is_paid: reg.registration_status === "paid",
        is_active: reg.registration_status === "active",
        is_expired:
          reg.registration_status === "expired" ||
          (reg.registration_status === "active" &&
            reg.registration_enddate &&
            new Date(reg.registration_enddate) < new Date()),
      })),
    };
  } catch (error) {
    console.error("Error fetching trainer registrations:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน",
    };
  }
}

/**
 * อัปเดตสถานะการลงทะเบียน
 * @param {Object} data - ข้อมูลการอัปเดต
 * @param {number} data.registrationId - รหัสการลงทะเบียน
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {string} data.newStatus - สถานะใหม่ ('pending', 'paid', 'active', 'expired')
 * @returns {Promise<Object>} - ผลลัพธ์การอัปเดต
 */
export async function updateRegistrationStatus(data) {
  try {
    const { registrationId, trainerId, newStatus } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!registrationId || !trainerId || !newStatus) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบสถานะใหม่ที่ระบุ
    const validStatuses = ["pending", "paid", "active", "expired"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        "สถานะไม่ถูกต้อง ต้องเป็น 'pending', 'paid', 'active', หรือ 'expired'"
      );
    }

    // ตรวจสอบว่าการลงทะเบียนนี้เป็นของเทรนเนอร์คนนี้จริงหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id FROM registration 
       WHERE registration_id = ? AND trainer_id = ?`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการอัปเดต");
    }

    // อัปเดตสถานะ
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = ? 
       WHERE registration_id = ?`,
      [newStatus, registrationId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error("ไม่สามารถอัปเดตสถานะการลงทะเบียนได้");
    }

    return {
      success: true,
      message: `อัปเดตสถานะการลงทะเบียนเป็น '${newStatus}' สำเร็จ`,
    };
  } catch (error) {
    console.error("Error updating registration status:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการลงทะเบียน",
    };
  }
}

/**
 * ยืนยันการลงทะเบียนของสมาชิก และสร้างบัญชีสมาชิกในตาราง member
 * @param {Object} data - ข้อมูลการยืนยัน
 * @param {number} data.registrationId - รหัสการลงทะเบียน
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {string} data.startDate - วันเริ่มต้นสัญญา
 * @param {number} data.packages_id - รหัสแพ็คเกจ
 * @returns {Promise<Object>} - ผลลัพธ์การยืนยัน
 */
export async function confirmRegistration(data) {
  try {
    const { registrationId, trainerId, startDate, packages_id } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!registrationId || !trainerId || !startDate || !packages_id) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ดึงข้อมูลแพ็คเกจเพื่อคำนวณระยะเวลา
    const [packageCheck] = await db.query(
      "SELECT packages_duration_months FROM packages WHERE packages_id = ? AND trainer_id = ?",
      [packages_id, trainerId]
    );

    if (!packageCheck || packageCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลแพ็คเกจหรือแพ็คเกจไม่ถูกต้อง");
    }

    // ตรวจสอบวันที่เริ่มต้น
    const packageDuration = packageCheck[0].packages_duration_months;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new Error("รูปแบบวันที่เริ่มต้นไม่ถูกต้อง");
    }

    // คำนวณวันที่สิ้นสุดจาก packageDuration (จำนวนเดือน)
    const end = new Date(start);
    end.setMonth(start.getMonth() + packageDuration);

    // ดึงข้อมูลการลงทะเบียนและตรวจสอบว่าเป็นของเทรนเนอร์คนนี้จริงหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id, member_id FROM registration 
       WHERE registration_id = ? AND trainer_id = ? AND registration_status IN ('pending', 'paid')`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการยืนยัน");
    }

    const registrationData = registrationCheck[0];

    // ถ้าไม่มีข้อมูล member_id ในตาราง registration แสดงว่าต้องสร้างสมาชิกใหม่
    if (!registrationData.member_id) {
      throw new Error("ไม่พบ member_id ในข้อมูลการลงทะเบียน กรุณาตรวจสอบข้อมูล");
    }

    // อัปเดตสถานะและวันที่เริ่มต้น-สิ้นสุดในตาราง registration
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 'active', 
           registration_startdate = ?, 
           registration_enddate = ?
       WHERE registration_id = ?`,
      [startDate, end.toISOString().slice(0, 19).replace("T", " "), registrationId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error("ไม่สามารถยืนยันการลงทะเบียนได้");
    }

    return {
      success: true,
      message: "ยืนยันการลงทะเบียนสำเร็จ",
    };
  } catch (error) {
    console.error("Error confirming registration:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการยืนยันการลงทะเบียน",
    };
  }
}

export async function getPackageDuration(packages_id, trainerId) {
  try {
    const [packageCheck] = await db.query(
      "SELECT packages_duration_months FROM packages WHERE packages_id = ? AND trainer_id = ?",
      [packages_id, trainerId]
    );

    if (!packageCheck || packageCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลแพ็คเกจ");
    }

    return packageCheck[0].packages_duration_months;
  } catch (error) {
    console.error("Error fetching package duration:", error);
    throw error;
  }
}

/**
 * ปฏิเสธการลงทะเบียนของสมาชิก
 * @param {number} registrationId - รหัสการลงทะเบียน
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - ผลลัพธ์การปฏิเสธ
 */
export async function rejectRegistration(registrationId, trainerId) {
  try {
    if (!registrationId || !trainerId) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบว่าการลงทะเบียนนี้เป็นของเทรนเนอร์คนนี้จริงหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id, member_id FROM registration 
       WHERE registration_id = ? AND trainer_id = ? AND registration_status IN ('pending', 'paid')`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการปฏิเสธ");
    }

    // อัปเดตสถานะเป็น rejected
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 'rejected'
       WHERE registration_id = ?`,
      [registrationId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error("ไม่สามารถปฏิเสธการลงทะเบียนได้");
    }

    return {
      success: true,
      message: "ปฏิเสธการลงทะเบียนสำเร็จ",
    };
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการปฏิเสธการลงทะเบียน",
    };
  }
}

/**
 * ต่ออายุการลงทะเบียนของสมาชิก
 * @param {Object} data - ข้อมูลการต่ออายุ
 * @param {number} data.registrationId - รหัสการลงทะเบียน
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {string} data.endDate - วันสิ้นสุดสัญญาใหม่
 * @returns {Promise<Object>} - ผลลัพธ์การต่ออายุ
 */
export async function renewRegistration(data) {
  try {
    const { registrationId, trainerId, endDate } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!registrationId || !trainerId || !endDate) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบวันที่
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
    }

    const today = new Date();
    if (end <= today) {
      throw new Error("วันสิ้นสุดต้องมากกว่าวันปัจจุบัน");
    }

    // ตรวจสอบว่าการลงทะเบียนนี้เป็นของเทรนเนอร์คนนี้จริงหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id, registration_enddate FROM registration 
       WHERE registration_id = ? AND trainer_id = ?`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการต่ออายุ");
    }

    if (registrationCheck[0].registration_enddate) {
      const currentEndDate = new Date(registrationCheck[0].registration_enddate);
      if (end <= currentEndDate) {
        throw new Error("วันสิ้นสุดใหม่ต้องมากกว่าวันสิ้นสุดเดิม");
      }
    }

    // อัปเดตวันที่สิ้นสุดและสถานะ
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 'active', 
           registration_enddate = ?
       WHERE registration_id = ?`,
      [endDate, registrationId]
    );

    if (!result || result.affectedRows === 0) {
      throw new Error("ไม่สามารถต่ออายุการลงทะเบียนได้");
    }

    return {
      success: true,
      message: "ต่ออายุการลงทะเบียนสำเร็จ",
    };
  } catch (error) {
    console.error("Error renewing registration:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการต่ออายุการลงทะเบียน",
    };
  }
}

/**
 * ดึงจำนวนการลงทะเบียนแต่ละประเภทของเทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @returns {Promise<Object>} - สรุปจำนวนการลงทะเบียนแต่ละประเภท
 */
export async function getRegistrationCountsByStatus(trainerId) {
  try {
    if (!trainerId) {
      throw new Error("กรุณาระบุรหัสเทรนเนอร์");
    }

    const [result] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN registration_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN registration_status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN registration_status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN registration_status = 'expired' OR 
                 (registration_status = 'active' AND registration_enddate < NOW()) 
            THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN registration_status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM registration
       WHERE trainer_id = ?`,
      [trainerId]
    );

    if (!result || result.length === 0) {
      return {
        success: true,
        counts: {
          total: 0,
          pending: 0,
          paid: 0,
          active: 0,
          expired: 0,
          rejected: 0,
        },
      };
    }

    return {
      success: true,
      counts: result[0],
    };
  } catch (error) {
    console.error("Error getting registration counts:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนการลงทะเบียน",
    };
  }
}

/**
 * ตรวจสอบและอัพเดตสถานะการลงทะเบียนที่หมดอายุ
 * @returns {Promise<Object>} - ผลลัพธ์การอัพเดต
 */
export async function checkAndUpdateExpiredRegistrations() {
  try {
    // อัพเดตสถานะของการลงทะเบียนที่หมดอายุ (registration_status = 'active' แต่เลย registration_enddate)
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 'expired'
       WHERE registration_status = 'active' 
       AND registration_enddate < NOW()`
    );

    return {
      success: true,
      updated: result.affectedRows,
      message: `อัพเดตสถานะการลงทะเบียนที่หมดอายุแล้ว ${result.affectedRows} รายการ`,
    };
  } catch (error) {
    console.error("Error updating expired registrations:", error);
    return {
      success: false,
      message:
        error.message || "เกิดข้อผิดพลาดในการอัพเดตสถานะการลงทะเบียนที่หมดอายุ",
    };
  }
}
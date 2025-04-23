"use server";

import db from "@/lib/db";

/**
 * ดึงรายการลงทะเบียนทั้งหมดของเทรนเนอร์
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {number|null} status - สถานะการลงทะเบียนที่ต้องการดึง (optional)
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
        WHEN r.registration_status = 0 THEN 1 /* pending */
        WHEN r.registration_status = 1 THEN 2 /* active */
        ELSE 3
      END, 
      r.registration_id DESC`;

    const [registrations] = await db.query(query, queryParams);

    return {
      success: true,
      registrations: registrations.map((reg) => {
        let memberData = {};
        if (!reg.member_id && reg.member_data) {
          try {
            memberData = JSON.parse(reg.member_data);
          } catch (error) {
            console.error("Error parsing member_data:", error);
          }
        }
        return {
          ...reg,
          member_name: reg.member_id
            ? `${reg.member_firstname} ${reg.member_lastname}`
            : `${memberData.member_firstname || ""} ${
                memberData.member_lastname || ""
              }`.trim(),
          member_email: reg.member_id
            ? reg.member_email
            : memberData.member_email || "",
          is_active: reg.registration_status === 1,
          is_pending: reg.registration_status === 0,
          is_expired:
            reg.registration_status === 2 ||
            (reg.registration_status === 1 &&
              reg.registration_enddate &&
              new Date(reg.registration_enddate) < new Date()),
        };
      }),
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
 * ยืนยันการลงทะเบียนของสมาชิก
 * @param {Object} data - ข้อมูลการยืนยัน
 * @param {number} data.registrationId - รหัสการลงทะเบียน
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {string} data.startDate - วันเริ่มต้นสัญญา
 * @param {string} data.endDate - วันสิ้นสุดสัญญา
 * @returns {Promise<Object>} - ผลลัพธ์การยืนยัน
 */
/**
 * ยืนยันการลงทะเบียนของสมาชิก และสร้างบัญชีสมาชิกในตาราง member
 * @param {Object} data - ข้อมูลการยืนยัน
 * @param {number} data.registrationId - รหัสการลงทะเบียน
 * @param {number} data.trainerId - รหัสเทรนเนอร์
 * @param {string} data.startDate - วันเริ่มต้นสัญญา
 * @param {string} data.endDate - วันสิ้นสุดสัญญา
 * @returns {Promise<Object>} - ผลลัพธ์การยืนยัน
 */
export async function confirmRegistration(data) {
  try {
    const { registrationId, trainerId, startDate, endDate } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!registrationId || !trainerId || !startDate || !endDate) {
      throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    // ตรวจสอบวันที่
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
    }

    if (end <= start) {
      throw new Error("วันสิ้นสุดต้องมากกว่าวันเริ่มต้น");
    }

    // ดึงข้อมูลการลงทะเบียนและตรวจสอบว่าเป็นของเทรนเนอร์คนนี้จริงหรือไม่
    const [registrationCheck] = await db.query(
      `SELECT registration_id, member_data, member_id FROM registration 
       WHERE registration_id = ? AND trainer_id = ? AND registration_status = 0`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการยืนยัน");
    }

    const registrationData = registrationCheck[0];

    // ถ้าไม่มีข้อมูล member_id ในตาราง registration แสดงว่าต้องสร้างสมาชิกใหม่
    if (!registrationData.member_id) {
      // ตรวจสอบว่ามีข้อมูล member_data
      if (!registrationData.member_data) {
        throw new Error("ไม่พบข้อมูลการลงทะเบียน");
      }

      // แปลงข้อมูล JSON เป็น object
      let memberData;
      try {
        memberData = JSON.parse(registrationData.member_data);
      } catch (e) {
        throw new Error("ข้อมูลการลงทะเบียนไม่ถูกต้อง");
      }

      // เริ่ม transaction
      await db.query("START TRANSACTION");

      try {
        // บันทึกข้อมูลสมาชิกใหม่ลงในตาราง member
        const [memberResult] = await db.query(
          `INSERT INTO member 
           (member_username, member_password, member_firstname, member_lastname, 
            member_email, member_phone, member_gender, member_dob, 
            member_profileimage, member_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            memberData.member_username,
            memberData.member_password, // รหัสผ่านที่เข้ารหัสแล้วจาก registerNewMember
            memberData.member_firstname,
            memberData.member_lastname,
            memberData.member_email,
            memberData.member_phone || null,
            memberData.member_gender || null,
            memberData.member_dob || null,
            memberData.memberprofile_image || null,
          ]
        );

        if (!memberResult || !memberResult.insertId) {
          throw new Error("ไม่สามารถสร้างบัญชีสมาชิกได้");
        }

        const memberId = memberResult.insertId;

        // อัปเดต member_id ในตาราง registration
        const [updateResult] = await db.query(
          `UPDATE registration 
           SET member_id = ? 
           WHERE registration_id = ?`,
          [memberId, registrationId]
        );

        if (!updateResult || updateResult.affectedRows === 0) {
          throw new Error("ไม่สามารถอัปเดต member_id ในตาราง registration ได้");
        }

        // อัพเดต member_id, สถานะ และวันที่เริ่มต้น-สิ้นสุดในตาราง registration
        // registration_status: 1 = active
        const [updateResult2] = await db.query(
          `UPDATE registration 
           SET registration_status = 1, 
               registration_startdate = ?, 
               registration_enddate = ?,
               member_id = ?
           WHERE registration_id = ?`,
          [startDate, endDate, memberId, registrationId]
        );

        if (!updateResult2 || updateResult2.affectedRows === 0) {
          throw new Error("ไม่สามารถอัพเดตข้อมูลการลงทะเบียนได้");
        }

        // Commit transaction
        await db.query("COMMIT");

        return {
          success: true,
          message: "ยืนยันการลงทะเบียนสำเร็จ บัญชีสมาชิกถูกสร้างแล้ว",
        };
      } catch (error) {
        // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
        await db.query("ROLLBACK");
        throw error;
      }
    } else {
      // กรณีที่มี member_id อยู่แล้ว (กรณีมีการปรับปรุงระบบใหม่)
      // อัพเดตสถานะและวันที่เริ่มต้น-สิ้นสุด
      const [result] = await db.query(
        `UPDATE registration 
         SET registration_status = 1, 
             registration_startdate = ?, 
             registration_enddate = ?
         WHERE registration_id = ?`,
        [startDate, endDate, registrationId]
      );

      if (!result || result.affectedRows === 0) {
        throw new Error("ไม่สามารถยืนยันการลงทะเบียนได้");
      }

      return {
        success: true,
        message: "ยืนยันการลงทะเบียนสำเร็จ",
      };
    }
  } catch (error) {
    console.error("Error confirming registration:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการยืนยันการลงทะเบียน",
    };
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
       WHERE registration_id = ? AND trainer_id = ? AND registration_status = 0`,
      [registrationId, trainerId]
    );

    if (!registrationCheck || registrationCheck.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือไม่มีสิทธิ์ในการปฏิเสธ");
    }

    // อัพเดตสถานะ
    // registration_status: 3 = rejected
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 3
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
      const currentEndDate = new Date(
        registrationCheck[0].registration_enddate
      );
      if (end <= currentEndDate) {
        throw new Error("วันสิ้นสุดใหม่ต้องมากกว่าวันสิ้นสุดเดิม");
      }
    }

    // อัพเดตวันที่สิ้นสุดและสถานะ
    // registration_status: 1 = active
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 1, 
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
        SUM(CASE WHEN registration_status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN registration_status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN registration_status = 2 OR 
                 (registration_status = 1 AND registration_enddate < NOW()) 
            THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN registration_status = 3 THEN 1 ELSE 0 END) as rejected
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
    // อัพเดตสถานะของการลงทะเบียนที่หมดอายุ (registration_status = 1 แต่เลย registration_enddate)
    // เปลี่ยนให้เป็น registration_status = 2 (expired)
    const [result] = await db.query(
      `UPDATE registration 
       SET registration_status = 2
       WHERE registration_status = 1 
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

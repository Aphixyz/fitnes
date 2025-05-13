"use server"; 

import db from "@/lib/db"; // นำเข้าการเชื่อมต่อฐานข้อมูล

export async function getMemberPerMonth() {
  try {
    const [rows] = await db.query(`
      SELECT
        member.member_id,
        member.member_firstname,
        member.member_lastname,
        member.member_profileimage,
        registration.registration_startdate
      FROM
        registration
      INNER JOIN
        member
        ON registration.member_id = member.member_id
      WHERE
        MONTH(registration.registration_startdate) = MONTH(CURDATE())
        AND YEAR(registration.registration_startdate) = YEAR(CURDATE())
    `);
    return { success: true, data: rows };
  } catch (error) {
    console.error(error);
    return { success: false, message: "ไม่สามารถดึงข้อมูลสมาชิกใหม่ได้" };
  }
}


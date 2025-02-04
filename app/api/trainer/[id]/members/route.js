import pool from '../../../../lib/db.js';

export async function GET(req, { params }) {
  try {
    // ใช้ await เพื่อรอค่าของ params.id
    const { id } = await params;

    // ตรวจสอบว่า Trainer ID มีอยู่ในระบบหรือไม่
    const [trainer] = await pool.query(`SELECT * FROM trainer WHERE trainer_id = ?`, [id]);
    if (trainer.length === 0) {
      return new Response(JSON.stringify({ error: `Trainer with ID ${id} does not exist` }), { status: 404 });
    }

    // ดึงข้อมูลสมาชิกของ Trainer
    const [members] = await pool.query(
      `SELECT 
        m.member_id,
        r.registration_id, 
        m.member_firstname AS firstname, 
        m.member_lastname AS lastname, 
        m.member_email AS email, 
        m.member_phone AS phone,
        r.registration_status AS status,
        r.registration_startdate AS start,
        r.registration_enddate AS end
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      WHERE r.trainer_id = ?`,
      [id]
    );

    // ตรวจสอบและอัปเดตสถานะเป็น "หมดอายุ" ถ้า train_enddate เกินวันปัจจุบัน
    const today = new Date().toISOString().slice(0, 10);

    let updatedMembers = [];
    for (let member of members) {
      if (
        member.registration_enddate &&
        new Date(member.registration_enddate) < new Date(today) &&
        member.registration_status === 1
      ) {
        await pool.query(
          `UPDATE registration SET registration_status = 2 WHERE registration_id = ?`,
          [member.registration_id]
        );
        member.registration_status = 2; // อัปเดตใน response
      }
      updatedMembers.push(member);
    }

    return new Response(JSON.stringify({ members: updatedMembers }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch members", details: error.message }),
      { status: 500 }
    );
  }
}

// ✅ [PATCH] Trainer กดยืนยันการสมัคร และกำหนดวันที่เริ่มต้น/สิ้นสุด
export async function PATCH(req) {
  try {
    const { registration_id, registration_startdate, registration_enddate } = await req.json();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (!registration_id || !registration_startdate || !registration_enddate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ตรวจสอบว่า registration_id มีอยู่และยังไม่ได้รับการยืนยัน
    const [registration] = await pool.query(
      `SELECT registration_status FROM registration WHERE registration_id = ?`,
      [registration_id]
    );

    if (registration.length === 0) {
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404 }
      );
    }

    let currentStatus = registration[0].registration_status;

    // ถ้าสถานะเป็น 0 (ยังไม่ยืนยัน) ให้ทำการอัปเดต
    if (currentStatus === 0) {
      // ตรวจสอบว่าวันสิ้นสุดหมดอายุหรือยัง
      let newStatus = new Date(registration_enddate) < new Date(today) ? 2 : 1;

      const [result] = await pool.query(
        `UPDATE registration 
        SET registration_status = ?, registration_startdate = ?, registration_enddate = ? 
        WHERE registration_id = ?`,
        [newStatus, registration_startdate, registration_enddate, registration_id]
      );

      if (result.affectedRows === 0) {
        return new Response(
          JSON.stringify({ error: "Failed to update registration" }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Registration updated successfully",
          newStatus,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Registration already processed" }),
      { status: 400 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to update registration",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
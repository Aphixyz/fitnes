import crypto from 'crypto';
import pool from '../../../../lib/db';

// ฟังก์ชันตรวจสอบ Hash
function verifyHash(trainer_id, registration_id, hash) {
  const secret = process.env.HASH_SECRET_KEY; // ใช้คีย์ลับเดียวกัน
  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(`${trainer_id}-${registration_id}`)
    .digest('hex');

  return hash === generatedHash;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      trainer_id, 
      registration_id, 
      hash, 
      member_username, 
      member_password, 
      member_firstname, 
      member_lastname, 
      member_email, 
      member_phone, 
      member_gender, 
      member_dob 
    } = body;

    // ตรวจสอบว่าข้อมูลที่จำเป็นครบหรือไม่
    if (!trainer_id || !registration_id || !hash || !member_username || !member_password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // ตรวจสอบ Hash
    if (!verifyHash(trainer_id, registration_id, hash)) {
      return new Response(JSON.stringify({ error: "Invalid or tampered link" }), { status: 400 });
    }

    // เพิ่มข้อมูลสมาชิกในฐานข้อมูล
    const [resMember] = await pool.query(
      `INSERT INTO member (member_username, member_password, member_firstname, member_lastname, member_email, member_phone, member_gender, member_dob) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_username, member_password, member_firstname, member_lastname, member_email, member_phone, member_gender, member_dob]
    );

    // ตรวจสอบการเพิ่มข้อมูลสมาชิก
    if (!resMember.insertId) {
      return new Response(JSON.stringify({ error: "Failed to create member" }), { status: 500 });
    }

    // อัปเดตคำขอในฐานข้อมูล
    const result = await pool.query(
      `UPDATE registration SET member_id = ?, registration_status = 'approved' WHERE registration_id = ? AND trainer_id = ?`,
      [resMember.insertId, registration_id, trainer_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Invalid registration or trainer ID" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Registration successful" }), { status: 200 });
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({ error: "Failed to register", details: error.message }),
      { status: 500 }
    );
  }
}
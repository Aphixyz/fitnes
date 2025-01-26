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

    if (!trainer_id || !registration_id || !hash) {
      return new Response(JSON.stringify({ error: "Trainer ID, Registration ID, and Hash are required" }), { status: 400 });
    }

    // ตรวจสอบ Hash
    if (!verifyHash(trainer_id, registration_id, hash)) {
      return new Response(JSON.stringify({ error: "Invalid or tampered link" }), { status: 400 });
    }

    // เพิ่มข้อมูลสมาชิก
    const [resMember] = await pool.query(
        `INSERT INTO member (member_username, member_password, member_firstname, member_lastname, member_email, member_phone, member_gender, member_dob) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [member_username, member_password, member_firstname, member_lastname, member_email, member_phone, member_gender, member_dob]
    );

    // อัปเดตคำขอในฐานข้อมูล
    await pool.query(
      `UPDATE registration SET member_id = ?, registration_status = 'approved' WHERE registration_id = ?`,
      [resMember.insertId, registration_id]
    );

    return new Response(JSON.stringify({ message: "Registration successful" }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to register", details: error.message }),
      { status: 500 });
  }
}
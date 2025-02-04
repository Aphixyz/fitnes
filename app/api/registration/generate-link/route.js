import crypto from 'crypto';
import pool from '../../../../lib/db';

// ฟังก์ชันสร้าง Hash
function createHash(trainer_id, registration_id) {
  const secret = process.env.HASH_SECRET_KEY; // เก็บคีย์ลับใน .env
  return crypto
    .createHmac('sha256', secret)
    .update(`${trainer_id}-${registration_id}`)
    .digest('hex');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { trainer_id } = body;
    
    if (!trainer_id) {
      return new Response(JSON.stringify({ error: "Trainer ID is required" }), { status: 400 });
    }

    // ตรวจสอบว่า Trainer มีอยู่จริง
    const [trainer] = await pool.query(`SELECT * FROM trainer WHERE trainer_id = ?`, [trainer_id]);
    if (trainer.length === 0) {
      return new Response(JSON.stringify({ error: `Trainer with ID ${trainer_id} does not exist` }), { status: 404 });
    }

    // เพิ่มคำขอใหม่ในฐานข้อมูล
    const [res] = await pool.query(
      `INSERT INTO registration (trainer_id, member_id) VALUES (?, NULL)`,
      [trainer_id]
    );

    const registration_id = res.insertId;
    const hash = createHash(trainer_id, registration_id);
    const link = `http://localhost:3000/member/registration?trainer_id=${trainer_id}&registration_id=${registration_id}&hash=${hash}`;

    return new Response(
      JSON.stringify({ message: "Link generated successfully", link }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate link", details: error.message }), { status: 500 });
  }
}
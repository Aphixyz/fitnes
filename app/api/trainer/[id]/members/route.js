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
        m.member_firstname AS firstname, 
        m.member_lastname AS lastname, 
        m.member_email AS email, 
        m.member_phone AS phone, 
        r.registration_status AS status
      FROM registration r
      JOIN member m ON r.member_id = m.member_id
      WHERE r.trainer_id = ?`,
      [id]
    );

    return new Response(JSON.stringify({ members }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch members", details: error.message }),
      { status: 500 }
    );
  }
}
import crypto from 'crypto';
import pool from '../../../../lib/db.js';

export async function POST(req) {
  try {
    const { trainer_id, registration_id, hash } = await req.json();

    if (!trainer_id || !registration_id || !hash) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // สร้าง Hash ใหม่เพื่อตรวจสอบ
    const secret = process.env.HASH_SECRET_KEY;
    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(`${trainer_id}-${registration_id}`)
      .digest('hex');

    if (generatedHash !== hash) {
      return new Response(JSON.stringify({ error: 'Invalid link' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // ตรวจสอบว่ามี Registration ID อยู่หรือไม่
    const [registration] = await pool.query(
      `SELECT * FROM registration_requests WHERE trainer_id = ? AND registration_id = ?`,
      [trainer_id, registration_id]
    );

    if (registration.length === 0) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'Valid link' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to validate link', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
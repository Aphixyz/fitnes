'use server';

import pool from '@/lib/db'; // ใช้ mysql2

export async function getTrainerByStatus(status) {
  try {
    let query = "SELECT * FROM trainer";
    let values = [];

    if (status) {
      query += " WHERE trainer_status = ?";
      values.push(status);
    }

    const [rows] = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error fetching trainer by status:", error);
    return [];
  }
}

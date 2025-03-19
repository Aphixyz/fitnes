"use server";

import { pool } from "@/lib/db";

export async function getTrainerData() {
    try {
        const [trainers] = await pool.query("SELECT * FROM trainer"); // ดึงข้อมูลทั้งหมด
        return trainers || []; // ถ้าไม่มีข้อมูล ให้คืนเป็นอาร์เรย์ว่าง
    } catch (error) {
        console.error("Error fetching trainer data:", error);
        return [];
    }
}

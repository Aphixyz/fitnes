"use server";

import { pool } from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ ใช้ bcryptjs ถ้า bcrypt มีปัญหา

export async function createTrainer(data) {
    try {
        const hashedPassword = await bcrypt.hash(data.trainer_password, 10);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // นับจากวันสมัครไป 30 วัน

        const [result] = await pool.query(
            `INSERT INTO trainer (
                trainer_username, 
                trainer_password, 
                trainer_firstname, 
                trainer_lastname, 
                trainer_email, 
                trainer_nickname,
                trainer_phone, 
                trainer_dob, 
                trainer_gender, 
                trainer_exp, 
                trainer_profile_image, 
                trainer_bio, 
                trainer_specialization, 
                trainer_certification, 
                trainer_startdate, 
                trainer_enddate, 
                trainer_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                data.trainer_username,
                hashedPassword,
                data.trainer_firstname,
                data.trainer_lastname,
                data.trainer_email,
                null, // nickname เป็นค่าว่าง
                null, // phone เป็นค่าว่าง
                null, // dob เป็นค่าว่าง
                null, // gender เป็นค่าว่าง
                null, // exp เป็นค่าว่าง
                null, // profile_image เป็นค่าว่าง
                null, // bio เป็นค่าว่าง
                null, // specialization เป็นค่าว่าง
                null, // certification เป็นค่าว่าง
                startDate, // วันสมัคร
                endDate, // วันหมดอายุ (30 วัน)
                "active" // ค่าเริ่มต้น
            ]
        );
        
        return { success: true, trainer_id: result.insertId };
    } catch (error) {
        console.error("Error creating trainer:", error);
        return { success: false, error: error.message };
    }
}

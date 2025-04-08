"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ ใช้ bcryptjs ถ้า bcrypt มีปัญหา

export async function updateTrainer(data) {
    try {
        const hashedPassword = await bcrypt.hash(data.trainer_password, 10);
        const [result] = await pool.query(
            `UPDATE trainer SET 
                trainer_username = ?,
                trainer_password = ?,
                trainer_firstname = ?,
                trainer_lastname = ?,
                trainer_email = ?,
                trainer_nickname = ?,
                trainer_phone = ?,
                trainer_dob = ?,
                trainer_gender = ?,
                trainer_exp = ?,
                trainer_profile_image = ?,
                trainer_bio = ?,
                trainer_specialization = ?,
                trainer_certification = ?,
                trainer_status = ?
            WHERE trainer_id = ?`,
            [
                data.trainer_username,
                hashedPassword,
                data.trainer_firstname,
                data.trainer_lastname,
                data.trainer_email,
                data.trainer_nickname,
                data.trainer_phone,
                data.trainer_dob,
                data.trainer_gender,
                data.trainer_exp,
                data.trainer_profile_image,
                data.trainer_bio,
                data.trainer_specialization,
                data.trainer_certification,
                data.trainer_status,
                data.trainer_id
            ]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating trainer:", error);
        return false;
    }
}
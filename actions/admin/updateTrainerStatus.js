"use server";

import pool from "@/lib/db";

export async function updateTrainerStatus() {
    try {
        await pool.query(`
            UPDATE trainer 
            SET trainer_status = 
                CASE 
                    WHEN CURRENT_TIMESTAMP BETWEEN trainer_startdate AND trainer_enddate 
                    THEN 'active' 
                    ELSE 'inactive' 
                END
        `);
        return { success: true };
    } catch (error) {
        console.error("Error updating trainer status:", error);
        return { success: false, error: error.message };
    }
}

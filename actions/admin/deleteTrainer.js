"use server";

import pool from "@/lib/db";

export async function deleteTrainer(trainerId) {
    try {
        const [result] = await pool.query("DELETE FROM trainer WHERE trainer_id = ?", [trainerId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting trainer:", error);
        return false;
    }
}
"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";

export async function deleteMember(registrationId, trainerId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ดึง member_id จาก registration
    const [registration] = await connection.query(
      "SELECT member_id FROM registration WHERE registration_id = ?",
      [registrationId]
    );

    // ลบ registration
    const [deleteRegistrationResult] = await connection.query(
      "DELETE FROM registration WHERE registration_id = ?",
      [registrationId]
    );

    if (deleteRegistrationResult.affectedRows === 0) {
      throw new Error("No registration found");
    }

    // ลบ member ที่เกี่ยวข้อง
    if (registration.length > 0) {
      await connection.query("DELETE FROM member WHERE member_id = ?", [
        registration[0].member_id,
      ]);
    }

    await connection.commit();
    revalidatePath(`/trainer/${trainerId}/members`);
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting registration and member:", error);
    return false;
  } finally {
    connection.release();
  }
}

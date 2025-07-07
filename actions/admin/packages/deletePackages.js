"use server";
import db from "@/lib/db";

export async function deletePackage(id) {
  try {
    await db.execute("DELETE FROM packages WHERE packages_id = ?", [id]);
    return { success: true };
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาดในการลบแพ็คเกจ" };
  }
}
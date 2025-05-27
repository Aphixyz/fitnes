//actions/admin/payment/uploadQRCode.js
"use server";

import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadQRCode(formData) {
  const file = formData.get("qrcode");
  if (!file || !file.name) return { success: false, message: "ไม่พบไฟล์" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name}`;
  const filepath = path.join(process.cwd(), "public", "qrcodes", filename);

  await writeFile(filepath, buffer);

  // บันทึกลงฐานข้อมูล
  await db.query("INSERT INTO payment_qrcode (payment_image_url) VALUES (?)", [filename]);

  return { success: true, image_url: `/qrcodes/${filename}` };
}

"use server";

import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function saveBase64Image(base64_data) {
  try {
    // แยกประเภทไฟล์จาก base64
    const matches = base64_data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 string");

    const mimeType = matches[1];
    const ext = mimeType.split("/")[1]; // เช่น image/png
    const buffer = Buffer.from(matches[2], "base64");

    const fileName = `trainer_${uuidv4()}.${ext}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`; // ใช้เป็น path สำหรับแสดงผลรูป
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}

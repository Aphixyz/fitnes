"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import pool from "@/lib/db";
import { formatDateForDatabase } from "@/utils/dateUtils";

// ===== Insert Progress Photo Function =====
export const insertProgressPhoto = async (formData) => {
  try {
    // ดึงข้อมูลจาก formData
    const memberId = formData.get("memberId");
    const photoType = formData.get("photoType"); // front, side, back
    const photoFile = formData.get("photoFile");
    const measurementDate =
      formData.get("measurementDate") || formatDateForDatabase();

    // Validate required fields
    if (!memberId || !photoType || !photoFile) {
      return {
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      };
    }

    // Validate photo type
    const validPhotoTypes = ["front", "side", "back"];
    if (!validPhotoTypes.includes(photoType)) {
      return {
        success: false,
        message: "ประเภทรูปภาพไม่ถูกต้อง",
      };
    }

    // Validate file type
    if (!photoFile.type.startsWith("image/")) {
      return {
        success: false,
        message: "ไฟล์ต้องเป็นรูปภาพเท่านั้น",
      };
    }

    // Convert file to buffer
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with date and timestamp
    const timestamp = Date.now();
    const fileExtension = photoFile.name.split(".").pop();
    const filename = `${measurementDate}_${photoType}_${timestamp}.${fileExtension}`;

    // Check if member_health record exists for today
    let memberHealthId;
    const [existingHealth] = await pool.execute(
      "SELECT member_health_id FROM member_health WHERE member_id = ? AND member_health_measurementdate = ?",
      [memberId, measurementDate]
    );

    if (existingHealth.length > 0) {
      // ใช้ record ที่มีอยู่แล้ว
      memberHealthId = existingHealth[0].member_health_id;
    } else {
      // สร้าง record ใหม่
      const [result] = await pool.execute(
        "INSERT INTO member_health (member_id, member_health_measurementdate) VALUES (?, ?)",
        [memberId, measurementDate]
      );
      memberHealthId = result.insertId;
    }

    // สร้างโฟลเดอร์สำหรับเก็บรูปภาพตาม member_id
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "member_health",
      memberId.toString()
    );
    await mkdir(uploadDir, { recursive: true });

    // บันทึกไฟล์
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // สร้าง path สำหรับเก็บในฐานข้อมูล
    const dbPath = `/uploads/member_health/${memberId}/${filename}`;

    // อัปเดตฐานข้อมูล
    const photoColumn = `photo_${photoType}`;
    await pool.execute(
      `UPDATE member_health SET ${photoColumn} = ? WHERE member_health_id = ?`,
      [dbPath, memberHealthId]
    );

    return {
      success: true,
      message: "บันทึกรูปภาพเรียบร้อยแล้ว",
      data: {
        memberHealthId,
        memberId,
        photoPath: dbPath,
        measurementDate,
        photoType,
        filename,
      },
    };
  } catch (error) {
    console.error("Error inserting progress photo:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกรูปภาพ",
    };
  }
};

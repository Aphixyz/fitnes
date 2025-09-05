"use server";

import { writeFile, mkdir } from "fs/promises";
import { unlink } from "fs/promises";
import { join } from "path";
import pool from "@/lib/db";

/**
 * อัปเดตข้อมูลสุขภาพของสมาชิก (ไม่มี insert ใหม่)
 * @param {Object} data - ข้อมูลที่จะอัปเดต
 * @param {number} data.healthId - PK ของ member_health (required)
 * @param {number} data.weight - น้ำหนัก (optional)
 * @param {number} data.bodyfat - เปอร์เซ็นต์ไขมัน (optional)
 * @param {number} data.chest - รอบอก (optional)
 * @param {number} data.waist - รอบเอว (optional)
 * @param {number} data.hip - รอบสะโพก (optional)
 * @param {number} data.arm - รอบแขน (optional)
 * @param {number} data.thigh - รอบต้นขา (optional)
 * @param {string} data.measurementDate - วันที่วัด (optional, format: YYYY-MM-DD)
 * @param {File} data.photoFront - รูปด้านหน้า (optional)
 * @param {File} data.photoSide - รูปด้านข้าง (optional)
 * @param {File} data.photoBack - รูปด้านหลัง (optional)
 * @param {boolean} data.removePhotoFront - ลบรูปด้านหน้า (optional)
 * @param {boolean} data.removePhotoSide - ลบรูปด้านข้าง (optional)
 * @param {boolean} data.removePhotoBack - ลบรูปด้านหลัง (optional)
 * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
 */
export async function updateHealth(data) {
  try {
    // ===== Validation =====
    const {
      healthId,
      weight,
      bodyfat,
      chest,
      waist,
      hip,
      arm,
      thigh,
      measurementDate,
      photoFront,
      photoSide,
      photoBack,
      removePhotoFront,
      removePhotoSide,
      removePhotoBack,
    } = data;

    if (!healthId) throw new Error("กรุณาระบุ healthId");

    // ต้องมี field ที่จะอัปเดตอย่างน้อย 1 อย่าง
    const hasWeight = weight !== undefined;
    const hasMetrics = [bodyfat, chest, waist, hip, arm, thigh].some(
      (v) => v !== undefined
    );
    const hasPhotos = photoFront || photoSide || photoBack;
    const hasRemovePhoto =
      removePhotoFront || removePhotoSide || removePhotoBack;
    const hasDate = measurementDate !== undefined;
    if (!hasWeight && !hasMetrics && !hasPhotos && !hasRemovePhoto && !hasDate) {
      throw new Error("กรุณาระบุข้อมูลที่ต้องการอัปเดตอย่างน้อย 1 อย่าง");
    }

    // ===== Check Existing Record by healthId =====
    const [existingRecord] = await pool.query(
      `SELECT * FROM member_health WHERE member_health_id = ?`,
      [healthId]
    );
    if (!existingRecord.length) throw new Error("ไม่พบข้อมูลสำหรับอัปเดต");
    const record = existingRecord[0];
    const memberId = record.member_id;
    const validDate = measurementDate || record.member_health_measurementdate;

    // ===== Update Logic =====
    const updateFields = [];
    const updateValues = [];
    if (hasWeight) {
      if (weight > 999.99)
        throw new Error("น้ำหนักไม่สามารถเกิน 999.99 กิโลกรัม");
      updateFields.push("member_health_weight = ?");
      updateValues.push(weight);
    }
    if (bodyfat !== undefined) {
      if (bodyfat < 0 || bodyfat > 100)
        throw new Error("เปอร์เซ็นต์ไขมันต้องอยู่ระหว่าง 0-100%");
      updateFields.push("member_health_bodyfat = ?");
      updateValues.push(bodyfat);
    }
    if (chest !== undefined) {
      updateFields.push("member_health_chest = ?");
      updateValues.push(chest);
    }
    if (waist !== undefined) {
      updateFields.push("member_health_waist = ?");
      updateValues.push(waist);
    }
    if (hip !== undefined) {
      updateFields.push("member_health_hip = ?");
      updateValues.push(hip);
    }
    if (arm !== undefined) {
      updateFields.push("member_health_arm = ?");
      updateValues.push(arm);
    }
    if (thigh !== undefined) {
      updateFields.push("member_health_thigh = ?");
      updateValues.push(thigh);
    }
    if (measurementDate !== undefined) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(measurementDate)) {
        throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD");
      }
      const date = new Date(measurementDate);
      if (isNaN(date.getTime())) {
        throw new Error("วันที่ไม่ถูกต้อง");
      }
      updateFields.push("member_health_measurementdate = ?");
      updateValues.push(measurementDate);
    }
    if (updateFields.length > 0) {
      updateValues.push(healthId);
      await pool.query(
        `UPDATE member_health SET ${updateFields.join(
          ", "
        )} WHERE member_health_id = ?`,
        updateValues
      );
    }
    // ===== ลบรูป (set NULL) และลบไฟล์จริง =====
    if (removePhotoFront) {
      // 1. Query path เดิม
      const [rows] = await pool.query(
        "SELECT photo_front FROM member_health WHERE member_health_id = ?",
        [healthId]
      );
      const photoPath = rows[0]?.photo_front;
      if (photoPath) {
        const absPath = join(process.cwd(), "public", photoPath);
        try {
          await unlink(absPath);
        } catch (err) {
          if (err.code !== "ENOENT")
            console.error("ลบไฟล์ front ไม่สำเร็จ:", err);
        }
      }
      await pool.query(
        `UPDATE member_health SET photo_front = NULL WHERE member_health_id = ?`,
        [healthId]
      );
    }
    if (removePhotoSide) {
      const [rows] = await pool.query(
        "SELECT photo_side FROM member_health WHERE member_health_id = ?",
        [healthId]
      );
      const photoPath = rows[0]?.photo_side;
      if (photoPath) {
        const absPath = join(process.cwd(), "public", photoPath);
        try {
          await unlink(absPath);
        } catch (err) {
          if (err.code !== "ENOENT")
            console.error("ลบไฟล์ side ไม่สำเร็จ:", err);
        }
      }
      await pool.query(
        `UPDATE member_health SET photo_side = NULL WHERE member_health_id = ?`,
        [healthId]
      );
    }
    if (removePhotoBack) {
      const [rows] = await pool.query(
        "SELECT photo_back FROM member_health WHERE member_health_id = ?",
        [healthId]
      );
      const photoPath = rows[0]?.photo_back;
      if (photoPath) {
        const absPath = join(process.cwd(), "public", photoPath);
        try {
          await unlink(absPath);
        } catch (err) {
          if (err.code !== "ENOENT")
            console.error("ลบไฟล์ back ไม่สำเร็จ:", err);
        }
      }
      await pool.query(
        `UPDATE member_health SET photo_back = NULL WHERE member_health_id = ?`,
        [healthId]
      );
    }

    // ===== อัปโหลดรูป =====
    const uploadedPhotos = {};
    const photoTypes = [
      { key: "photoFront", type: "front", file: photoFront },
      { key: "photoSide", type: "side", file: photoSide },
      { key: "photoBack", type: "back", file: photoBack },
    ];
    for (const photoData of photoTypes) {
      if (photoData.file) {
        try {
          if (!photoData.file.type.startsWith("image/")) continue; // type check
          const bytes = await photoData.file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const timestamp = Date.now();
          const fileExtension = photoData.file.name.split(".").pop();
          const filename = `${validDate}_${photoData.type}_${timestamp}.${fileExtension}`;
          const uploadDir = join(
            process.cwd(),
            "public",
            "uploads",
            "member_health",
            memberId.toString()
          );
          await mkdir(uploadDir, { recursive: true });
          const filePath = join(uploadDir, filename);
          await writeFile(filePath, buffer);
          const dbPath = `/uploads/member_health/${memberId}/${filename}`;
          const photoColumn = `photo_${photoData.type}`;
          await pool.query(
            `UPDATE member_health SET ${photoColumn} = ? WHERE member_health_id = ?`,
            [dbPath, healthId]
          );
          uploadedPhotos[photoData.type] = dbPath;
        } catch (photoError) {
          console.error(`Error uploading ${photoData.type} photo:`, photoError);
        }
      }
    }

    // ===== Prepare Response =====
    const metricsCount = [bodyfat, chest, waist, hip, arm, thigh].filter(
      (v) => v !== undefined
    ).length;
    const photosCount = Object.keys(uploadedPhotos).length;
    let message = "อัปเดตข้อมูลสุขภาพเรียบร้อยแล้ว";
    if (hasWeight && hasMetrics) {
      message += ` (น้ำหนัก, ข้อมูลสัดส่วน: ${metricsCount} ตัว)`;
    } else if (hasWeight) {
      message += ` (น้ำหนัก)`;
    } else if (hasMetrics) {
      message += ` (ข้อมูลสัดส่วน: ${metricsCount} ตัว)`;
    } else if (hasPhotos) {
      message += ` (อัปเดตรูปภาพ: ${photosCount} รูป)`;
    }
    return {
      success: true,
      member_health_id: healthId,
      member_id: memberId,
      measurement_date: validDate,
      metrics: {
        bodyfat: bodyfat ?? record.member_health_bodyfat ?? null,
        chest: chest ?? record.member_health_chest ?? null,
        waist: waist ?? record.member_health_waist ?? null,
        hip: hip ?? record.member_health_hip ?? null,
        arm: arm ?? record.member_health_arm ?? null,
        thigh: thigh ?? record.member_health_thigh ?? null,
      },
      photos: uploadedPhotos,
      summary: {
        has_weight: !!hasWeight,
        has_metrics: !!hasMetrics,
        has_photos: !!hasPhotos,
        total_metrics: metricsCount,
        total_photos: photosCount,
      },
      message,
    };
  } catch (error) {
    console.error("Error updating health data:", error);
    throw new Error(`ไม่สามารถอัปเดตข้อมูลสุขภาพได้: ${error.message}`);
  }
}

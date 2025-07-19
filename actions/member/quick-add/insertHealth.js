"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import pool from "@/lib/db";

/**
 * บันทึกข้อมูลสุขภาพของสมาชิก (รวมน้ำหนัก, metric, รูปภาพ)
 * Smart INSERT/UPDATE: ถ้ามี record อยู่แล้วจะ UPDATE แทนการสร้างใหม่
 * @param {Object} data - ข้อมูลที่จะบันทึก
 * @param {number} data.memberId - รหัสสมาชิก (required)
 * @param {number} data.weight - น้ำหนัก (กิโลกรัม) (optional)
 * @param {string} data.measurementDate - วันที่บันทึก (YYYY-MM-DD) ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน
 * @param {number} data.bodyfat - เปอร์เซ็นต์ไขมันในร่างกาย (optional)
 * @param {number} data.chest - รอบอก (cm) (optional)
 * @param {number} data.waist - รอบเอว (cm) (optional)
 * @param {number} data.hip - รอบสะโพก (cm) (optional)
 * @param {number} data.arm - รอบแขน (cm) (optional)
 * @param {number} data.thigh - รอบต้นขา (cm) (optional)
 * @param {File} data.photoFront - รูปภาพด้านหน้า (optional)
 * @param {File} data.photoSide - รูปภาพด้านข้าง (optional)
 * @param {File} data.photoBack - รูปภาพด้านหลัง (optional)
 * @returns {Promise<Object>} ผลลัพธ์การบันทึก
 */
export async function insertHealth(data) {
  try {
    // ===== Validation =====
    const {
      memberId,
      weight,
      measurementDate,
      bodyfat,
      chest,
      waist,
      hip,
      arm,
      thigh,
      photoFront,
      photoSide,
      photoBack,
    } = data;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!memberId) {
      throw new Error("กรุณาระบุรหัสสมาชิก");
    }

    // ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 ตัว (weight, metrics, หรือ photos)
    const hasWeight = weight && weight > 0;
    const hasMetrics = bodyfat || chest || waist || hip || arm || thigh;
    const hasPhotos = photoFront || photoSide || photoBack;

    if (!hasWeight && !hasMetrics && !hasPhotos) {
      throw new Error(
        "กรุณาระบุข้อมูลอย่างน้อย 1 ตัว (น้ำหนัก, ข้อมูลสัดส่วน, หรือรูปภาพ)"
      );
    }

    // ตรวจสอบน้ำหนักถ้ามี
    if (hasWeight) {
      if (weight > 999.99) {
        throw new Error("น้ำหนักไม่สามารถเกิน 999.99 กิโลกรัม");
      }
    }

    // ตรวจสอบ metrics ถ้ามี
    if (bodyfat && (bodyfat < 0 || bodyfat > 100)) {
      throw new Error("เปอร์เซ็นต์ไขมันต้องอยู่ระหว่าง 0-100%");
    }

    // กำหนดวันที่ถ้าไม่ระบุ
    const validDate = measurementDate || new Date().toISOString().split("T")[0];

    // ตรวจสอบรูปแบบวันที่
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(validDate)) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD");
    }

    // ตรวจสอบว่าวันที่อยู่ในอนาคตหรือไม่
    const today = new Date().toISOString().split("T")[0];
    if (validDate > today) {
      throw new Error("ไม่สามารถบันทึกข้อมูลในอนาคตได้");
    }

    // ===== Check Existing Record =====
    // ตรวจสอบว่ามี record สำหรับวันนี้แล้วหรือไม่
    const [existingRecord] = await pool.query(
      `SELECT member_health_id, member_health_weight FROM member_health 
       WHERE member_id = ? AND member_health_measurementdate = ?`,
      [memberId, validDate]
    );

    let memberHealthId;
    let isNewRecord = false;
    let existingWeight = null;

    if (existingRecord.length > 0) {
      // มี record อยู่แล้ว → UPDATE
      memberHealthId = existingRecord[0].member_health_id;
      existingWeight = existingRecord[0].member_health_weight;

      // สร้าง dynamic UPDATE query เฉพาะคอลัมน์ที่มีข้อมูล
      const updateFields = [];
      const updateValues = [];

      if (weight !== undefined) {
        updateFields.push("member_health_weight = ?");
        updateValues.push(weight);
      }
      if (bodyfat !== undefined) {
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

      if (updateFields.length > 0) {
        updateValues.push(memberHealthId);
        await pool.query(
          `UPDATE member_health SET ${updateFields.join(
            ", "
          )} WHERE member_health_id = ?`,
          updateValues
        );
      }
    } else {
      // ไม่มี record → INSERT ใหม่
      const [insertResult] = await pool.query(
        `INSERT INTO member_health (
          member_id,
          member_health_weight,
          member_health_bodyfat,
          member_health_chest,
          member_health_waist,
          member_health_hip,
          member_health_arm,
          member_health_thigh,
          member_health_measurementdate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memberId,
          weight || null,
          bodyfat || null,
          chest || null,
          waist || null,
          hip || null,
          arm || null,
          thigh || null,
          validDate,
        ]
      );

      memberHealthId = insertResult.insertId;
      isNewRecord = true;
    }

    const uploadedPhotos = {};

    // ===== Handle Photo Uploads =====
    const photoTypes = [
      { key: "photoFront", type: "front", file: photoFront },
      { key: "photoSide", type: "side", file: photoSide },
      { key: "photoBack", type: "back", file: photoBack },
    ];

    for (const photoData of photoTypes) {
      if (photoData.file) {
        try {
          // Validate file type
          if (!photoData.file.type.startsWith("image/")) {
            console.warn(`ไฟล์ ${photoData.type} ไม่ใช่รูปภาพ`);
            continue;
          }

          // Convert file to buffer
          const bytes = await photoData.file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = photoData.file.name.split(".").pop();
          const filename = `${validDate}_${photoData.type}_${timestamp}.${fileExtension}`;

          // สร้างโฟลเดอร์สำหรับเก็บรูปภาพ
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
          const photoColumn = `photo_${photoData.type}`;
          await pool.query(
            `UPDATE member_health SET ${photoColumn} = ? WHERE member_health_id = ?`,
            [dbPath, memberHealthId]
          );

          uploadedPhotos[photoData.type] = dbPath;
        } catch (photoError) {
          console.error(`Error uploading ${photoData.type} photo:`, photoError);
          // ไม่ throw error เพื่อให้บันทึกข้อมูลอื่นได้
        }
      }
    }

    // ===== Prepare Response =====
    const currentWeight = weight || existingWeight;
    const metricsCount = [bodyfat, chest, waist, hip, arm, thigh].filter(
      Boolean
    ).length;
    const photosCount = Object.keys(uploadedPhotos).length;

    // สร้าง message ที่เหมาะสมกับข้อมูลที่บันทึก
    let message = "";
    if (isNewRecord) {
      if (hasWeight && hasMetrics) {
        message = `บันทึกข้อมูลสุขภาพใหม่เรียบร้อยแล้ว (น้ำหนัก: ${currentWeight} กก., ข้อมูลสัดส่วน: ${metricsCount} ตัว)`;
      } else if (hasWeight) {
        message = `บันทึกน้ำหนักใหม่เรียบร้อยแล้ว (${currentWeight} กิโลกรัม)`;
      } else if (hasMetrics) {
        message = `บันทึกข้อมูลสัดส่วนใหม่เรียบร้อยแล้ว (${metricsCount} ตัว)`;
      } else if (hasPhotos) {
        message = `บันทึกรูปภาพใหม่เรียบร้อยแล้ว (${photosCount} รูป)`;
      }
    } else {
      if (hasWeight && hasMetrics) {
        message = `อัปเดตข้อมูลสุขภาพเรียบร้อยแล้ว (น้ำหนัก: ${currentWeight} กก., ข้อมูลสัดส่วน: ${metricsCount} ตัว)`;
      } else if (hasWeight) {
        message = `อัปเดตน้ำหนักเรียบร้อยแล้ว (${currentWeight} กิโลกรัม)`;
      } else if (hasMetrics) {
        message = `อัปเดตข้อมูลสัดส่วนเรียบร้อยแล้ว (${metricsCount} ตัว)`;
      } else if (hasPhotos) {
        message = `อัปเดตรูปภาพเรียบร้อยแล้ว (${photosCount} รูป)`;
      }
    }

    const result = {
      success: true,
      member_health_id: memberHealthId,
      member_id: memberId,
      weight: currentWeight,
      measurement_date: validDate,
      is_new_record: isNewRecord,
      metrics: {
        bodyfat: bodyfat || null,
        chest: chest || null,
        waist: waist || null,
        hip: hip || null,
        arm: arm || null,
        thigh: thigh || null,
      },
      photos: uploadedPhotos,
      summary: {
        has_weight: !!currentWeight,
        has_metrics: !!hasMetrics,
        has_photos: !!hasPhotos,
        total_metrics: metricsCount,
        total_photos: photosCount,
      },
      message: message,
    };

    return result;
  } catch (error) {
    console.error("Error inserting health data:", error);
    throw new Error(`ไม่สามารถบันทึกข้อมูลสุขภาพได้: ${error.message}`);
  }
}

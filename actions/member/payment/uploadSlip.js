// actions/member/payment/uploadSlip.js
"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import db from "@/lib/db";

export async function uploadSlip(formData) {
  try {
    // ตรวจสอบข้อมูลที่ส่งมา
    const file = formData.get("file");
    const registerId = formData.get("registerId");

    console.log("Received data:", { 
      hasFile: !!file, 
      registerId, 
      fileName: file?.name,
      fileSize: file?.size 
    });

    if (!file || !registerId) {
      return { 
        success: false, 
        message: "ข้อมูลไม่ครบ - ต้องมีทั้งไฟล์และ registration ID" 
      };
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        message: "ประเภทไฟล์ไม่ถูกต้อง กรุณาอัพโหลดไฟล์ภาพ (JPG, PNG, WebP)" 
      };
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        success: false, 
        message: "ไฟล์ใหญ่เกินไป กรุณาอัพโหลดไฟล์ที่มีขนาดไม่เกิน 5MB" 
      };
    }

    // อ่านไฟล์
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // สร้างชื่อไฟล์ใหม่
    const fileExtension = path.extname(file.name);
    const filename = `slip-${registerId}-${Date.now()}${fileExtension}`;

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    const slipFolderPath = path.join(process.cwd(), "public", "slip");
    
    if (!existsSync(slipFolderPath)) {
      await mkdir(slipFolderPath, { recursive: true });
      console.log("Created slip folder:", slipFolderPath);
    }

    const filePath = path.join(slipFolderPath, filename);
    
    // บันทึกไฟล์
    await writeFile(filePath, buffer);
    console.log("File saved to:", filePath);

    // URL สำหรับเข้าถึงไฟล์
    const imageUrl = `/slip/${filename}`;
    
    console.log("Updating database:", { registerId, imageUrl });

    // อัพเดทฐานข้อมูล
    const result = await db.query(
      `UPDATE registration 
       SET slip_image = ?, 
            registration_status = 'paid',
           payment_time = NOW() 
       WHERE registration_id = ?`,
      [imageUrl, registerId]
    );

    console.log("Database update result:", result);

    // ตรวจสอบว่ามีการอัพเดทจริงหรือไม่
    if (result.affectedRows === 0) {
      return { 
        success: false, 
        message: "ไม่พบข้อมูลการลงทะเบียนที่ระบุ" 
      };
    }

    return { 
      success: true, 
      imageUrl,
      message: "อัพโหลดสลิปสำเร็จ" 
    };

  } catch (error) {
    console.error("Upload slip error:", error);
    
    // ส่งข้อความ error ที่ชัดเจนกว่า
    let errorMessage = "เกิดข้อผิดพลาดในการอัพโหลดสลิป";
    
    if (error.code === 'ENOENT') {
      errorMessage = "ไม่สามารถสร้างโฟลเดอร์สำหรับเก็บไฟล์ได้";
    } else if (error.code === 'EACCES') {
      errorMessage = "ไม่มีสิทธิ์ในการเขียนไฟล์";
    } else if (error.message.includes('ER_NO_SUCH_TABLE')) {
      errorMessage = "ไม่พบตารางในฐานข้อมูล";
    } else if (error.message.includes('ER_BAD_FIELD_ERROR')) {
      errorMessage = "โครงสร้างฐานข้อมูลไม่ถูกต้อง";
    }

    return { 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}
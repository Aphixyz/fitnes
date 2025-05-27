// api/payment/create-qr (สร้าง API ใหม่)
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { registration_id, amount = 500 } = await req.json();
    
    if (!registration_id) {
      return NextResponse.json({ error: "Registration ID required" }, { status: 400 });
    }

    // สร้าง QR Code (ใช้ service ที่คุณมีอยู่)
    const qrFilename = `qr_${registration_id}_${Date.now()}.png`;
    
    // บันทึกข้อมูล QR พร้อม registration_id
    await db.query(
      `INSERT INTO payment_qrcode (payment_image_url, registration_id, amount, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [qrFilename, registration_id, amount]
    );

    return NextResponse.json({ 
      success: true,
      qrUrl: `/qrcodes/${qrFilename}`,
      registration_id 
    });
  } catch (err) {
    console.error("Create QR Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
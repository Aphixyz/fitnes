// api/payment/latest
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT payment_image_url FROM payment_qrcode ORDER BY payment_id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "No QR Code found" }, { status: 404 });
    }

    const filename = rows[0].payment_image_url;
    return NextResponse.json({ imageUrl: `/qrcodes/${filename}` });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


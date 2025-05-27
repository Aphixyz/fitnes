// app/api/payment/webhook/route.js
import db from "@/lib/db";

export async function GET(req) {
  console.log("=== WEBHOOK GET TEST ===");
  return new Response("Webhook endpoint is working!", { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function POST(req) {
  console.log("=== WEBHOOK POST RECEIVED ===");
  
  try {
    // ลอง parse body
    let data;
    try {
      data = await req.json();
      console.log("Successfully parsed JSON:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return new Response("Invalid JSON", { status: 400 });
    }

    const { status, reference, payment_time } = data;
    
    console.log("Extracted values:");
    console.log("- Status:", status);
    console.log("- Reference:", reference);
    console.log("- Payment Time:", payment_time);
    console.log("- Reference type:", typeof reference);
    console.log("- Reference length:", reference?.length);

    // แสดงทุก key ที่มีในข้อมูล
    console.log("All available keys:", Object.keys(data));

    // ตรวจสอบว่ามี reference หรือไม่
    if (!reference) {
      console.error("No reference ID provided in webhook");
      console.error("Available data keys:", Object.keys(data));
      return new Response(`No reference ID. Available keys: ${Object.keys(data).join(', ')}`, { status: 400 });
    }

    // ตรวจสอบสถานะการชำระเงิน
    const successStatuses = ["SUCCESS", "PAID", "COMPLETED", "success", "paid", "completed"];
    if (!successStatuses.includes(status)) {
      console.log(`Payment status '${status}' is not successful. Ignoring webhook.`);
      return new Response("Payment not successful", { status: 200 });
    }

    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    try {
      console.log("Checking database connection...");
      
      // ตรวจสอบว่ามี registration_id นี้อยู่จริงหรือไม่
      const [existingRows] = await db.query(
        "SELECT registration_id, payment_status FROM registration WHERE registration_id = ?",
        [reference]
      );

      console.log("Existing registration query result:", existingRows);

      if (existingRows.length === 0) {
        console.error(`No registration found with ID: ${reference}`);
        return new Response("Registration not found", { status: 404 });
      }

      // อัปเดตสถานะการชำระเงิน
      const updateResult = await db.query(
        `UPDATE registration 
         SET payment_status = 'PAID', payment_time = ? 
         WHERE registration_id = ?`,
        [payment_time || new Date().toISOString(), reference]
      );

      console.log("Update query result:", updateResult);
      
      // ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่
      if (updateResult[0].affectedRows > 0) {
        console.log(`Successfully updated registration ${reference} to PAID status`);
        return new Response("Payment updated successfully", { status: 200 });
      } else {
        console.error("Update query executed but no rows affected");
        return new Response("Update failed - no rows affected", { status: 500 });
      }

    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }

  } catch (err) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error details:", err);
    console.error("Stack trace:", err.stack);
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}
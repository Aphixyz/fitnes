// actions/member/payment/generateQrcode.js
"use server";

import db from "@/lib/db";
export async function generateQRCode(registrationId) {
  try {
    if (!registrationId) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียน");
    }

    // ดึงข้อมูล registration พร้อมแพ็คเกจและ trainer
    const [result] = await db.query(
      `SELECT r.member_id, r.trainer_id, r.packages_id,
              p.packages_name, p.packages_price
       FROM registration r
       JOIN packages p ON r.packages_id = p.packages_id
       WHERE r.registration_id = ?`,
      [registrationId]
    );

    if (!result || result.length === 0) {
      throw new Error("ไม่พบข้อมูลการลงทะเบียนหรือแพ็คเกจ");
    }

    const data = result[0];

    // ดึงเบอร์ PromptPay
    const [promptPayResult] = await db.query(
      `SELECT promptpay_id FROM promptpay_account LIMIT 1`
    );

    if (!promptPayResult || promptPayResult.length === 0) {
      throw new Error("ยังไม่ได้ตั้งค่า PromptPay");
    }

    return {
      success: true,
      promptpayNumber: promptPayResult[0].promptpay_number,
      amount: data.packages_price,
      packageName: data.packages_name,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้าง QR Code",
    };
  }
}

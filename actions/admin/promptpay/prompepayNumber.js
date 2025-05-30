//action/admin/promptpay/prompepayNumber.js
"use server";

import db from "@/lib/db";

/**
 * บันทึกหรืออัปเดตเบอร์ PromptPay ของแอดมิน
 * @param {string} promptpayId - หมายเลข PromptPay (เบอร์โทร)
 */
export async function savePromptPayNumber(promptpayId) {
  try {
    if (!promptpayId || !/^\d{10}$/.test(promptpayId)) {
      throw new Error("กรุณาใส่หมายเลข PromptPay ให้ถูกต้อง (10 หลัก)");
    }

    // ตรวจสอบว่ามี admin อยู่แล้วหรือยัง
    const [adminRows] = await db.query(
      "SELECT account_id FROM promptpay_account WHERE account_type = 'admin' LIMIT 1"
    );

    if (adminRows.length > 0) {
      // มี admin อยู่แล้ว -> อัปเดต
      const adminId = adminRows[0].account_id;
      await db.query(
        "UPDATE promptpay_account SET promptpay_id = ?, updated_at = NOW() WHERE account_id = ?",
        [promptpayId, adminId]
      );
    } else {
      // ยังไม่มี -> แทรกใหม่
      await db.query(
        "INSERT INTO promptpay_account (promptpay_id, account_type, created_at, updated_at) VALUES (?, 'admin', NOW(), NOW())",
        [promptpayId]
      );
    }

    return {
      success: true,
      message: "บันทึกหมายเลข PromptPay สำเร็จ",
    };
  } catch (error) {
    console.error("Error saving PromptPay:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการบันทึก",
    };
  }
}
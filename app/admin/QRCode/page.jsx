// app/admin/payment-settings/page.jsx
"use client";

import { useState } from "react";
import { uploadQRCode } from "@/actions/admin/payment/uploadQRCode";

export default function PaymentSettings() {
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await uploadQRCode(formData);

    if (result.success) {
      setPreview(result.image_url);
      setMessage("อัปโหลด QR Code สำเร็จ");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">ตั้งค่า QR Code สำหรับจ่ายเงิน</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" name="qrcode" accept="image/*" required />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">อัปโหลด</button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {preview && (
        <img src={preview} alt="QR Code Preview" className="mt-4 w-64" />
      )}
    </div>
  );
}

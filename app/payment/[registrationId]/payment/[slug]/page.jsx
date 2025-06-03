//app/payment/[registerationId]/payment/page.jsx
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { generatePromptPayPayload } from "../../../../../utils/promptpay";
import Image from "next/image";
import { uploadSlip } from "@/actions/member/payment/uploadSlip";

export default function PaymentPage() {
  const r = useParams();
  const price = Number(r?.slug);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registrationId } = useParams(); // ดึง registrationId จากเส้นทาง
  const memberId = searchParams.get("memberId");
  const packageName = searchParams.get("name"); // ✅ ดึงชื่อแพ็คเกจ

  const [qr, setQrDataURL] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };
  const handleSubmit = async () => {
    if (!selectedFile || !r) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("registerId", registrationId);

    setUploading(true);
    const result = await uploadSlip(formData);
    setUploading(false);

    if (result.success) {
      setMessage("อัปโหลดสำเร็จแล้ว และสถานะถูกอัปเดตเป็น paid");

      // ✅ เปลี่ยนเส้นทางไปหน้า onboarding
      setTimeout(() => {
        router.push(`/member/${memberId}/onboarding`);
      }, 1000);
    } else {
      setMessage(result.message || "เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    const payload = generatePromptPayPayload({
      moblieNumber: process.env.NEXT_PUBLIC_PROMTPAY_NUMBER,
      amount: Number(price).toFixed(2),
    });

    QRCode.toDataURL(payload, { width: 300 }, (err, url) => {
      if (!err) setQrDataURL(url);
    });
  }, [price]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">ชำระเงินด้วย PromptPay</h1>
      <p className="mb-2 text-gray-700">แพ็คเกจ: {packageName || "ไม่ระบุ"}</p>
      <p className="mb-6 text-gray-700">จำนวนเงิน: ฿{price.toLocaleString()}</p>

      <div className="p-4 bg-white rounded-xl shadow-md">
        {qr ? (
          <Image src={qr} alt="qr" width={300} height={300} />
        ) : (
          <div className="text-red-500">เกิดข้อผิดพลาดในการสร้าง QR Code</div>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mt-8 p-6 border-dashed border-2 border-gray-400 rounded-xl w-full max-w-md text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <p>อัปโหลดไฟล์: {selectedFile.name}</p>
        ) : (
          <p>ลากและวางสลิปที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading || !selectedFile}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "กำลังอัปโหลด..." : "ยืนยันการโอน"}
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}

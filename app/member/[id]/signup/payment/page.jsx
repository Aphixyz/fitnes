"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function PaymentPage() {
  const { id: memberId } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("PENDING");
  const [qrUrl, setQrUrl] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // โหลด QR Code
  useEffect(() => {
    const loadQR = async () => {
      try {
        const res = await fetch("/api/payment/latest");
        const data = await res.json();
        console.log("QR Code response:", data);
        if (data?.imageUrl) {
          setQrUrl(data.imageUrl);
        } else {
          console.error("No QR Code URL in response");
        }
      } catch (err) {
        console.error("Failed to load QR Code:", err);
      }
    };

    loadQR();
  }, []);

  // ตรวจสถานะการชำระเงิน
  useEffect(() => {
    let retries = 0;
    const maxRetries = 180; // เพิ่มเป็น 6 นาที
    
    const checkPaymentStatus = async () => {
      try {
        console.log(`Checking payment status (attempt ${retries + 1}/${maxRetries})`);
        
        const res = await fetch(`/api/member/${memberId}/registration-status`);
        const data = await res.json();
        
        console.log("Status check response:", data);
        setRetryCount(retries + 1);

        if (data.status === "PAID") {
          console.log("Payment confirmed! Redirecting to onboarding...");
          setStatus("PAID");
          clearInterval(interval);
          router.push(`/member/${memberId}/onboarding`);
          return;
        }

        if (data.status === "NOT_FOUND") {
          console.error("Registration not found!");
          clearInterval(interval);
          alert("ไม่พบข้อมูลการลงทะเบียน");
          router.push("/");
          return;
        }

        if (data.status === "ERROR") {
          console.error("Database error:", data.message);
        }

      } catch (err) {
        console.error("Error checking payment status:", err);
      }
      
      retries++;
      if (retries > maxRetries) {
        clearInterval(interval);
        alert("ยังไม่พบการชำระเงิน กรุณาติดต่อเจ้าหน้าที่");
        router.push("/");
      }
    };

    // เช็คทันทีแล้วค่อยเช็คทุก 10 วินาที
    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 10000);

    return () => clearInterval(interval);
  }, [memberId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-2xl font-bold text-center">สแกน QR เพื่อชำระเงิน</h1>

      {qrUrl ? (
        <div className="flex flex-col items-center space-y-4">
          <img
            src={qrUrl}
            alt="PromptPay QR"
            className="w-64 h-64 border rounded-lg shadow-lg"
          />
          <p className="text-sm text-gray-600">
            สแกน QR Code นี้เพื่อชำระเงินผ่าน Mobile Banking
          </p>
        </div>
      ) : (
        <div className="w-64 h-64 border rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {status === "PENDING" && (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            รอการชำระเงิน...
          </div>
          <p className="text-sm">
            ตรวจสอบครั้งที่: {retryCount}
          </p>
          <p className="text-xs text-gray-400">
            หลังจากโอนเงินแล้ว กรุณารอสักครู่
          </p>
        </div>
      )}

      {/* ปุ่มตรวจสอบด้วยตนเอง */}
      <button
        onClick={async () => {
          try {
            const res = await fetch(`/api/member/${memberId}/registration-status`);
            const data = await res.json();
            console.log("Manual check result:", data);
            if (data.status === "PAID") {
              router.push(`/member/${memberId}/onboarding`);
            } else {
              alert(`สถานะปัจจุบัน: ${data.status}`);
            }
          } catch (err) {
            console.error("Manual check error:", err);
            alert("เกิดข้อผิดพลาดในการตรวจสอบ");
          }
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
      >
        ตรวจสอบสถานะด้วยตนเอง
      </button>

      <div className="text-xs text-gray-400 text-center max-w-md">
        <p>หากโอนเงินแล้วแต่ระบบยังไม่อัปเดต</p>
        <p>กรุณาลองกดปุ่ม "ตรวจสอบสถานะด้วยตนเอง" หรือรีเฟรชหน้า</p>
      </div>
    </div>
  );
}
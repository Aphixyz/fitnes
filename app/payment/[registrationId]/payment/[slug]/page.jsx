//app/payment/[registerationId]/payment/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { generatePromptPayPayload } from "../../../../../utils/promptpay";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { setQuarter } from "date-fns";
import Image from "next/image";
export default function PaymentPage() {
  const r = useParams();
  const price = Number(r?.slug);
  const us = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [qr, setQrDataURL] = useState("");

  useEffect(() => {
    const payload = generatePromptPayPayload({
      moblieNumber: process.env.NEXT_PUBLIC_PROMTPAY_NUMBER,
      amount: Number(price).toFixed(2),
    });
    console.log(price);

    QRCode.toDataURL(payload, { width: 300 }, (err, url) => {
      if (!err) setQrDataURL(url);
    });
  }, [price]);
  // const { promptpayNumber, amount, packageName } = data;
  // const qrText = `promptpay://${promptpayNumber}?amount=${amount}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">ชำระเงินด้วย PromptPay</h1>
      <p className="mb-2 text-gray-700">แพ็คเกจ: </p>
      <p className="mb-6 text-gray-700">จำนวนเงิน: {price}</p>

      <div className="p-4 bg-white rounded-xl shadow-md">
        {qr ? (
          <div className="">
            <Image src={qr} alt="qr" width={300} height={300} />
          </div>
        ) : (
          <div className="">เกิดข้อผิดพลาดในการ สร้าง Qr code</div>
        )}
      </div>
    </div>
  );
}

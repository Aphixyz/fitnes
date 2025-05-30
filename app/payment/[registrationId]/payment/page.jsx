//app/payment/[registerationId]/payment/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { generateQRCode } from "@/actions/member/payment/generateQrcode";
import { QRCodeCanvas } from "qrcode.react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentPage() {
  const { registrationId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      const result = await generateQRCode(registrationId);
      if (result.success) {
        setData(result);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    if (registrationId) {
      fetchQRCode();
    }
  }, [registrationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-700">กำลังโหลด QR Code...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { promptpayNumber, amount, packageName } = data;
  const qrText = `promptpay://${promptpayNumber}?amount=${amount}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">ชำระเงินด้วย PromptPay</h1>
      <p className="mb-2 text-gray-700">แพ็คเกจ: {packageName}</p>
      <p className="mb-6 text-gray-700">จำนวนเงิน: ฿{amount.toLocaleString()}</p>

      <div className="p-4 bg-white rounded-xl shadow-md">
        <QRCodeCanvas value={qrText} size={256} />
      </div>
    </div>
  );
}

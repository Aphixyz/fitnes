"use client";

import { useState } from "react";
import { savePromptPayNumber } from "@/actions/admin/promptpay/prompepayNumber";

export default function AdminPromptPayForm() {
  const [promptPay, setPromptPay] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await savePromptPayNumber(promptPay);
    setStatus(result);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">ตั้งค่า PromptPay สำหรับ Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={promptPay}
          onChange={(e) => setPromptPay(e.target.value)}
          placeholder="ใส่หมายเลขโทรศัพท์ 10 หลัก"
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          บันทึก
        </button>
      </form>
      {status && (
        <p className={`mt-4 ${status.success ? "text-green-600" : "text-red-600"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}

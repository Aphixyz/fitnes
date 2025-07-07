"use client";

import { useState } from "react";
import { addPackage } from "@/actions/admin/packages/addPackages";
import { useRouter } from "next/navigation";

export default function AddPackagePage() {
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData) {
    const result = await addPackage(formData);
    setMessage(result.message);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/packages");
      }, 1500); // รอ 1.5 วินาทีแล้วค่อยเปลี่ยนหน้า
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-center text-2xl font-semibold mb-4">เพิ่มแพ็คเกจใหม่</h1>

      {message && (
        <div
          className={`mb-4 p-3 border rounded text-sm ${
            success
              ? "text-green-700 bg-green-100 border-green-300"
              : "text-gray-700 bg-gray-100"
          }`}
        >
          {success ? "เพิ่มแพ็คเกจสำเร็จ กำลังกลับไปหน้ารายการแพ็คเกจ..." : message}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">ชื่อแพ็คเกจ</label>
          <input
            name="name"
            placeholder="เช่น แพ็คเกจ 1 เดือน"
            className="border px-3 py-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ระยะเวลา (เดือน)</label>
          <input
            type="number"
            name="duration_in_months"
            placeholder="1"
            className="border px-3 py-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ราคา (บาท)</label>
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="500"
            className="border px-3 py-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">รายละเอียด</label>
          <textarea
            name="description"
            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() => router.back()}
          >
            กลับ
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={success}
          >
            เพิ่มแพ็คเกจ
          </button>
        </div>
      </form>
    </div>
  );
}
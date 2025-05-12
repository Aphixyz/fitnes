'use client'

import { useState } from 'react'
import { addPackage } from '@/actions/trainer/packages/packages'
import { useParams } from 'next/navigation'

export default function AddPackagePage() {
  const [message, setMessage] = useState(null)
  const params = useParams()
  const id = params.id  

  async function handleSubmit(formData) {
    formData.append('trainer_id', id)
    const result = await addPackage(formData)
    setMessage(result.message)
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">เพิ่มแพ็คเกจใหม่สำหรับผู้ฝึกสอนรหัสที่:{id}</h1>
      
      {message && (
        <div className="mb-4 p-3 border rounded text-sm text-gray-700 bg-gray-100">
          {message}
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          เพิ่มแพ็คเกจ
        </button>
      </form>
    </div>
  )
}
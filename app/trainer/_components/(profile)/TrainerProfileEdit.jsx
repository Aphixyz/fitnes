// components/profile/TrainerProfileEdit.jsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTrainerProfile } from "@/actions/trainer/profile";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-4 py-2 rounded-md text-white ${
        pending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
      } transition-colors`}
    >
      {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
    </button>
  );
}

export default function TrainerProfileEdit({ trainer, onCancel, onSuccess }) {
  const initialState = { message: null, success: false };
  const [state, formAction] = useActionState(async (prevState, formData) => {
    const result = await updateTrainerProfile(prevState, formData);
    if (result.success) {
      // สร้างข้อมูลใหม่เพื่อส่งกลับไปยังหน้า View
      const updatedData = {
        trainer_firstname: formData.get("trainer_firstname"),
        trainer_lastname: formData.get("trainer_lastname"),
        trainer_email: formData.get("trainer_email"),
        trainer_phone: formData.get("trainer_phone"),
        trainer_exp: formData.get("trainer_exp"),
        trainer_status: formData.get("trainer_status"),
        trainer_bio: formData.get("trainer_bio"),
      };

      // เรียกฟังก์ชัน callback เพื่ออัพเดทข้อมูลใน parent component
      setTimeout(() => onSuccess(updatedData), 0);
    }
    return result;
  }, initialState);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        แก้ไขข้อมูลส่วนตัว
      </h2>

      {state.message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            state.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="trainer_id" value={trainer.trainer_id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="trainer_firstname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ชื่อ *
            </label>
            <input
              type="text"
              id="trainer_firstname"
              name="trainer_firstname"
              defaultValue={trainer.trainer_firstname}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="trainer_lastname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              นามสกุล *
            </label>
            <input
              type="text"
              id="trainer_lastname"
              name="trainer_lastname"
              defaultValue={trainer.trainer_lastname}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="trainer_email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              อีเมล *
            </label>
            <input
              type="email"
              id="trainer_email"
              name="trainer_email"
              defaultValue={trainer.trainer_email}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="trainer_phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="trainer_phone"
              name="trainer_phone"
              defaultValue={trainer.trainer_phone || ""}
              pattern="[0-9]{10}"
              placeholder="0891234567"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              กรอกเบอร์โทรศัพท์ 10 หลัก ไม่ต้องมีขีด
            </p>
          </div>

          <div>
            <label
              htmlFor="trainer_exp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ประสบการณ์ (ปี)
            </label>
            <input
              type="number"
              id="trainer_exp"
              name="trainer_exp"
              defaultValue={trainer.trainer_exp || ""}
              min="0"
              max="100"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="trainer_status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              สถานะ
            </label>
            <select
              id="trainer_status"
              name="trainer_status"
              defaultValue={trainer.trainer_status || "active"}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="on leave">ลาพัก</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="trainer_bio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ประวัติโดยย่อ
          </label>
          <textarea
            id="trainer_bio"
            name="trainer_bio"
            defaultValue={trainer.trainer_bio || ""}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AddButton from "@/components/button/Add";
import BackButton from "@/components/button/Back";
import { createTrainer } from "@/actions/admin/createTrainer";

const schema = yup.object().shape({
  trainer_username: yup.string().required("กรุณากรอกชื่อผู้ใช้"),
  trainer_password: yup
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .required("กรุณากรอกรหัสผ่าน"),
  trainer_firstname: yup.string().required("กรุณากรอกชื่อจริง"),
  trainer_lastname: yup.string().required("กรุณากรอกนามสกุล"),
  trainer_email: yup.string().email("รูปแบบอีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
});

export default function TrainerAddPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setMessage("");
    const result = await createTrainer(data);

    if (result.success) {
      setMessage("✅ เพิ่ม Trainer สำเร็จ! 🎉");
      reset();
    } else {
      setMessage("❌ เกิดข้อผิดพลาด: " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">เพิ่มเทรนเนอร์</h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อเพิ่มเทรนเนอร์ใหม่เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลบัญชี</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ชื่อผู้ใช้ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_username")}
                  id="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                />
                {errors.trainer_username && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_username.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register("trainer_password")}
                  id="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
                {errors.trainer_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ชื่อจริง <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_firstname")}
                  id="firstname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกชื่อจริง"
                />
                {errors.trainer_firstname && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_firstname.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_lastname")}
                  id="lastname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกนามสกุล"
                />
                {errors.trainer_lastname && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_lastname.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("trainer_email")}
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกอีเมล"
                />
                {errors.trainer_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <BackButton />
              <AddButton
                type="submit"
                buttonText="เพิ่มเทรนเนอร์"
                showIcon={true}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </form>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p className="text-center font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
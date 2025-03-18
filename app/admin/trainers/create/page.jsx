"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { createTrainer } from "@/actions/admin/createTrainer"; // ✅ เช็กให้ path ถูกต้อง

const schema = yup.object().shape({
  trainer_username: yup.string().required("กรุณากรอกชื่อผู้ใช้"),
  trainer_password: yup.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").required("กรุณากรอกรหัสผ่าน"),
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
      reset(); // ล้างฟอร์ม
    } else {
      setMessage("❌ เกิดข้อผิดพลาด: " + result.error);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">เพิ่ม Trainer</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">ชื่อผู้ใช้</label>
          <input {...register("trainer_username")} className="w-full p-2 border rounded-md" />
          <p className="text-red-500 text-sm">{errors.trainer_username?.message}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">รหัสผ่าน</label>
          <input type="password" {...register("trainer_password")} className="w-full p-2 border rounded-md" />
          <p className="text-red-500 text-sm">{errors.trainer_password?.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">ชื่อจริง</label>
            <input {...register("trainer_firstname")} className="w-full p-2 border rounded-md" />
            <p className="text-red-500 text-sm">{errors.trainer_firstname?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">นามสกุล</label>
            <input {...register("trainer_lastname")} className="w-full p-2 border rounded-md" />
            <p className="text-red-500 text-sm">{errors.trainer_lastname?.message}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">อีเมล</label>
          <input type="email" {...register("trainer_email")} className="w-full p-2 border rounded-md" />
          <p className="text-red-500 text-sm">{errors.trainer_email?.message}</p>
        </div>

        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? "กำลังบันทึก..." : "เพิ่ม Trainer"}
        </Button>
      </form>

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}

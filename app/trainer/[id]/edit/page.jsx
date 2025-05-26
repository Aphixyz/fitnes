"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateTrainer } from "@/actions/admin/updateTrainer";
import { getTrainerById } from "@/actions/admin/getTrainerById";
import { useDropzone } from "react-dropzone";
import BackButton from "@/components/button/Back";
import AddButton from "@/components/button/Add";

const schema = yup.object().shape({
  trainer_username: yup.string().required("กรุณากรอกชื่อผู้ใช้"),
  trainer_password: yup.string().min(6).required("กรุณากรอกรหัสผ่านใหม่"),
  trainer_firstname: yup.string().required("กรุณากรอกชื่อจริง"),
  trainer_lastname: yup.string().required("กรุณากรอกนามสกุล"),
  trainer_email: yup.string().email().required("กรุณากรอกอีเมล"),
});

export default function EditTrainerPage() {
  const router = useRouter();
  const params = useParams();
  const trainerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    async function fetchTrainer() {
      if (!trainerId) return;
      const trainer = await getTrainerById(trainerId);
      if (trainer) {
        reset(trainer);
        if (trainer.trainer_profile_image) {
          setPreviewImage(trainer.trainer_profile_image);
        }
      }
      setLoading(false);
    }

    fetchTrainer();
  }, [trainerId, reset]);
  // รวม reset ใน dependencies array
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
          setValue("trainer_profile_image", reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const onSubmit = async (data) => {
    data.trainer_id = trainerId;
    const success = await updateTrainer(data);

    if (success) {
      setMessage("✅ อัปเดตข้อมูลสำเร็จ!");
      router.push(`/trainer/${trainerId}`);
    } else {
      setMessage("❌ เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูลผู้ฝึกสอน</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ชื่อผู้ใช้ */}
        <div>
          <label htmlFor="username" className="block font-medium">
            ชื่อผู้ใช้
          </label>
          <input
            {...register("trainer_username")}
            id="username"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกชื่อผู้ใช้"
          />
          {errors.trainer_username && (
            <p className="text-red-500 text-sm">
              {errors.trainer_username.message}
            </p>
          )}
        </div>

        {/* รหัสผ่านใหม่ */}
        <div>
          <label htmlFor="password" className="block font-medium">
            รหัสผ่านใหม่
          </label>
          <input
            type="password"
            {...register("trainer_password")}
            id="password"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกรหัสผ่านใหม่"
          />
          {errors.trainer_password && (
            <p className="text-red-500 text-sm">
              {errors.trainer_password.message}
            </p>
          )}
        </div>

        {/* ชื่อจริง */}
        <div>
          <label htmlFor="firstname" className="block font-medium">
            ชื่อจริง
          </label>
          <input
            {...register("trainer_firstname")}
            id="firstname"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกชื่อจริง"
          />
          {errors.trainer_firstname && (
            <p className="text-red-500 text-sm">
              {errors.trainer_firstname.message}
            </p>
          )}
        </div>

        {/* นามสกุล */}
        <div>
          <label htmlFor="lastname" className="block font-medium">
            นามสกุล
          </label>
          <input
            {...register("trainer_lastname")}
            id="lastname"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกนามสกุล"
          />
          {errors.trainer_lastname && (
            <p className="text-red-500 text-sm">
              {errors.trainer_lastname.message}
            </p>
          )}
        </div>

        {/* อีเมล */}
        <div>
          <label htmlFor="email" className="block font-medium">
            อีเมล
          </label>
          <input
            type="email"
            {...register("trainer_email")}
            id="email"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกอีเมล"
          />
          {errors.trainer_email && (
            <p className="text-red-500 text-sm">
              {errors.trainer_email.message}
            </p>
          )}
        </div>

        {/* ชื่อเล่น */}
        <div>
          <label htmlFor="nickname" className="block font-medium">
            ชื่อเล่น
          </label>
          <input
            {...register("trainer_nickname")}
            id="nickname"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกชื่อเล่น"
          />
          {errors.trainer_nickname && (
            <p className="text-red-500 text-sm">
              {errors.trainer_nickname.message}
            </p>
          )}
        </div>

        {/* เบอร์โทร */}
        <div>
          <label htmlFor="phone" className="block font-medium">
            เบอร์โทร
          </label>
          <input
            {...register("trainer_phone")}
            id="phone"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกเบอร์โทร"
          />
          {errors.trainer_phone && (
            <p className="text-red-500 text-sm">
              {errors.trainer_phone.message}
            </p>
          )}
        </div>

        {/* วันเกิด */}
        <div>
          <label htmlFor="dob" className="block font-medium">
            วันเกิด
          </label>
          <input
            type="date"
            {...register("trainer_dob")}
            id="dob"
            className="w-full p-2 border rounded"
          />
          {errors.trainer_dob && (
            <p className="text-red-500 text-sm">{errors.trainer_dob.message}</p>
          )}
        </div>

        {/* เพศ */}
        <div>
          <label htmlFor="gender" className="block font-medium">
            เพศ
          </label>
          <select
            {...register("trainer_gender")}
            id="gender"
            className="w-full p-2 border rounded"
          >
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
          {errors.trainer_gender && (
            <p className="text-red-500 text-sm">
              {errors.trainer_gender.message}
            </p>
          )}
        </div>

        {/* ประสบการณ์ */}
        <div>
          <label htmlFor="experience" className="block font-medium">
            ประสบการณ์(ปี)
          </label>
          <input
            {...register("trainer_exp")}
            id="experience"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกประสบการณ์"
          />
          {errors.trainer_exp && (
            <p className="text-red-500 text-sm">{errors.trainer_exp.message}</p>
          )}
        </div>

        {/* รูปโปรไฟล์ */}
        <div>
          <label className="block font-medium">รูปโปรไฟล์</label>
          <div
            {...getRootProps()}
            className={`w-full p-4 border-2 border-dashed rounded text-center cursor-pointer ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile Preview"
                className="mx-auto max-h-48 object-contain"
              />
            ) : (
              <p>ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
            )}
          </div>
          <input type="hidden" {...register("trainer_profile_image")} />
          {errors.trainer_profile_image && (
            <p className="text-red-500 text-sm">
              {errors.trainer_profile_image.message}
            </p>
          )}
        </div>

        {/* เกี่ยวกับตัวเอง */}
        <div>
          <label htmlFor="bio" className="block font-medium">
            เกี่ยวกับตัวเอง
          </label>
          <textarea
            {...register("trainer_bio")}
            id="bio"
            className="w-full p-2 border rounded"
            placeholder="กรุณากรอกข้อมูลเกี่ยวกับตัวเอง"
          />
          {errors.trainer_bio && (
            <p className="text-red-500 text-sm">{errors.trainer_bio.message}</p>
          )}
        </div>

        

        <div className="flex justify-between items-center mb-4">
          
          {/* ปุ่ม "ยกเลิก" */}
          <BackButton />

          {/* ปุ่ม "บันทึกการแก้ไข" */}
          <AddButton
            type="submit"
            buttonText="บันทึกการแก้ไข"
            isSubmitting={false}
          />
        </div>
      </form>

      {/* ข้อความตอบกลับ */}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

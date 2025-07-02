"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateTrainer } from "@/actions/admin/updateTrainer";
import { getTrainerById } from "@/actions/admin/getTrainerById";
import { useDropzone } from "react-dropzone";
import Saves from "@/components/button/Save";
import BackButton from "@/components/button/Back";
import SaveButton from "@/components/button/Add";
import LoadingSpinner from "@/app/admin/_components/common/loadingSpinner";
import PasswordModal from "@/app/admin/_components/UpdatePasswordModal";

const schema = yup.object().shape({
  trainer_username: yup.string().required("กรุณากรอกชื่อผู้ใช้"),
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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

  const handlePasswordUpdate = (newPassword) => {
    setValue("trainer_password", newPassword);
    setIsPasswordModalOpen(false);
  };

  const onSubmit = async (data) => {
    data.trainer_id = trainerId;
    
    if (!data.trainer_password) {
      delete data.trainer_password;
    }
    
    const success = await updateTrainer(data);

    if (success) {
      setMessage("✅ อัปเดตข้อมูลสำเร็จ!");
      router.push("/admin/trainers/manage");
    } else {
      setMessage("❌ เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลเทรนเนอร์</h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อเพิ่มเทรนเนอร์เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลส่วนตัว</h2>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div
                  {...getRootProps()}
                  className={`w-32 h-32 rounded-full border-4 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragActive 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-300 hover:border-gray-400"
                  } ${previewImage ? "border-solid border-gray-200" : ""}`}
                >
                  <input {...getInputProps()} />
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                อัพโหลดรูปโปรไฟล์
              </p>
              <p className="text-center text-xs text-gray-500">
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB
              </p>
              <input type="hidden" {...register("trainer_profile_image")} />
            </div>

            {/* Two Column Layout for Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อ */}
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_firstname")}
                  id="firstname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกชื่อจริง"
                />
                {errors.trainer_firstname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_firstname.message}
                  </p>
                )}
              </div>

              {/* นามสกุล */}
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_lastname")}
                  id="lastname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกนามสกุล"
                />
                {errors.trainer_lastname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_lastname.message}
                  </p>
                )}
              </div>

              {/* ชื่อเล่น */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อเล่น
                </label>
                <input
                  {...register("trainer_nickname")}
                  id="nickname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกชื่อเล่น"
                />
                {errors.trainer_nickname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_nickname.message}
                  </p>
                )}
              </div>

              {/* เบอร์โทร */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  {...register("trainer_phone")}
                  id="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกเบอร์โทร"
                />
                {errors.trainer_phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_phone.message}
                  </p>
                )}
              </div>

              {/* วันเกิด */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  วันเกิด
                </label>
                <input
                  type="date"
                  {...register("trainer_dob")}
                  id="dob"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.trainer_dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_dob.message}</p>
                )}
              </div>

              {/* เพศ */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  เพศ
                </label>
                <select
                  {...register("trainer_gender")}
                  id="gender"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
                {errors.trainer_gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_gender.message}
                  </p>
                )}
              </div>

              {/* ประสบการณ์ */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                  ประสบการณ์ (ปี)
                </label>
                <input
                  {...register("trainer_exp")}
                  id="experience"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกประสบการณ์"
                />
                {errors.trainer_exp && (
                  <p className="text-red-500 text-sm mt-1">{errors.trainer_exp.message}</p>
                )}
              </div>

              {/* สถานะ */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  {...register("trainer_status")}
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ได้ใช้งาน</option>
                  <option value="pending">กำลังรอดำเนินการ</option>
                </select>
                {errors.trainer_status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_status.message}
                  </p>
                )}
              </div>
            </div>

            {/* เกี่ยวกับตัวเอง - Full Width */}
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                เกี่ยวกับตัวเอง
              </label>
              <textarea
                {...register("trainer_bio")}
                id="bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกข้อมูลเกี่ยวกับตัวเอง"
              />
              {errors.trainer_bio && (
                <p className="text-red-500 text-sm mt-1">{errors.trainer_bio.message}</p>
              )}
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลบัญชี</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อผู้ใช้ */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้ใช้ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("trainer_username")}
                  id="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                />
                {errors.trainer_username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_username.message}
                  </p>
                )}
              </div>

              {/* ปุ่มเปลี่ยนรหัสผ่าน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-50% px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              {/* อีเมล - Full Width */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trainer_email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <BackButton/>
              <SaveButton
                type="submit"
                buttonText="บันทึก"
                showIcon={false}
                isSubmitting={false}
              />
            </div>
          </div>
        </form>

        {/* Password Modal */}
        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordUpdate}
        />

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="text-center font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
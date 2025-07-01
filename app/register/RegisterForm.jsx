"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  User,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import { DobPicker } from "@/components/ui/dobPicker";
import { verifyRegistrationParams } from "@/actions/trainer/registration/generateRegistrationLink";
import { registerNewMember } from "@/actions/register/registerNewMember";

// Modern Registration Form Component
function RegistrationForm({
  formData,
  onChange,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          สร้างบัญชีใหม่
        </h1>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-gray-700"
          >
            ชื่อผู้ใช้ *
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              type="text"
              autoFocus
              autoComplete="username"
              value={formData.member_username || ""}
              onChange={(e) =>
                handleInputChange("member_username", e.target.value)
              }
              className={`pl-10 h-11 text-sm transition-all duration-200 ${
                errors.member_username
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
            />
          </div>
          {errors.member_username && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.member_username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            อีเมล *
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.member_email || ""}
              onChange={(e) =>
                handleInputChange("member_email", e.target.value)
              }
              className={`pl-10 h-11 text-sm transition-all duration-200 ${
                errors.member_email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.member_email && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.member_email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            รหัสผ่าน *
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.member_password || ""}
              onChange={(e) =>
                handleInputChange("member_password", e.target.value)
              }
              className={`pl-10 pr-12 h-11 text-sm transition-all duration-200 ${
                errors.member_password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.member_password && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.member_password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            ยืนยันรหัสผ่าน *
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.member_confirm_password || ""}
              onChange={(e) =>
                handleInputChange("member_confirm_password", e.target.value)
              }
              className={`pl-10 pr-12 h-11 text-sm transition-all duration-200 ${
                errors.member_confirm_password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.member_confirm_password && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.member_confirm_password}
            </p>
          )}
        </div>

        {/* Name Fields Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label
              htmlFor="firstname"
              className="text-sm font-medium text-gray-700"
            >
              ชื่อ *
            </Label>
            <Input
              id="firstname"
              type="text"
              autoComplete="given-name"
              value={formData.member_firstname || ""}
              onChange={(e) =>
                handleInputChange("member_firstname", e.target.value)
              }
              className={`h-11 text-sm transition-all duration-200 ${
                errors.member_firstname
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="ชื่อจริง"
            />
            {errors.member_firstname && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.member_firstname}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label
              htmlFor="lastname"
              className="text-sm font-medium text-gray-700"
            >
              นามสกุล *
            </Label>
            <Input
              id="lastname"
              type="text"
              autoComplete="family-name"
              value={formData.member_lastname || ""}
              onChange={(e) =>
                handleInputChange("member_lastname", e.target.value)
              }
              className={`h-11 text-sm transition-all duration-200 ${
                errors.member_lastname
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="นามสกุล"
            />
            {errors.member_lastname && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.member_lastname}
              </p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            เบอร์โทรศัพท์
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={formData.member_phone || ""}
              onChange={(e) =>
                handleInputChange("member_phone", e.target.value)
              }
              className={`pl-10 h-11 text-sm transition-all duration-200 ${
                errors.member_phone
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="081-234-5678"
            />
          </div>
          {errors.member_phone && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.member_phone}
            </p>
          )}
        </div>

        {/* Gender and DOB Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="space-y-2">
            <Label
              htmlFor="gender"
              className="text-sm font-medium text-gray-700"
            >
              เพศ
            </Label>
            <Select
              value={formData.member_gender || ""}
              onValueChange={(value) =>
                handleInputChange("member_gender", value)
              }
            >
              <SelectTrigger
                id="gender"
                className={`h-11 text-sm ${
                  errors.member_gender
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
              </SelectContent>
            </Select>
            {errors.member_gender && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.member_gender}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <DobPicker
            value={formData.member_dob ? new Date(formData.member_dob) : null}
            onChange={(date) => {
              const formattedDate = date
                ? date.toISOString().split("T")[0]
                : null;
              handleInputChange("member_dob", formattedDate);
            }}
            error={errors.member_dob}
            label="วันเกิด"
            placeholder="เลือกวันเกิด"
          />
        </div>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("trainer");
  const token = searchParams.get("token");

  // Verification states
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify registration link
  useEffect(() => {
    const verifyParams = async () => {
      setVerifying(true);

      if (!trainerId || !token) {
        setError("ลิงก์ลงทะเบียนไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง");
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyRegistrationParams(token, trainerId);

        if (result.success) {
          setTrainerInfo(result.trainer);
        } else {
          setError(result.message || "ลิงก์ลงทะเบียนไม่ถูกต้องหรือหมดอายุแล้ว");
        }
      } catch (error) {
        console.error(error);
        setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ลงทะเบียน");
      } finally {
        setVerifying(false);
      }
    };

    verifyParams();
  }, [trainerId, token]);

  // Real-time validation
  const validateField = (field, value) => {
    const newErrors = { ...formErrors };

    switch (field) {
      case "member_username":
        if (!value) {
          newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
        } else if (value.length < 3) {
          newErrors.member_username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.member_username =
            "ชื่อผู้ใช้ควรประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น";
        } else {
          delete newErrors.member_username;
        }
        break;

      case "member_email":
        if (!value) {
          newErrors.member_email = "กรุณากรอกอีเมล";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
        } else {
          delete newErrors.member_email;
        }
        break;

      case "member_password":
        if (!value) {
          newErrors.member_password = "กรุณากรอกรหัสผ่าน";
        } else if (value.length < 6) {
          newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
        } else {
          delete newErrors.member_password;
        }

        // Re-validate confirm password if it exists
        if (formData.member_confirm_password) {
          if (value !== formData.member_confirm_password) {
            newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
          } else {
            delete newErrors.member_confirm_password;
          }
        }
        break;

      case "member_confirm_password":
        if (!value) {
          newErrors.member_confirm_password = "กรุณายืนยันรหัสผ่าน";
        } else if (value !== formData.member_password) {
          newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
        } else {
          delete newErrors.member_confirm_password;
        }
        break;

      case "member_firstname":
        if (!value) {
          newErrors.member_firstname = "กรุณากรอกชื่อ";
        } else {
          delete newErrors.member_firstname;
        }
        break;

      case "member_lastname":
        if (!value) {
          newErrors.member_lastname = "กรุณากรอกนามสกุล";
        } else {
          delete newErrors.member_lastname;
        }
        break;

      case "member_phone":
        if (value && !/^[0-9\-\s]+$/.test(value)) {
          newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
        } else {
          delete newErrors.member_phone;
        }
        break;

      case "member_gender":
        // Optional field, no validation needed
        delete newErrors.member_gender;
        break;

      case "member_dob":
        // Optional field, no validation needed
        delete newErrors.member_dob;
        break;
    }

    setFormErrors(newErrors);
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.member_username) {
      newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
    } else if (formData.member_username.length < 3) {
      newErrors.member_username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.member_username)) {
      newErrors.member_username =
        "ชื่อผู้ใช้ควรประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น";
    }

    if (!formData.member_email) {
      newErrors.member_email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.member_email)) {
      newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.member_password) {
      newErrors.member_password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.member_password.length < 6) {
      newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (!formData.member_confirm_password) {
      newErrors.member_confirm_password = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.member_password !== formData.member_confirm_password) {
      newErrors.member_confirm_password = "รหัสผ่านไม่ตรงกัน";
    }

    if (!formData.member_firstname) {
      newErrors.member_firstname = "กรุณากรอกชื่อ";
    }

    if (!formData.member_lastname) {
      newErrors.member_lastname = "กรุณากรอกนามสกุล";
    }

    // Optional fields validation
    if (formData.member_phone && !/^[0-9\-\s]+$/.test(formData.member_phone)) {
      newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced form data handler with real-time validation
  const handleFormDataChange = (newData) => {
    setFormData(newData);

    // Get the field that changed
    const changedField = Object.keys(newData).find(
      (key) => newData[key] !== formData[key]
    );

    if (changedField) {
      validateField(changedField, newData[changedField]);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return (
      formData.member_username &&
      formData.member_username.length >= 3 &&
      /^[a-zA-Z0-9_]+$/.test(formData.member_username) &&
      formData.member_email &&
      /\S+@\S+\.\S+/.test(formData.member_email) &&
      formData.member_password &&
      formData.member_password.length >= 6 &&
      formData.member_confirm_password &&
      formData.member_password === formData.member_confirm_password &&
      formData.member_firstname &&
      formData.member_lastname &&
      Object.keys(formErrors).length === 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await registerNewMember(formData, trainerId);

      if (result.success) {
        // Success - redirect to package selection
        router.push(
          `/member/${result.member_id}/signup/packageplan?trainer=${trainerId}`
        );
      } else {
        setFormErrors({ submit: result.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormErrors({ submit: "เกิดข้อผิดพลาดในการสร้างบัญชี" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {verifying ? (
          <div className="max-w-lg mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-6" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="font-bold">ข้อผิดพลาด:</span>
              </div>
              <p>{error}</p>
            </div>
            <div className="mt-6 bg-white p-8 rounded-lg shadow-sm border">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">ไม่สามารถลงทะเบียนได้</h2>
              <p className="text-gray-600 mb-6">
                ลิงก์ลงทะเบียนอาจไม่ถูกต้อง หมดอายุ หรือถูกใช้งานไปแล้ว
                โปรดติดต่อเทรนเนอร์ของคุณเพื่อขอลิงก์ใหม่
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white h-10 px-4 py-2 hover:bg-blue-700"
              >
                กลับสู่หน้าหลัก
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto">
            {/* Registration Form */}
            <Card className="p-6 sm:p-8 shadow-xl border border-gray-200 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <RegistrationForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  errors={formErrors}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />

                {/* Error Alert */}
                {formErrors.submit && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      {formErrors.submit}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className={`w-full h-11 text-sm font-medium transition-all duration-200 ${
                      isFormValid() && !loading
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        กำลังสร้างบัญชี...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        สร้างบัญชี
                      </>
                    )}
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> =
                    ฟิลด์ที่จำเป็นต้องกรอก
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ข้อมูลส่วนตัวจะถูกใช้สำหรับการวางแผนออกกำลังกายและโภชนาการ
                  </p>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

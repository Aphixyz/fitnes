// components/RegistrationForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  User,
  Package,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { getTrainerPackages } from "@/actions/trainer/packages/getPackages";
import { registerNewMember } from "@/actions/member/registerNewMember";

// Progress Tracker Component
function ProgressTracker({ currentStep, steps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200 border-2
                    ${isActive ? "bg-blue-600 text-white border-blue-600" : ""}
                    ${
                      isCompleted
                        ? "bg-green-500 text-white border-green-500"
                        : ""
                    }
                    ${
                      !isActive && !isCompleted
                        ? "bg-white text-gray-400 border-gray-300"
                        : ""
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`text-xs ${
                      isActive || isCompleted
                        ? "text-gray-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-1 rounded transition-all duration-300 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Package Selection Component
function PackageSelection({ packages, selectedPackage, onSelect }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-2">เลือกแพ็คเกจ</h2>
      <p className="text-gray-600 mb-6">
        เลือกแพ็คเกจที่เหมาะสมกับเป้าหมายของคุณ
      </p>

      <RadioGroup value={selectedPackage} onValueChange={onSelect}>
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <label
              key={pkg.packages_id}
              htmlFor={`package-${pkg.packages_id}`}
              className="cursor-pointer"
            >
              <Card
                className={`
                  p-6 transition-all duration-200 hover:shadow-lg
                  ${
                    selectedPackage === pkg.packages_id.toString()
                      ? "border-blue-600 border-2 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={pkg.packages_id.toString()}
                    id={`package-${pkg.packages_id}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {pkg.packages_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {pkg.packages_description}
                    </p>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ฿{pkg.packages_price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          / {pkg.packages_duration_months} เดือน
                        </span>
                      </div>
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}

// Account Registration Form Component
function AccountForm({ formData, onChange, errors }) {
  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">สร้างบัญชีผู้ใช้</h2>
      <p className="text-gray-600 mb-6">
        กรอกข้อมูลส่วนตัวเพื่อสร้างบัญชีของคุณ
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
          <Input
            id="username"
            type="text"
            value={formData.member_username || ""}
            onChange={(e) =>
              handleInputChange("member_username", e.target.value)
            }
            className={errors.member_username ? "border-red-500" : ""}
            placeholder="username"
          />
          {errors.member_username && (
            <p className="text-red-500 text-sm">{errors.member_username}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">รหัสผ่าน *</Label>
          <Input
            id="password"
            type="password"
            value={formData.member_password || ""}
            onChange={(e) =>
              handleInputChange("member_password", e.target.value)
            }
            className={errors.member_password ? "border-red-500" : ""}
            placeholder="••••••••"
          />
          {errors.member_password && (
            <p className="text-red-500 text-sm">{errors.member_password}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstname">ชื่อ *</Label>
          <Input
            id="firstname"
            type="text"
            value={formData.member_firstname || ""}
            onChange={(e) =>
              handleInputChange("member_firstname", e.target.value)
            }
            className={errors.member_firstname ? "border-red-500" : ""}
            placeholder="ชื่อ"
          />
          {errors.member_firstname && (
            <p className="text-red-500 text-sm">{errors.member_firstname}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastname">นามสกุล *</Label>
          <Input
            id="lastname"
            type="text"
            value={formData.member_lastname || ""}
            onChange={(e) =>
              handleInputChange("member_lastname", e.target.value)
            }
            className={errors.member_lastname ? "border-red-500" : ""}
            placeholder="นามสกุล"
          />
          {errors.member_lastname && (
            <p className="text-red-500 text-sm">{errors.member_lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล *</Label>
          <Input
            id="email"
            type="email"
            value={formData.member_email || ""}
            onChange={(e) => handleInputChange("member_email", e.target.value)}
            className={errors.member_email ? "border-red-500" : ""}
            placeholder="email@example.com"
          />
          {errors.member_email && (
            <p className="text-red-500 text-sm">{errors.member_email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.member_phone || ""}
            onChange={(e) => handleInputChange("member_phone", e.target.value)}
            placeholder="0812345678"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">เพศ</Label>
          <Select
            value={formData.member_gender || ""}
            onValueChange={(value) => handleInputChange("member_gender", value)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="เลือกเพศ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ชาย</SelectItem>
              <SelectItem value="female">หญิง</SelectItem>
              <SelectItem value="other">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dob">วันเกิด</Label>
          <Input
            id="dob"
            type="date"
            value={formData.member_dob || ""}
            onChange={(e) => handleInputChange("member_dob", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// Main Registration Form Component
export default function RegistrationForm({ trainerId, trainerInfo }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const steps = [
    { label: "เลือกแพ็คเกจ", icon: Package },
    { label: "สร้างบัญชี", icon: User },
    { label: "ยืนยันข้อมูล", icon: CheckCircle2 },
  ];

  // Load packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true);
      const result = await getTrainerPackages(trainerId);
      if (result.success) {
        setPackages(result.packages);
        }
      } catch (error) {
        console.error("Error loading packages:", error);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, [trainerId]);

  // Validate form data
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!selectedPackage) {
        newErrors.package = "กรุณาเลือกแพ็คเกจ";
      }
    }

    if (step === 1) {
      if (!formData.member_username) {
        newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
      }
      if (!formData.member_password || formData.member_password.length < 6) {
      newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
      if (!formData.member_firstname) {
        newErrors.member_firstname = "กรุณากรอกชื่อ";
      }
      if (!formData.member_lastname) {
        newErrors.member_lastname = "กรุณากรอกนามสกุล";
      }
      if (!formData.member_email) {
        newErrors.member_email = "กรุณากรอกอีเมล";
      } else if (!/\S+@\S+\.\S+/.test(formData.member_email)) {
        newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(1)) {
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        packages_id: parseInt(selectedPackage),
      };

      const result = await registerNewMember(submissionData, trainerId);

      if (result.success) {
        // Success - redirect to success page or login
        router.push(`/member/${result.member_id}/onboarding`);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "เกิดข้อผิดพลาดในการลงทะเบียน" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPackages) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Trainer Info Card */}
      {/* <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {trainerInfo?.trainer_firstname?.[0]}
            {trainerInfo?.trainer_lastname?.[0]}
            </div>
          <div>
            <h2 className="text-xl font-semibold">
              ลงทะเบียนกับ คุณ{trainerInfo?.trainer_firstname}{" "}
              {trainerInfo?.trainer_lastname}
            </h2>
            <p className="text-gray-600">
              {trainerInfo?.trainer_specialization}
            </p>
                </div>
              </div>
      </Card> */}

      {/* Progress Tracker */}
      <ProgressTracker currentStep={currentStep} steps={steps} />

      {/* Form Content */}
      <Card className="mt-12 p-8">
        {currentStep === 0 && (
          <PackageSelection
            packages={packages}
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
          />
        )}

        {currentStep === 1 && (
          <AccountForm
            formData={formData}
            onChange={setFormData}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">ยืนยันข้อมูล</h2>
            <p className="text-gray-600 mb-6">
              กรุณาตรวจสอบข้อมูลก่อนยืนยันการลงทะเบียน
            </p>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">แพ็คเกจที่เลือก</h3>
                <p className="text-gray-700">
                  {
                    packages.find(
                      (p) => p.packages_id.toString() === selectedPackage
                    )?.packages_name
                  }
                </p>
            </div>

              <div>
                <h3 className="font-semibold mb-2">ข้อมูลบัญชี</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">ชื่อผู้ใช้:</p>
                  <p className="text-gray-700">{formData.member_username}</p>
                  <p className="text-gray-600">ชื่อ-นามสกุล:</p>
                  <p className="text-gray-700">
                    {formData.member_firstname} {formData.member_lastname}
                  </p>
                  <p className="text-gray-600">อีเมล:</p>
                  <p className="text-gray-700">{formData.member_email}</p>
                </div>
              </div>
            </div>
              </div>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>

          {currentStep < 2 ? (
            <Button onClick={handleNext}>
              ถัดไป
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังลงทะเบียน...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  ยืนยันการลงทะเบียน
                </>
              )}
            </Button>
      )}
        </div>
    </Card>
    </div>
  );
}

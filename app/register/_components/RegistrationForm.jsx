// components/RegistrationForm.jsx
"use client";


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, User, Mail, Phone, Calendar, Eye, EyeOff } from "lucide-react";
import { registerNewMember } from "@/actions/member/registerNewMember";
import { getTrainerPackages } from "@/actions/member/getPackages";

export default function RegistrationForm({ trainerId, trainerInfo }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null); // เพิ่ม state สำหรับแพ็คเกจที่เลือก
  const [formData, setFormData] = useState({
    member_username: "",
    member_password: "",
    confirm_password: "",
    member_firstname: "",
    member_lastname: "",
    member_email: "",
    member_phone: "",
    member_gender: "",
    member_dob: "",
    packages_id: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchPackages() {
      const result = await getTrainerPackages(trainerId);
      if (result.success) {
        setPackages(result.packages);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    }
    fetchPackages();
  }, [trainerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.member_username.trim()) newErrors.member_username = "กรุณากรอกชื่อผู้ใช้";
    if (!formData.member_firstname.trim()) newErrors.member_firstname = "กรุณากรอกชื่อจริง";
    if (!formData.member_lastname.trim()) newErrors.member_lastname = "กรุณากรอกนามสกุล";
    if (!formData.member_email.trim()) {
      newErrors.member_email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.member_email)) {
      newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (!formData.member_password) {
      newErrors.member_password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.member_password.length < 6) {
      newErrors.member_password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (formData.member_password !== formData.confirm_password) {
      newErrors.confirm_password = "รหัสผ่านไม่ตรงกัน";
    }
    if (formData.member_phone && !/^\d{9,10}$/.test(formData.member_phone.replace(/[\s-]/g, ""))) {
      newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg.packages_id);
    setFormData((prev) => ({ ...prev, packages_id: pkg.packages_id.toString() }));
    setErrors((prev) => ({ ...prev, packages_id: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.packages_id) {
      setErrors((prev) => ({ ...prev, packages_id: "กรุณาเลือกแพ็คเกจ" }));
      return;
    }

    setIsLoading(true);
    try {
      const submitData = { ...formData };
      delete submitData.confirm_password;

      const result = await registerNewMember(submitData, trainerId);

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "ลงทะเบียนสำเร็จ",
          description: result.message,
        });
      } else {
        if (result.message.includes("อีเมล")) {
          setErrors((prev) => ({ ...prev, member_email: result.message }));
        } else if (result.message.includes("ชื่อผู้ใช้")) {
          setErrors((prev) => ({ ...prev, member_username: result.message }));
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลงทะเบียนได้ โปรดลองอีกครั้งในภายหลัง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-green-600">ลงทะเบียนสำเร็จ!</CardTitle>
          <CardDescription>
            การลงทะเบียนของคุณได้รับการบันทึกเรียบร้อยแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">ขอบคุณที่ลงทะเบียนใช้งานระบบ</p>
          <p className="text-gray-500">
            กรุณารอการยืนยันจากเทรนเนอร์ คุณจะได้รับการติดต่อกลับเมื่อเทรนเนอร์ยืนยันการลงทะเบียนของคุณ
          </p>
          <div className="bg-blue-50 p-4 rounded-md text-blue-800 mt-4 text-left">
            <p className="font-medium">ขั้นตอนต่อไป:</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>เทรนเนอร์จะตรวจสอบข้อมูลการลงทะเบียนของคุณ</li>
              <li>เมื่อได้รับการยืนยัน คุณจะสามารถเข้าสู่ระบบได้</li>
              <li>เทรนเนอร์จะติดต่อคุณเพื่อกำหนดแผนการออกกำลังกายและโภชนาการ</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            กลับสู่หน้าหลัก
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>ลงทะเบียนสมาชิกใหม่</CardTitle>
        <CardDescription>
          {step === 1
            ? trainerInfo
              ? `ลงทะเบียนกับเทรนเนอร์: ${trainerInfo.name}`
              : "กรอกข้อมูลของคุณเพื่อลงทะเบียนเป็นสมาชิก"
            : "เลือกแพ็คเกจสำหรับการลงทะเบียน"}
        </CardDescription>
      </CardHeader>

      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member_username">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="member_username"
                name="member_username"
                value={formData.member_username}
                onChange={handleChange}
                placeholder="กรอกชื่อผู้ใช้"
                className={errors.member_username ? "border-red-500" : ""}
              />
              {errors.member_username && (
                <p className="text-red-500 text-xs mt-1">{errors.member_username}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member_firstname">
                  ชื่อจริง <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="member_firstname"
                    name="member_firstname"
                    value={formData.member_firstname}
                    onChange={handleChange}
                    placeholder="กรอกชื่อจริง"
                    className={errors.member_firstname ? "border-red-500 pl-10" : "pl-10"}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  {errors.member_firstname && (
                    <p className="text-red-500 text-xs mt-1">{errors.member_firstname}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_lastname">
                  นามสกุล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="member_lastname"
                  name="member_lastname"
                  value={formData.member_lastname}
                  onChange={handleChange}
                  placeholder="กรอกนามสกุล"
                  className={errors.member_lastname ? "border-red-500" : ""}
                />
                {errors.member_lastname && (
                  <p className="text-red-500 text-xs mt-1">{errors.member_lastname}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member_email">
                อีเมล <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="member_email"
                  name="member_email"
                  type="email"
                  value={formData.member_email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={errors.member_email ? "border-red-500 pl-10" : "pl-10"}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                {errors.member_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.member_email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member_password">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="member_password"
                    name="member_password"
                    type={showPassword ? "text" : "password"}
                    value={formData.member_password}
                    onChange={handleChange}
                    placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    className={errors.member_password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.member_password && (
                    <p className="text-red-500 text-xs mt-1">{errors.member_password}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className={errors.confirm_password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member_phone">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Input
                  id="member_phone"
                  name="member_phone"
                  value={formData.member_phone}
                  onChange={handleChange}
                  placeholder="0812345678"
                  className={errors.member_phone ? "border-red-500 pl-10" : "pl-10"}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                {errors.member_phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.member_phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member_gender">เพศ</Label>
                <select
                  id="member_gender"
                  name="member_gender"
                  value={formData.member_gender}
                  onChange={(e) => handleSelectChange("member_gender", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_dob">วันเกิด</Label>
                <div className="relative">
                  <Input
                    id="member_dob"
                    name="member_dob"
                    type="date"
                    value={formData.member_dob}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-blue-700">
                <p>การลงทะเบียนจะอยู่ในสถานะ "รอการยืนยัน" จนกว่าจะได้รับการยืนยันจากเทรนเนอร์</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              ถัดไป
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>เลือกแพ็คเกจ <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.packages_id}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.packages_id
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border"
                    }`}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <CardHeader>
                      <CardTitle>{pkg.packages_name}</CardTitle>
                      <CardDescription>
                        ระยะเวลา: {pkg.packages_duration_months} เดือน
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold text-green-600">
                        ราคา: {parseFloat(pkg.packages_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </p>
                      <p className="mt-2 text-gray-600">
                        รายละเอียด: {pkg.packages_description || "ไม่มีคำอธิบาย"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.packages_id && (
                <p className="text-red-500 text-xs mt-1">{errors.packages_id}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              ย้อนกลับ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังลงทะเบียน...
                </>
              ) : (
                "ลงทะเบียน"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
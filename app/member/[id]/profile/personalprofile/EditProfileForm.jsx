"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Edit, Upload, X } from "lucide-react";
import {
  updateMemberProfile,
  checkEmailAvailability,
} from "@/actions/member/profile";

export default function EditProfileForm({ memberId, profile }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_firstname: profile.firstName || "",
    member_lastname: profile.lastName || "",
    member_email: profile.email || "",
    member_phone: profile.phone || "",
    member_gender: profile.gender || "",
    member_dob:
      profile.dateOfBirth && typeof profile.dateOfBirth === "string"
        ? profile.dateOfBirth.split("T")[0]
        : profile.dateOfBirth || "",
    member_profileimage: null,
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(profile.profileImageUrl);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // ลบ error เมื่อผู้ใช้เริ่มพิมพ์
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // จัดการการอัปโหลดรูปภาพ
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ขนาดไฟล์ต้องไม่เกิน 5MB",
          variant: "destructive",
        });
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        toast({
          title: "ข้อผิดพลาด",
          description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({ ...prev, member_profileimage: file }));

      // สร้าง preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ลบรูปภาพ
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, member_profileimage: null }));
    setPreviewImage(profile.profileImageUrl);
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_firstname.trim()) {
      newErrors.member_firstname = "กรุณากรอกชื่อ";
    }

    if (!formData.member_lastname.trim()) {
      newErrors.member_lastname = "กรุณากรอกนามสกุล";
    }

    if (!formData.member_email.trim()) {
      newErrors.member_email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.member_email)) {
      newErrors.member_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (
      formData.member_phone &&
      !/^[0-9-+\s()]+$/.test(formData.member_phone)
    ) {
      newErrors.member_phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // ตรวจสอบอีเมลซ้ำ (ถ้าเปลี่ยนอีเมล)
      if (formData.member_email !== profile.email) {
        const emailCheck = await checkEmailAvailability(
          formData.member_email,
          memberId
        );
        if (!emailCheck.success) {
          toast({
            title: "ข้อผิดพลาด",
            description: emailCheck.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (!emailCheck.isAvailable) {
          setErrors((prev) => ({
            ...prev,
            member_email: "อีเมลนี้ถูกใช้งานแล้ว",
          }));
          setIsLoading(false);
          return;
        }
      }

      // สร้าง FormData สำหรับส่งไฟล์
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      // อัปเดตข้อมูล
      const result = await updateMemberProfile(memberId, submitData);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว",
        });
        setIsOpen(false);
        // รีเฟรชหน้าเพื่อแสดงข้อมูลใหม่
        window.location.reload();
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // รีเซ็ตฟอร์มเมื่อเปิด modal
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setFormData({
        member_firstname: profile.firstName || "",
        member_lastname: profile.lastName || "",
        member_email: profile.email || "",
        member_phone: profile.phone || "",
        member_gender: profile.gender || "",
        member_dob:
          profile.dateOfBirth && typeof profile.dateOfBirth === "string"
            ? profile.dateOfBirth.split("T")[0]
            : profile.dateOfBirth || "",
        member_profileimage: null,
      });
      setErrors({});
      setPreviewImage(profile.profileImageUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <Edit className="h-4 w-4 mr-1" />
          แก้ไข
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* รูปโปรไฟล์ */}
          <div className="space-y-2">
            <Label>รูปโปรไฟล์</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewImage} alt="Profile" />
                <AvatarFallback>
                  {formData.member_firstname?.charAt(0)}
                  {formData.member_lastname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-2">
                  <Label
                    htmlFor="profile-image"
                    className="cursor-pointer bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    อัปโหลดรูป
                  </Label>
                  {previewImage !== profile.profileImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      ลบ
                    </Button>
                  )}
                </div>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                </p>
              </div>
            </div>
          </div>

          {/* ชื่อ */}
          <div className="space-y-2">
            <Label htmlFor="firstname">ชื่อ *</Label>
            <Input
              id="firstname"
              value={formData.member_firstname}
              onChange={(e) =>
                handleInputChange("member_firstname", e.target.value)
              }
              placeholder="กรอกชื่อ"
              className={errors.member_firstname ? "border-red-500" : ""}
            />
            {errors.member_firstname && (
              <p className="text-sm text-red-500">{errors.member_firstname}</p>
            )}
          </div>

          {/* นามสกุล */}
          <div className="space-y-2">
            <Label htmlFor="lastname">นามสกุล *</Label>
            <Input
              id="lastname"
              value={formData.member_lastname}
              onChange={(e) =>
                handleInputChange("member_lastname", e.target.value)
              }
              placeholder="กรอกนามสกุล"
              className={errors.member_lastname ? "border-red-500" : ""}
            />
            {errors.member_lastname && (
              <p className="text-sm text-red-500">{errors.member_lastname}</p>
            )}
          </div>

          {/* อีเมล */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              value={formData.member_email}
              onChange={(e) =>
                handleInputChange("member_email", e.target.value)
              }
              placeholder="example@email.com"
              className={errors.member_email ? "border-red-500" : ""}
            />
            {errors.member_email && (
              <p className="text-sm text-red-500">{errors.member_email}</p>
            )}
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.member_phone}
              onChange={(e) =>
                handleInputChange("member_phone", e.target.value)
              }
              placeholder="081-234-5678"
              className={errors.member_phone ? "border-red-500" : ""}
            />
            {errors.member_phone && (
              <p className="text-sm text-red-500">{errors.member_phone}</p>
            )}
          </div>

          {/* เพศ */}
          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select
              value={formData.member_gender}
              onValueChange={(value) =>
                handleInputChange("member_gender", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
                <SelectItem value="other">ไม่ระบุ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* วันเกิด */}
          <div className="space-y-2">
            <Label htmlFor="dob">วันเกิด</Label>
            <Input
              id="dob"
              type="date"
              value={formData.member_dob}
              onChange={(e) => handleInputChange("member_dob", e.target.value)}
            />
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

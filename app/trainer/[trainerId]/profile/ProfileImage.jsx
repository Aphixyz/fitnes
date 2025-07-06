"use client";

import { useState, useRef } from "react";
import { updateTrainer } from "@/actions/trainer/profile/updateTrainer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Camera, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfileImage({ currentImage, trainerId, trainerName }) {
  const [previewImage, setPreviewImage] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const fileInputRef = useRef(null);

  // ฟังก์ชันแปลงไฟล์เป็น base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // ฟังก์ชันจัดการการเลือกไฟล์
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        content: "กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP)",
      });
      return;
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดไว้ที่ 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({
        type: "error",
        content: "ขนาดไฟล์เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า",
      });
      return;
    }

    try {
      // แปลงไฟล์เป็น base64 สำหรับ preview
      const base64 = await convertToBase64(file);
      setPreviewImage(base64);
      setMessage({ type: "", content: "" });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      setMessage({ type: "error", content: "เกิดข้อผิดพลาดในการอ่านไฟล์" });
    }
  };

  // ฟังก์ชันอัพโหลดรูปภาพ
  const handleUpload = async () => {
    if (!previewImage || previewImage === currentImage) {
      setMessage({ type: "error", content: "กรุณาเลือกรูปภาพใหม่ก่อน" });
      return;
    }

    setIsUploading(true);
    setMessage({ type: "", content: "" });

    try {
      // อัพเดตข้อมูลรูปภาพ
      const updateData = {
        trainer_id: trainerId,
        trainer_profile_image: previewImage,
      };

      const result = await updateTrainer(updateData);

      if (result) {
        setMessage({ type: "success", content: "อัพเดตรูปโปรไฟล์สำเร็จ" });
        // รีเฟรชหน้าหลังจาก 1 วินาที
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", content: "ไม่สามารถอัพเดตรูปโปรไฟล์ได้" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", content: "เกิดข้อผิดพลาดในการอัพโหลด" });
    } finally {
      setIsUploading(false);
    }
  };

  // ฟังก์ชันลบรูปภาพ
  const handleRemoveImage = async () => {
    setIsUploading(true);
    setMessage({ type: "", content: "" });

    try {
      // อัพเดตข้อมูลเป็น null เพื่อใช้รูป default
      const updateData = {
        trainer_id: trainerId,
        trainer_profile_image: null,
      };

      const result = await updateTrainer(updateData);

      if (result) {
        setMessage({ type: "success", content: "ลบรูปโปรไฟล์สำเร็จ" });
        setPreviewImage(null);
        // รีเฟรชหน้าหลังจาก 1 วินาที
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", content: "ไม่สามารถลบรูปโปรไฟล์ได้" });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      setMessage({ type: "error", content: "เกิดข้อผิดพลาดในการลบรูปภาพ" });
    } finally {
      setIsUploading(false);
    }
  };

  // ฟังก์ชันเปิดไฟล์ selector
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  // ฟังก์ชันยกเลิกการเลือกรูปใหม่
  const handleCancelPreview = () => {
    setPreviewImage(currentImage);
    setMessage({ type: "", content: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ตรวจสอบว่ามีการเปลี่ยนแปลงรูปภาพหรือไม่
  const hasImageChanged = previewImage !== currentImage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          รูปโปรไฟล์
        </CardTitle>
        <CardDescription>
          อัพโหลดรูปโปรไฟล์ของคุณเพื่อให้สมาชิกเห็น
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Preview */}
        <div className="flex flex-col items-center">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage
              src={previewImage || "/default-avatar.png"}
              alt={trainerName}
            />
            <AvatarFallback className="text-2xl">
              {trainerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenFileSelector}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              เลือกรูป
            </Button>

            {previewImage && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                ลบรูป
              </Button>
            )}
          </div>
        </div>

        {/* Preview Actions */}
        {hasImageChanged && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? "กำลังอัพโหลด..." : "บันทึกรูปภาพ"}
            </Button>

            <Button
              variant="outline"
              onClick={handleCancelPreview}
              disabled={isUploading}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          </div>
        )}

        {/* Alert Messages */}
        {message.content && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Image Requirements */}
        <div className="text-sm text-gray-500 space-y-1">
          <p className="font-medium">ข้อกำหนดรูปภาพ:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>ประเภทไฟล์: JPEG, PNG, WebP</li>
            <li>ขนาดไฟล์: ไม่เกิน 5MB</li>
            <li>ขนาดที่แนะนำ: 400x400 พิกเซล</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

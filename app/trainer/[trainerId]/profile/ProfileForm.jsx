"use client";

import { useState, useTransition } from "react";
import { updateTrainer } from "@/actions/trainer/profile/updateTrainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ProfileForm({ trainer }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", content: "" });
  const [formData, setFormData] = useState({
    trainer_id: trainer.trainer_id,
    trainer_username: trainer.trainer_username,
    trainer_firstname: trainer.trainer_firstname,
    trainer_lastname: trainer.trainer_lastname,
    trainer_email: trainer.trainer_email,
    trainer_nickname: trainer.trainer_nickname || "",
    trainer_phone: trainer.trainer_phone || "",
    trainer_bio: trainer.trainer_bio || "",
    trainer_specialization: trainer.trainer_specialization || "",
    trainer_certification: trainer.trainer_certification || "",
    trainer_exp: trainer.trainer_exp || 0,
    trainer_status: trainer.trainer_status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !formData.trainer_firstname ||
      !formData.trainer_lastname ||
      !formData.trainer_email
    ) {
      setMessage({
        type: "error",
        content: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, อีเมล)",
      });
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.trainer_email)) {
      setMessage({ type: "error", content: "กรุณากรอกอีเมลให้ถูกต้อง" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateTrainer(formData);

        if (result) {
          setMessage({ type: "success", content: "อัพเดตข้อมูลส่วนตัวสำเร็จ" });
          // อัพเดตหน้าเว็บหลังจากอัพเดตสำเร็จ
          window.location.reload();
        } else {
          setMessage({
            type: "error",
            content: "ไม่สามารถอัพเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          });
        }
      } catch (error) {
        console.error("Error updating trainer:", error);
        setMessage({
          type: "error",
          content: "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">ข้อมูลส่วนตัว</CardTitle>
        <CardDescription>
          แก้ไขข้อมูลส่วนตัวและความเชี่ยวชาญของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ข้อมูลพื้นฐาน
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainer_firstname">
                  ชื่อจริง <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="trainer_firstname"
                  name="trainer_firstname"
                  value={formData.trainer_firstname}
                  onChange={handleChange}
                  required
                  placeholder="กรอกชื่อจริง"
                />
              </div>

              <div>
                <Label htmlFor="trainer_lastname">
                  นามสกุล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="trainer_lastname"
                  name="trainer_lastname"
                  value={formData.trainer_lastname}
                  onChange={handleChange}
                  required
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainer_nickname">ชื่อเล่น</Label>
                <Input
                  id="trainer_nickname"
                  name="trainer_nickname"
                  value={formData.trainer_nickname}
                  onChange={handleChange}
                  placeholder="กรอกชื่อเล่น"
                />
              </div>

              <div>
                <Label htmlFor="trainer_username">ชื่อผู้ใช้</Label>
                <Input
                  id="trainer_username"
                  name="trainer_username"
                  value={formData.trainer_username}
                  disabled
                  className="bg-gray-50"
                  placeholder="ชื่อผู้ใช้ (ไม่สามารถแก้ไขได้)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainer_email">
                  อีเมล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="trainer_email"
                  name="trainer_email"
                  type="email"
                  value={formData.trainer_email}
                  onChange={handleChange}
                  required
                  placeholder="กรอกอีเมล"
                />
              </div>

              <div>
                <Label htmlFor="trainer_phone">เบอร์โทร</Label>
                <Input
                  id="trainer_phone"
                  name="trainer_phone"
                  value={formData.trainer_phone}
                  onChange={handleChange}
                  placeholder="กรอกเบอร์โทร"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* ข้อมูลความเชี่ยวชาญ */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ข้อมูลความเชี่ยวชาญ
              </h3>
            </div>

            <div>
              <Label htmlFor="trainer_bio">แนะนำตัว</Label>
              <Textarea
                id="trainer_bio"
                name="trainer_bio"
                value={formData.trainer_bio}
                onChange={handleChange}
                rows={3}
                placeholder="เล่าเกี่ยวกับตัวคุณ ประสบการณ์ การศึกษา หรือสิ่งที่คุณชอบ..."
              />
            </div>

            <div>
              <Label htmlFor="trainer_specialization">ความเชี่ยวชาญ</Label>
              <Input
                id="trainer_specialization"
                name="trainer_specialization"
                value={formData.trainer_specialization}
                onChange={handleChange}
                placeholder="เช่น Weight Training, Cardio, Yoga, Boxing"
              />
            </div>

            <div>
              <Label htmlFor="trainer_certification">ใบรับรอง/การศึกษา</Label>
              <Input
                id="trainer_certification"
                name="trainer_certification"
                value={formData.trainer_certification}
                onChange={handleChange}
                placeholder="เช่น NASM Certified, ปริญญาตรี วิทยาศาสตร์การกีฬา"
              />
            </div>

            <div>
              <Label htmlFor="trainer_exp">ประสบการณ์ (ปี)</Label>
              <Input
                id="trainer_exp"
                name="trainer_exp"
                type="number"
                value={formData.trainer_exp}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกข้อมูล"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createWorkoutTemplate } from "@/actions/trainer/workout/workoutv1/workoutTemplateActions";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft } from "lucide-react";

const difficultyLevels = [
  { value: "beginner", label: "เริ่มต้น" },
  { value: "intermediate", label: "ปานกลาง" },
  { value: "advanced", label: "ขั้นสูง" },
];

const weekDays = [
  { id: "1", label: "จันทร์" },
  { id: "2", label: "อังคาร" },
  { id: "3", label: "พุธ" },
  { id: "4", label: "พฤหัสบดี" },
  { id: "5", label: "ศุกร์" },
  { id: "6", label: "เสาร์" },
  { id: "7", label: "อาทิตย์" },
];

export default function CreateTemplateFormPage({ params }) {
  const { id: trainerId } = React.use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    trainer_id: trainerId,
    template_name: "",
    template_description: "",
    workout_days: "",
    difficulty_level: "beginner",
    target_muscles: "",
    is_public: 0,
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // จัดการการเปลี่ยนแปลงของฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลงของ Select
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลงของ Checkbox
  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, is_public: checked ? 1 : 0 }));
  };

  // จัดการการเปลี่ยนแปลงของวันที่ออกกำลังกาย
  const handleDayToggle = (dayId) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((id) => id !== dayId);
      } else {
        return [...prev, dayId].sort();
      }
    });
  };

  // ตรวจสอบข้อมูลฟอร์ม
  const validateForm = () => {
    const newErrors = {};

    if (!formData.template_name.trim()) {
      newErrors.template_name = "กรุณาระบุชื่อเทมเพลต";
    }

    if (selectedDays.length === 0) {
      newErrors.workout_days = "กรุณาเลือกวันที่ออกกำลังกายอย่างน้อย 1 วัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    // อัพเดต workout_days ในฟอร์มด้วยวันที่เลือก
    const updatedFormData = {
      ...formData,
      workout_days: selectedDays.join(","),
    };

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await createWorkoutTemplate(updatedFormData);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message || "สร้างเทมเพลตโปรแกรมการฝึกสำเร็จ",
        });

        // นำทางไปหน้ารายละเอียดเทมเพลต
        router.push(
          `/trainer/${trainerId}/workout/templates/${result.template_id}`
        );
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างเทมเพลตโปรแกรมการฝึกได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          สร้างเทมเพลตโปรแกรมการฝึกใหม่
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> ย้อนกลับ
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเทมเพลต</CardTitle>
            <CardDescription>
              กรอกข้อมูลสำหรับเทมเพลตโปรแกรมการฝึกใหม่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ชื่อเทมเพลต */}
            <div className="space-y-2">
              <Label htmlFor="template_name">
                ชื่อเทมเพลต <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template_name"
                name="template_name"
                value={formData.template_name}
                onChange={handleChange}
                placeholder="ระบุชื่อเทมเพลต เช่น โปรแกรมลดน้ำหนัก 4 สัปดาห์"
                className={errors.template_name ? "border-red-500" : ""}
              />
              {errors.template_name && (
                <p className="text-xs text-red-500">{errors.template_name}</p>
              )}
            </div>

            {/* ระดับความยาก */}
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">ระดับความยาก</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  handleSelectChange("difficulty_level", value)
                }
              >
                <SelectTrigger id="difficulty_level">
                  <SelectValue placeholder="เลือกระดับความยาก" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* วันที่ออกกำลังกาย */}
            <div className="space-y-2">
              <div>
                <Label>
                  วันที่ออกกำลังกาย <span className="text-red-500">*</span>
                </Label>
                {errors.workout_days && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.workout_days}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center space-x-2 border rounded p-3"
                  >
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <Label
                      htmlFor={`day-${day.id}`}
                      className="cursor-pointer flex-grow text-center"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* กลุ่มกล้ามเนื้อเป้าหมาย */}
            <div className="space-y-2">
              <Label htmlFor="target_muscles">กลุ่มกล้ามเนื้อเป้าหมาย</Label>
              <Input
                id="target_muscles"
                name="target_muscles"
                value={formData.target_muscles}
                onChange={handleChange}
                placeholder="เช่น หน้าอก, หลัง, ขา"
              />
              <p className="text-xs text-muted-foreground">
                ระบุกลุ่มกล้ามเนื้อหลักที่เทมเพลตนี้ต้องการพัฒนา
              </p>
            </div>

            {/* รายละเอียด */}
            <div className="space-y-2">
              <Label htmlFor="template_description">รายละเอียด</Label>
              <Textarea
                id="template_description"
                name="template_description"
                value={formData.template_description}
                onChange={handleChange}
                placeholder="อธิบายรายละเอียดของเทมเพลตโปรแกรมการฝึกนี้"
                rows={5}
              />
            </div>

            {/* เผยแพร่สู่สาธารณะ */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public === 1}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_public" className="cursor-pointer">
                เผยแพร่เทมเพลตนี้สู่สาธารณะ
              </Label>
            </div>

            <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-md">
              <p>
                เทมเพลตนี้จะถูกสร้างโดยไม่มีท่าออกกำลังกาย
                คุณสามารถเพิ่มท่าออกกำลังกายได้ในขั้นตอนถัดไป
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังสร้างเทมเพลต..." : "สร้างเทมเพลต"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

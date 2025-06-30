"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { InsertLogNutrition } from "@/actions/member/my-nutrition-plans/upsertLogNutrtion";
import { PlusCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Component ฟอร์มสำหรับบันทึก nutrition intake
 * @param {number} memberId - ID ของสมาชิก
 * @param {function} onSuccess - Callback เมื่อบันทึกสำเร็จ (สำหรับ refresh data)
 */
const NutritionLogger = ({ memberId, onSuccess }) => {
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date(),
    calories: "",
    protein: "",
    carb: "",
    fat: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error เมื่อผู้ใช้แก้ไข
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // ตรวจสอบวันที่
    if (!formData.date) {
      newErrors.date = "กรุณาเลือกวันที่";
    }

    // ตรวจสอบ macros (ต้องเป็นตัวเลขและไม่ติดลบ)
    const macroFields = ["calories", "protein", "carb", "fat"];
    const fieldLabels = {
      calories: "แคลอรี่",
      protein: "โปรตีน",
      carb: "คาร์โบไหเดรต",
      fat: "ไขมัน",
    };

    macroFields.forEach((field) => {
      const value = formData[field];

      if (!value || value === "") {
        newErrors[field] = `กรุณากรอก${fieldLabels[field]}`;
      } else {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          newErrors[field] = `${fieldLabels[field]}ต้องเป็นตัวเลข`;
        } else if (numValue < 0) {
          newErrors[field] = `${fieldLabels[field]}ต้องไม่ติดลบ`;
        } else if (numValue > 10000) {
          newErrors[field] = `${fieldLabels[field]}สูงเกินไป (มากกว่า 10,000)`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await InsertLogNutrition({
        memberId,
        date: formData.date.toISOString().split("T")[0], // Format เป็น YYYY-MM-DD
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carb: parseFloat(formData.carb),
        fat: parseFloat(formData.fat),
      });

      if (result.success) {
        // แสดง success toast
        toast({
          title: "✅ บันทึกสำเร็จ",
          description:
            result.action === "accumulated"
              ? `บวกเพิ่มในวันนี้: +${result.added_calories} แคลอรี่`
              : `บันทึกใหม่: ${result.total_calories} แคลอรี่`,
          variant: "default",
        });

        // Reset form
        setFormData({
          date: new Date(),
          calories: "",
          protein: "",
          carb: "",
          fat: "",
        });

        // Refresh ข้อมูลใน DailyProgress และ WeeklyProgress
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback: refresh หน้าทั้งหมด
          router.refresh();
        }
      } else {
        // แสดง error toast
        toast({
          title: "❌ เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting nutrition log:", error);
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-emerald-600" />
          บันทึกการบริโภคอาหาร
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* วันที่ */}
          <div className="space-y-2">
            <Label htmlFor="date">วันที่</Label>
            <DatePicker
              value={formData.date}
              onChange={(date) => handleInputChange("date", date)}
              placeholder="เลือกวันที่"
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Input Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* แคลอรี่ */}
            <div className="space-y-2">
              <Label htmlFor="calories">แคลอรี่ (kcal)</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                step="0.1"
                value={formData.calories}
                onChange={(e) => handleInputChange("calories", e.target.value)}
                placeholder="เช่น 350"
                disabled={isSubmitting}
                className={errors.calories ? "border-red-500" : ""}
              />
              {errors.calories && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.calories}
                </p>
              )}
            </div>

            {/* โปรตีน */}
            <div className="space-y-2">
              <Label htmlFor="protein">โปรตีน (g)</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={formData.protein}
                onChange={(e) => handleInputChange("protein", e.target.value)}
                placeholder="เช่น 25"
                disabled={isSubmitting}
                className={errors.protein ? "border-red-500" : ""}
              />
              {errors.protein && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.protein}
                </p>
              )}
            </div>

            {/* คาร์โบไหเดรต */}
            <div className="space-y-2">
              <Label htmlFor="carb">คาร์โบไหเดรต (g)</Label>
              <Input
                id="carb"
                type="number"
                min="0"
                step="0.1"
                value={formData.carb}
                onChange={(e) => handleInputChange("carb", e.target.value)}
                placeholder="เช่น 45"
                disabled={isSubmitting}
                className={errors.carb ? "border-red-500" : ""}
              />
              {errors.carb && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.carb}
                </p>
              )}
            </div>

            {/* ไขมัน */}
            <div className="space-y-2">
              <Label htmlFor="fat">ไขมัน (g)</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleInputChange("fat", e.target.value)}
                placeholder="เช่น 15"
                disabled={isSubmitting}
                className={errors.fat ? "border-red-500" : ""}
              />
              {errors.fat && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fat}
                </p>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>หมายเหตุ:</strong> ระบบจะบวกสะสมข้อมูลในวันเดียวกัน
              หากคุณบันทึกหลายครั้ง
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                บันทึกข้อมูล
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NutritionLogger;

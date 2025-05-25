"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/utils";

/**
 * MacroDetailModal Component - แสดงรายละเอียด macro เมื่อคลิก card
 * @param {boolean} isOpen - สถานะการเปิด modal
 * @param {Function} onClose - callback เมื่อปิด modal
 * @param {Object} macro - ข้อมูล macro ที่เลือก
 * @param {string} period - period ปัจจุบัน
 * @param {number} consumed - ปริมาณที่บริโภคแล้ว
 */
export default function MacroDetailModal({
  isOpen,
  onClose,
  macro,
  period = "daily",
  consumed = 0,
}) {
  if (!macro) return null;

  // คำนวณข้อมูลต่างๆ
  const progressPercentage =
    macro.value > 0 ? Math.min((consumed / macro.value) * 100, 100) : 0;
  const remaining = Math.max(0, macro.value - consumed);

  // กำหนดสีตาม macro type
  const getColorClasses = (color) => {
    const colorMap = {
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        progress: "bg-orange-500",
        icon: "text-orange-500",
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-600",
        progress: "bg-red-500",
        icon: "text-red-500",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        progress: "bg-green-500",
        icon: "text-green-500",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        progress: "bg-yellow-500",
        icon: "text-yellow-500",
      },
    };
    return colorMap[color] || colorMap.orange;
  };

  const colors = getColorClasses(macro.color);

  // แปลง period เป็นภาษาไทย
  const periodLabels = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    monthly: "รายเดือน",
  };

  // คำนวณค่าต่างๆ สำหรับแสดงผล
  const getRecommendations = () => {
    if (macro.id === "calories") {
      return [
        "แบ่งการบริโภคเป็น 3 มื้อหลัก + 2 มื้อว่าง",
        "ควรบริโภคอาหารที่มีคุณค่าทางโภชนาการสูง",
        "หลีกเลี่ยงอาหารที่มีน้ำตาลและไขมันเกิน",
      ];
    } else if (macro.id === "protein") {
      return [
        "บริโภคโปรตีนในทุกมื้ออาหาร",
        "เลือกโปรตีนจากแหล่งที่หลากหลาย",
        "ควรบริโภคหลังออกกำลังกายภายใน 30 นาที",
      ];
    } else if (macro.id === "carbs") {
      return [
        "เลือกคาร์โบไฮเดรตเชิงซ้อน",
        "บริโภคก่อนออกกำลังกาย 1-2 ชั่วโมง",
        "หลีกเลี่ยงน้ำตาลและแป้งขาว",
      ];
    } else if (macro.id === "fat") {
      return [
        "เลือกไขมันดีจากถั่ว อะโวคาโด น้ำมันมะกอก",
        "หลีกเลี่ยงไขมันทรานส์",
        "ควรบริโภคร่วมกับวิตามินที่ละลายในไขมัน",
      ];
    }
    return [];
  };

  const recommendations = getRecommendations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className={cn("text-2xl", colors.icon)}>{macro.icon}</span>
            <div>
              <span className={colors.text}>{macro.name}</span>
              <span className="text-gray-500 text-sm ml-2">
                ({periodLabels[period]})
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Card */}
          <Card className={colors.bg}>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {macro.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">เป้าหมาย</div>
                </div>
                <div>
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {consumed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">บริโภคแล้ว</div>
                </div>
                <div>
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {remaining.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">เหลือ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ความคืบหน้า</span>
              <span className={cn("text-sm font-bold", colors.text)}>
                {Math.round(progressPercentage)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn(
                    "h-3 rounded-full transition-all duration-500",
                    colors.progress
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>0 {macro.unit}</span>
                <span>
                  {macro.value.toLocaleString()} {macro.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <div
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-full text-sm font-medium",
                progressPercentage >= 100
                  ? "bg-green-100 text-green-700"
                  : progressPercentage >= 75
                  ? "bg-yellow-100 text-yellow-700"
                  : progressPercentage >= 50
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {progressPercentage >= 100
                ? "🎉 บรรลุเป้าหมายแล้ว!"
                : progressPercentage >= 75
                ? "🔥 ใกล้เป้าหมายแล้ว"
                : progressPercentage >= 50
                ? "💪 กำลังดำเนินการ"
                : "🚀 เริ่มต้นกันเลย"}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">💡 คำแนะนำ</h4>
            <div className="space-y-2">
              {recommendations.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                      colors.progress
                    )}
                  />
                  <span className="text-gray-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              📝 บันทึกอาหาร
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              📊 ดูประวัติ
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/utils";

/**
 * MacroCard Component - แสดงข้อมูล macro แต่ละตัว
 * @param {Object} macro - ข้อมูล macro
 * @param {Function} onClick - callback เมื่อคลิก card
 * @param {boolean} isSelected - สถานะการเลือก
 * @param {number} consumed - ปริมาณที่บริโภคแล้ว (สำหรับอนาคต)
 */
export default function MacroCard({
  macro,
  onClick,
  isSelected = false,
  consumed = 0,
  className,
}) {
  // คำนวณเปอร์เซ็นต์ความสำเร็จ
  const progressPercentage =
    macro.value > 0 ? Math.min((consumed / macro.value) * 100, 100) : 0;

  // กำหนดสีตาม macro type
  const getColorClasses = (color) => {
    const colorMap = {
      orange: {
        bg: "bg-orange-50 hover:bg-orange-100",
        border: "border-orange-200 hover:border-orange-300",
        text: "text-orange-600",
        progress: "bg-orange-500",
        icon: "text-orange-500",
        selected: "border-orange-500 bg-orange-100",
      },
      red: {
        bg: "bg-red-50 hover:bg-red-100",
        border: "border-red-200 hover:border-red-300",
        text: "text-red-600",
        progress: "bg-red-500",
        icon: "text-red-500",
        selected: "border-red-500 bg-red-100",
      },
      green: {
        bg: "bg-green-50 hover:bg-green-100",
        border: "border-green-200 hover:border-green-300",
        text: "text-green-600",
        progress: "bg-green-500",
        icon: "text-green-500",
        selected: "border-green-500 bg-green-100",
      },
      yellow: {
        bg: "bg-yellow-50 hover:bg-yellow-100",
        border: "border-yellow-200 hover:border-yellow-300",
        text: "text-yellow-600",
        progress: "bg-yellow-500",
        icon: "text-yellow-500",
        selected: "border-yellow-500 bg-yellow-100",
      },
    };
    return colorMap[color] || colorMap.orange;
  };

  const colors = getColorClasses(macro.color);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
        "border-2 transform-gpu",
        isSelected ? colors.selected : `${colors.bg} ${colors.border}`,
        className
      )}
      onClick={() => onClick?.(macro)}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("text-2xl", colors.icon)}>{macro.icon}</div>
            <div>
              <h3 className={cn("font-semibold text-lg", colors.text)}>
                {macro.name}
              </h3>
              <p className="text-sm text-gray-500">เป้าหมาย</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-right">
            <div className={cn("text-2xl font-bold", colors.text)}>
              {macro.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{macro.unit}</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ความคืบหน้า</span>
              <span className={colors.text}>
                {consumed.toLocaleString()} / {macro.value.toLocaleString()}{" "}
                {macro.unit}
              </span>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    colors.progress
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Progress Percentage */}
              <div className="absolute -top-1 right-0 transform translate-y-full">
                <span className={cn("text-xs font-medium", colors.text)}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              เหลือ: {Math.max(0, macro.value - consumed).toLocaleString()}{" "}
              {macro.unit}
            </span>

            {/* Status Badge */}
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                progressPercentage >= 100
                  ? "bg-green-100 text-green-700"
                  : progressPercentage >= 75
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {progressPercentage >= 100
                ? "สำเร็จ"
                : progressPercentage >= 75
                ? "ใกล้เป้า"
                : "ต้องเพิ่ม"}
            </div>
          </div>
        </div>

        {/* Click Indicator */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <span>คลิกเพื่อดูรายละเอียด</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

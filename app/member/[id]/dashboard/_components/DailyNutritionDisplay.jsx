"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";
import Link from "next/link";

/**
 * DailyNutritionDisplay Component - แสดงผลโภชนาการรายวันแบบ Circular Progress
 * @param {Object} nutritionData - ข้อมูลโภชนาการวันนี้
 * @param {number} memberId - รหัสสมาชิก
 */
export default function DailyNutritionDisplay({ nutritionData, memberId }) {
  if (!nutritionData?.success || !nutritionData?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5" />
            <span>โภชนาการรายวัน</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-gray-500">ไม่มีข้อมูลโภชนาการสำหรับวันนี้</p>
          <Button size="sm" className="mt-4" asChild>
            <Link href={`/member/${memberId}/quick-add/macro-log`}>
              เริ่มบันทึกอาหาร
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { nutrition, targets } = nutritionData.data;
  
  // คำนวณค่าต่างๆ
  const consumed = nutrition.consumed_calories_today || 0;
  const target = targets?.daily?.calories || nutrition.calorie_target || 0;
  const remaining = Math.max(0, target - consumed);
  const progressPercentage = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;

  // ข้อมูลแมโคร
  const macros = [
    {
      name: "Protein",
      color: "bg-orange-600",
      progressColor: "bg-orange-500",
      consumed: nutrition.consumed_protein_today || 0,
      target: targets?.daily?.protein || Math.round((target * (nutrition.protein_ratio || 30) / 100) / 4),
      unit: "g"
    },
    {
      name: "Fat", 
      color: "bg-yellow-500",
      progressColor: "bg-yellow-400",
      consumed: nutrition.consumed_fat_today || 0,
      target: targets?.daily?.fat || Math.round((target * (nutrition.fat_ratio || 25) / 100) / 9),
      unit: "g"
    },
    {
      name: "Carbs",
      color: "bg-green-600", 
      progressColor: "bg-green-500",
      consumed: nutrition.consumed_carb_today || 0,
      target: targets?.daily?.carbs || Math.round((target * (nutrition.carb_ratio || 45) / 100) / 4),
      unit: "g"
    }
  ];

  const todayDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <Card className="w-full flex flex-col overflow-hidden bg-white shadow-sm min-h-[260px]">
      
      <CardContent className="flex-1 flex flex-col space-y-4 md:space-y-6 overflow-y-auto p-4 md:p-6">
        {/* Circular Progress Section with Side Stats */}
        <div className="relative flex items-center justify-between px-2 md:px-4 flex-shrink-0">
          {/* Left Stats - Consumed */}
          <div className="text-center flex-shrink-0">
            <div className="text-lg md:text-xl font-bold text-gray-900">{consumed}</div>
            <div className="text-xs text-gray-500 font-medium">กินไปแล้ว</div>
          </div>

          {/* Center Circle */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50" 
                r="38"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-in-out"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                }}
              />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-1">{remaining}</div>
              <div className="text-xs text-gray-400 font-medium">เหลือ</div>
            </div>
          </div>

          {/* Right Stats - Target */}
          <div className="text-center flex-shrink-0">
            <div className="text-lg md:text-xl font-bold text-gray-900">{target}</div>
            <div className="text-xs text-gray-500 font-medium">เป้าหมาย</div>
          </div>
        </div>

        {/* Macros Section - 3 Column Layout */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-1 md:px-2 flex-shrink-0">
          {macros.map((macro) => {
            const macroProgress = macro.target > 0 ? Math.min(100, (macro.consumed / macro.target) * 100) : 0;
            return (
              <div key={macro.name} className="text-center space-y-2">
                {/* Macro Name */}
                <div className="text-xs sm:text-sm font-semibold text-gray-800">{macro.name}</div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                  <div 
                    className={`h-2 sm:h-3 rounded-full transition-all duration-700 ease-out ${macro.progressColor} shadow-sm`}
                    style={{ width: `${macroProgress}%` }}
                  />
                </div>
                
                {/* Consumed / Target */}
                <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {macro.consumed} / {macro.target}{macro.unit}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
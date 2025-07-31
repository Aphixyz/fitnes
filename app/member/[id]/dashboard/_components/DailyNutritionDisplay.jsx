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
            <span>Daily Nutrition</span>
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
      color: "bg-red-500",
      progressColor: "bg-red-400",
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
      color: "bg-green-500", 
      progressColor: "bg-green-400",
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
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-sm font-medium">วันนี้ควรบริโภค</span>
          </div>
        </CardTitle>
        
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Circular Progress Section */}
        <div className="flex items-center justify-center relative flex-shrink-0">
          {/* Background Circle */}
          <div className="relative w-36 h-36 md:w-40 md:h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50" 
                r="42"
                stroke="#f3f4f6"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#3b82f6"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{remaining}</div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center text-center flex-shrink-0">
          <div>
            <div className="text-lg font-bold text-gray-900">{consumed}</div>
            <div className="text-xs text-gray-500">Consumed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{target}</div>
            <div className="text-xs text-gray-500">Target</div>
          </div>
        </div>

        {/* Macros Section */}
        <div className="space-y-3 flex-1 min-h-0">
          {macros.map((macro) => {
            const macroProgress = macro.target > 0 ? Math.min(100, (macro.consumed / macro.target) * 100) : 0;
            return (
              <div key={macro.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${macro.color}`}></div>
                    <span className="text-xs font-medium">{macro.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {macro.consumed} / {macro.target}{macro.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${macro.progressColor}`}
                    style={{ width: `${macroProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
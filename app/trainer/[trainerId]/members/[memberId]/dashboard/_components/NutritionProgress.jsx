import React from 'react';
import { Progress } from '@/components/ui/progress';

/**
 * CircularProgress component - แสดง progress แบบวงกลม
 */
function CircularProgress({ percentage, size = 60, strokeWidth = 6, color = "#22c55e" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

/**
 * MacroBar component - แสดง macro progress bar พร้อมข้อมูล
 */
function MacroBar({ label, current, goal, unit = "g" }) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOver = current > goal && goal > 0;
  const overAmount = isOver ? current - goal : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-gray-700'}`}>
          {current} {unit} / {goal} {unit}
          {isOver && (
            <span className="ml-1 text-red-600">
              (เกินไป {overAmount} {unit})
            </span>
          )}
        </span>
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar - green for consumed portion */}
        <div 
          className={`h-full transition-all duration-300 ease-in-out ${
            isOver ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * NutritionProgress component - แสดงความคืบหน้าการบริโภคโภชนาการ
 */
export function NutritionProgress({ 
  totalCalories = 0,
  goalCalories = 2200,
  protein = 0,
  proteinGoal = 120,
  carb = 0,
  carbGoal = 280,
  fat = 0,
  fatGoal = 80
}) {
  // คำนวณเปอร์เซ็นต์แคลอรี่
  const caloriePercentage = goalCalories > 0 ? (totalCalories / goalCalories) * 100 : 0;
  const isCalorieOver = totalCalories > goalCalories && goalCalories > 0;

  // กำหนดสีส้มสำหรับ CircularProgress
  const getCalorieColor = () => {
    if (isCalorieOver) return "#ef4444"; // red เมื่อเกิน
    return "#f97316"; // orange สำหรับการกินปกติ
  };

  return (
    <div className="space-y-4">
      {/* Calorie Progress Circle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CircularProgress
            percentage={Math.min(caloriePercentage, 100)}
            size={70}
            strokeWidth={8}
            color={getCalorieColor()}
          />
          <div>
            <div className="text-sm font-medium text-gray-600">แคลอรี่ทั้งหมด</div>
            <div className={`text-lg font-bold ${isCalorieOver ? 'text-red-600' : 'text-gray-800'}`}>
              {totalCalories} แคล
            </div>

          </div>
        </div>

        {/* Goal Calories */}
        <div className="text-right">
          <div className="text-xs text-gray-500">เป้าหมาย</div>
          <div className="text-xl font-bold text-orange-600">
            {goalCalories} แคล
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 mb-2">
          สารอาหาร (Macros)
        </div>
        
        <MacroBar
          label="โปรตีน"
          current={protein}
          goal={proteinGoal}
          unit="ก."
        />

        <MacroBar
          label="คาร์โบไหเดรต"
          current={carb}
          goal={carbGoal}
          unit="ก."
        />

        <MacroBar
          label="ไขมัน"
          current={fat}
          goal={fatGoal}
          unit="ก."
        />
      </div>
    </div>
  );
}

export default NutritionProgress;
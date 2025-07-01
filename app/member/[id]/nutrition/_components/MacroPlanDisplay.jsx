"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Calendar, User, Target } from "lucide-react";
import { calcMacroGrams } from "@/utils/macro-utils";
import { formatDate } from "@/utils/utils";

/**
 * Component แสดงข้อมูล Macro Plan ปัจจุบัน
 * @param {Object} plan - ข้อมูล macro plan จาก fetchNutritionPlans
 */
const MacroPlanDisplay = ({ plan }) => {
  // คำนวณ Target Calories (ใช้ค่าเริ่มต้น 2000 หากไม่มีข้อมูล TDEE)
  // ในอนาคตสามารถดึงจาก member health data มาคำนวณ TDEE ได้
  const targetCalories = 2000; // TODO: คำนวณจาก TDEE จริง

  // คำนวณ macros เป็น grams ใช้ helper function จาก macro-utils.js
  const macroRatios = {
    protein: plan.protein_ratio,
    carb: plan.carb_ratio,
    fat: plan.fat_ratio,
  };

  const macroTargets = calcMacroGrams(targetCalories, macroRatios);
  const {
    protein: targetProtein,
    carb: targetCarb,
    fat: targetFat,
  } = macroTargets;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-6 w-6 text-emerald-600" />
              แผนโภชนาการปัจจุบัน
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              แผนการบริโภค macronutrients ที่ผู้ฝึกสอนกำหนดให้
            </CardDescription>
          </div>
          <Badge
            variant="success"
            className="bg-emerald-100 text-emerald-800 border-emerald-200"
          >
            {plan.plan_status === "active" ? "ใช้งานอยู่" : plan.plan_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ข้อมูลแผน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              ระยะเวลา: {formatDate(plan.start_date)} -{" "}
              {formatDate(plan.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>ผู้ฝึกสอน ID: {plan.trainer_id}</span>
          </div>
        </div>

        {/* Target Calories */}
        <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700 mb-1">เป้าหมายแคลอรี่ต่อวัน</p>
          <p className="text-3xl font-bold text-emerald-800">
            {targetCalories.toLocaleString()}
          </p>
          <p className="text-sm text-emerald-600">แคลอรี่</p>
        </div>

        {/* Macro Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Protein */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <ProgressCircle
                  value={plan.protein_ratio}
                  size="medium"
                  trackColor="stroke-orange-200"
                  indicatorColor="stroke-orange-500"
                  textColor="text-orange-600"
                />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">โปรตีน</h3>
              <p className="text-2xl font-bold text-orange-700">
                {targetProtein}g
              </p>
              <p className="text-sm text-orange-600">
                ({plan.protein_ratio}% ของแคลอรี่)
              </p>
            </CardContent>
          </Card>

          {/* Carbohydrates */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <ProgressCircle
                  value={plan.carb_ratio}
                  size="medium"
                  trackColor="stroke-blue-200"
                  indicatorColor="stroke-blue-500"
                  textColor="text-blue-600"
                />
              </div>
              <h3 className="font-semibold text-blue-800 mb-2">คาร์โบไหเดรต</h3>
              <p className="text-2xl font-bold text-blue-700">{targetCarb}g</p>
              <p className="text-sm text-blue-600">
                ({plan.carb_ratio}% ของแคลอรี่)
              </p>
            </CardContent>
          </Card>

          {/* Fat */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <ProgressCircle
                  value={plan.fat_ratio}
                  size="medium"
                  trackColor="stroke-purple-200"
                  indicatorColor="stroke-purple-500"
                  textColor="text-purple-600"
                />
              </div>
              <h3 className="font-semibold text-purple-800 mb-2">ไขมัน</h3>
              <p className="text-2xl font-bold text-purple-700">{targetFat}g</p>
              <p className="text-sm text-purple-600">
                ({plan.fat_ratio}% ของแคลอรี่)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* คำแนะนำ */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 คำแนะนำ</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• บันทึกการบริโภคอาหารทุกมื้อเพื่อติดตามความคืบหน้า</li>
            <li>• หากเกินเป้าหมายใน macro ใดให้ปรับปรุงในมื้อถัดไป</li>
            <li>• ดื่มน้ำให้เพียงพอ อย่างน้อย 8-10 แก้วต่อวัน</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacroPlanDisplay;

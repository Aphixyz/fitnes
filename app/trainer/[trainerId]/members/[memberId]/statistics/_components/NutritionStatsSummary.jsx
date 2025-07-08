"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Utensils, Target, TrendingUp, Calendar, Activity } from "lucide-react";

const NutritionStatsSummary = ({ data }) => {
  // ตรวจสอบว่ามีข้อมูล nutrition หรือไม่
  if (!data?.nutrition || !data.nutrition.summary.hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            สรุปการปฏิบัติตามแผนโภชนาการ
          </h2>
        </div>

        <Card className="bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Utensils className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              ไม่พบข้อมูลโภชนาการ
            </h3>
            <p className="text-gray-500 text-center">
              สมาชิกยังไม่ได้บันทึกข้อมูลการบริโภคอาหาร
              <br />
              หรือยังไม่มีแผนโภชนาการที่กำหนดไว้
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { nutrition } = data;
  const { summary, adherence, targets, totals } = nutrition;

  // ฟังก์ชันสำหรับกำหนดสีตาม adherence level
  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getAdherenceBadgeColor = (level) => {
    switch (level) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAdherenceLabelThai = (level) => {
    switch (level) {
      case "excellent":
        return "ดีเยี่ยม";
      case "good":
        return "ดี";
      case "fair":
        return "พอใช้";
      case "poor":
        return "ต้องปรับปรุง";
      default:
        return "ไม่มีข้อมูล";
    }
  };

  // คำนวณ progress color สำหรับแต่ละ macro
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score Card */}
        <Card className={`border-2 ${getAdherenceColor(summary.averageScore)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">คะแนนรวม</CardTitle>
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageScore}%</div>
            <p className="text-xs text-gray-600 mt-1">ค่าเฉลี่ยการปฏิบัติตาม</p>
            <Progress
              value={summary.averageScore}
              className="mt-2 h-2"
              indicatorClassName={getProgressColor(summary.averageScore)}
            />
          </CardContent>
        </Card>

        {/* Logged Days Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                วันที่บันทึก
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.loggedDays}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              วัน ({summary.periodLabel})
            </p>
          </CardContent>
        </Card>

        {/* Calorie Adherence Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">แคลอรี่</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {adherence.calories}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {totals.actual.calories.toLocaleString()} /{" "}
              {totals.target.calories.toLocaleString()} kcal
            </p>
            <Progress
              value={adherence.calories}
              className="mt-2 h-2"
              indicatorClassName={getProgressColor(adherence.calories)}
            />
          </CardContent>
        </Card>

        {/* Average Daily Target Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                เป้าหมายรายวัน
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {targets.calories.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">kcal ต่อวัน</p>
          </CardContent>
        </Card>
      </div>

      {/* Macro Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            การปฏิบัติตาม Macronutrients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  โปรตีน
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {adherence.protein}%
                </span>
              </div>
              <Progress
                value={adherence.protein}
                className="h-3"
                indicatorClassName={getProgressColor(adherence.protein)}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{totals.actual.protein.toFixed(1)}g</span>
                <span>เป้าหมาย: {totals.target.protein.toFixed(1)}g</span>
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  คาร์โบไฮเดรต
                </span>
                <span className="text-sm font-bold text-green-600">
                  {adherence.carb}%
                </span>
              </div>
              <Progress
                value={adherence.carb}
                className="h-3"
                indicatorClassName={getProgressColor(adherence.carb)}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{totals.actual.carb.toFixed(1)}g</span>
                <span>เป้าหมาย: {totals.target.carb.toFixed(1)}g</span>
              </div>
            </div>

            {/* Fats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ไขมัน</span>
                <span className="text-sm font-bold text-yellow-600">
                  {adherence.fat}%
                </span>
              </div>
              <Progress
                value={adherence.fat}
                className="h-3"
                indicatorClassName={getProgressColor(adherence.fat)}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{totals.actual.fat.toFixed(1)}g</span>
                <span>เป้าหมาย: {totals.target.fat.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionStatsSummary;

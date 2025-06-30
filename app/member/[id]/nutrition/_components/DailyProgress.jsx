"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { calcMacroGrams } from "@/utils/macro-utils";
import { fetchDailyIntake } from "@/actions/member/my-nutrition-plans/fetchDailyIntake";

/**
 * Component แสดงความคืบหน้ารายวัน
 * @param {number} memberId - ID ของสมาชิก
 * @param {Object} macroPlan - ข้อมูล macro plan สำหรับคำนวณ target
 */
const DailyProgress = ({ memberId, macroPlan }) => {
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // คำนวณ targets จาก macro plan ใช้ helper function จาก macro-utils.js
  const targetCalories = 2000; // TODO: คำนวณจาก TDEE จริง

  const macroRatios = {
    protein: macroPlan.protein_ratio,
    carb: macroPlan.carb_ratio,
    fat: macroPlan.fat_ratio,
  };

  const macroTargets = calcMacroGrams(targetCalories, macroRatios);
  const targets = {
    calories: targetCalories,
    ...macroTargets,
  };

  // ดึงข้อมูล daily intake logs
  const fetchDailyProgress = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // เรียก server action เพื่อดึงข้อมูลจริง
      const intakeData = await fetchDailyIntake(memberId, today);

      if (intakeData) {
        setDailyData({
          date: intakeData.date,
          calories: intakeData.calories,
          protein: intakeData.protein,
          carb: intakeData.carb,
          fat: intakeData.fat,
          intake_id: intakeData.intake_id,
        });
      } else {
        // ไม่มีข้อมูลในวันนี้
        setDailyData({
          date: today,
          calories: 0,
          protein: 0,
          carb: 0,
          fat: 0,
          intake_id: null,
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching daily progress:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyProgress();
  }, [memberId]);

  // คำนวณ progress percentage
  const calculateProgress = (current, target) => {
    if (!current || !target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // คำนวณ remaining values
  const calculateRemaining = (current, target) => {
    const remaining = target - current;
    return remaining > 0 ? remaining : 0;
  };

  // ฟอร์แมตตัวเลข
  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  // สีสำหรับ progress bars
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-yellow-500";
    if (percentage >= 70) return "bg-emerald-500";
    return "bg-blue-500";
  };

  const getStatusBadge = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) {
      return <Badge variant="destructive">เกินเป้า</Badge>;
    } else if (percentage >= 90) {
      return (
        <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
          ใกล้เป้า
        </Badge>
      );
    } else if (percentage >= 70) {
      return (
        <Badge variant="success" className="bg-emerald-100 text-emerald-800">
          ดี
        </Badge>
      );
    } else {
      return <Badge variant="secondary">ต้องเพิ่ม</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDailyProgress} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    );
  }

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              ความคืบหน้าวันนี้
            </CardTitle>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {today}
            </p>
          </div>
          <Button onClick={fetchDailyProgress} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Card - แคลอรี่รวม */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">แคลอรี่รวมวันนี้</h3>
              {getStatusBadge(dailyData.calories, targets.calories)}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-emerald-700">
                {formatNumber(dailyData.calories)}
              </span>
              <span className="text-lg text-gray-600">
                / {formatNumber(targets.calories)} kcal
              </span>
            </div>
            <Progress
              value={calculateProgress(dailyData.calories, targets.calories)}
              className="h-3"
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-600">
                เหลือ:{" "}
                {formatNumber(
                  calculateRemaining(dailyData.calories, targets.calories)
                )}{" "}
                kcal
              </span>
              <span className="text-gray-600">
                {Math.round((dailyData.calories / targets.calories) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Macros Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Protein */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-orange-800">โปรตีน</h4>
                {getStatusBadge(dailyData.protein, targets.protein)}
              </div>
              <div className="text-center mb-3">
                <span className="text-xl font-bold text-orange-700">
                  {formatNumber(dailyData.protein)}g
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  / {targets.protein}g
                </span>
              </div>
              <Progress
                value={calculateProgress(dailyData.protein, targets.protein)}
                className="h-2 mb-2"
              />
              <p className="text-xs text-gray-600 text-center">
                เหลือ: {calculateRemaining(dailyData.protein, targets.protein)}g
              </p>
            </CardContent>
          </Card>

          {/* Carbohydrates */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800">คาร์โบไหเดรต</h4>
                {getStatusBadge(dailyData.carb, targets.carb)}
              </div>
              <div className="text-center mb-3">
                <span className="text-xl font-bold text-blue-700">
                  {formatNumber(dailyData.carb)}g
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  / {targets.carb}g
                </span>
              </div>
              <Progress
                value={calculateProgress(dailyData.carb, targets.carb)}
                className="h-2 mb-2"
              />
              <p className="text-xs text-gray-600 text-center">
                เหลือ: {calculateRemaining(dailyData.carb, targets.carb)}g
              </p>
            </CardContent>
          </Card>

          {/* Fat */}
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-800">ไขมัน</h4>
                {getStatusBadge(dailyData.fat, targets.fat)}
              </div>
              <div className="text-center mb-3">
                <span className="text-xl font-bold text-purple-700">
                  {formatNumber(dailyData.fat)}g
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  / {targets.fat}g
                </span>
              </div>
              <Progress
                value={calculateProgress(dailyData.fat, targets.fat)}
                className="h-2 mb-2"
              />
              <p className="text-xs text-gray-600 text-center">
                เหลือ: {calculateRemaining(dailyData.fat, targets.fat)}g
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>บันทึกแล้ว {dailyData.logs_count} ครั้งวันนี้</span>
          </div>
          <p className="text-xs text-gray-500">
            อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgress;

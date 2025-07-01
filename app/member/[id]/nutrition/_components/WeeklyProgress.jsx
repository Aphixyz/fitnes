"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Calendar, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";
import { calcMacroGrams } from "@/utils/macro-utils";
import { fetchWeeklyStats } from "@/actions/member/my-nutrition-plans/fetchWeeklyIntake";

/**
 * Component แสดงความคืบหน้ารายสัปดาห์
 * @param {number} memberId - ID ของสมาชิก
 * @param {Object} macroPlan - ข้อมูล macro plan สำหรับคำนวณ target
 */
const WeeklyProgress = ({ memberId, macroPlan }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line"); // 'line' or 'bar'

  // คำนวณ targets ใช้ helper function จาก macro-utils.js
  const targetCalories = 2000;

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

  // ดึงข้อมูล weekly intake logs
  const fetchWeeklyProgress = async () => {
    try {
      setIsLoading(true);

      // เรียก server action เพื่อดึงข้อมูลจริง
      const statsData = await fetchWeeklyStats(memberId);

      // เตรียมข้อมูลสำหรับ chart พร้อม target values
      const chartData = statsData.weeklyData.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        calories: day.calories,
        protein: day.protein,
        carb: day.carb,
        fat: day.fat,
        target_calories: targets.calories,
        target_protein: targets.protein,
        target_carb: targets.carb,
        target_fat: targets.fat,
      }));

      setWeeklyData(chartData);
      setWeeklyStats(statsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching weekly progress:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyProgress();
  }, [memberId]);

  // ใช้ค่าเฉลี่ยจาก server action
  const weeklyAverage = weeklyStats?.averages || {
    calories: 0,
    protein: 0,
    carb: 0,
    fat: 0,
  };

  // สีสำหรับ chart
  const chartConfig = {
    calories: {
      label: "แคลอรี่",
      color: "#059669", // emerald-600
    },
    protein: {
      label: "โปรตีน",
      color: "#ea580c", // orange-600
    },
    carb: {
      label: "คาร์โบไหเดรต",
      color: "#2563eb", // blue-600
    },
    fat: {
      label: "ไขมัน",
      color: "#9333ea", // purple-600
    },
    target: {
      label: "เป้าหมาย",
      color: "#6b7280", // gray-500
    },
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWeeklyProgress} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              ความคืบหน้า 7 วันที่ผ่านมา
            </CardTitle>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              สรุปการบริโภคในสัปดาห์นี้
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                setChartType(chartType === "line" ? "bar" : "line")
              }
              variant="outline"
              size="sm"
            >
              {chartType === "line" ? "แท่งกราฟ" : "เส้นกราฟ"}
            </Button>
            <Button onClick={fetchWeeklyProgress} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Weekly Average Summary */}
        {weeklyAverage && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">แคลอรี่เฉลี่ย</p>
              <p className="text-xl font-bold text-emerald-700">
                {weeklyAverage.calories}
              </p>
              <p className="text-xs text-gray-500">/ {targets.calories} kcal</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">โปรตีนเฉลี่ย</p>
              <p className="text-xl font-bold text-orange-700">
                {weeklyAverage.protein}g
              </p>
              <p className="text-xs text-gray-500">/ {targets.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">คาร์บเฉลี่ย</p>
              <p className="text-xl font-bold text-blue-700">
                {weeklyAverage.carb}g
              </p>
              <p className="text-xs text-gray-500">/ {targets.carb}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ไขมันเฉลี่ย</p>
              <p className="text-xl font-bold text-purple-700">
                {weeklyAverage.fat}g
              </p>
              <p className="text-xs text-gray-500">/ {targets.fat}g</p>
            </div>
          </div>
        )}

        {/* Calories Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            แคลอรี่รายวัน
          </h3>
          <ChartContainer config={chartConfig} className="h-64">
            {chartType === "line" ? (
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke={chartConfig.calories.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="target_calories"
                  stroke={chartConfig.target.color}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            ) : (
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="calories"
                  fill={chartConfig.calories.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ChartContainer>
        </div>

        {/* Macros Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Macros รายวัน
          </h3>
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayName" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="protein"
                stroke={chartConfig.protein.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="carb"
                stroke={chartConfig.carb.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="fat"
                stroke={chartConfig.fat.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgress;

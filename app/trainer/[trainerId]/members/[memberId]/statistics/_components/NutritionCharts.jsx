"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, BarChart3, Calendar, Target } from "lucide-react";

const NutritionCharts = ({ data }) => {
  // ตรวจสอบว่ามีข้อมูล nutrition หรือไม่
  if (!data?.nutrition || !data.nutrition.summary.hasData) {
    return (
      <div className="space-y-6">

        <Card className="bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              ไม่พบข้อมูลสำหรับสร้างกราฟ
            </h3>
            <p className="text-gray-500 text-center">
              เมื่อสมาชิกเริ่มบันทึกข้อมูลการบริโภคอาหาร
              <br />
              กราฟแนวโน้มจะแสดงที่นี่
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { nutrition } = data;

  // จัดเตรียมข้อมูลสำหรับกราฟ adherence trends
  const adherenceChartData = useMemo(() => {
    return nutrition.dailyProgress.map((day) => ({
      date: day.date,
      formattedDate: new Date(day.date).toLocaleDateString("th-TH", {
        month: "short",
        day: "numeric",
      }),
      calories: day.adherence.calories,
      protein: day.adherence.protein,
      carb: day.adherence.carb,
      fat: day.adherence.fat,
      // คำนวณค่าเฉลี่ย adherence ของวันนั้น
      average: Math.round(
        (day.adherence.calories +
          day.adherence.protein +
          day.adherence.carb +
          day.adherence.fat) /
          4
      ),
    }));
  }, [nutrition.dailyProgress]);

  // จัดเตรียมข้อมูลสำหรับกราฟ daily intake vs target
  const intakeChartData = useMemo(() => {
    return nutrition.dailyProgress.map((day) => ({
      date: day.date,
      formattedDate: new Date(day.date).toLocaleDateString("th-TH", {
        month: "short",
        day: "numeric",
      }),
      actualCalories: day.actual.calories,
      targetCalories: day.targets.calories,
      actualProtein: day.actual.protein,
      targetProtein: day.targets.protein,
      actualCarb: day.actual.carb,
      targetCarb: day.targets.carb,
      actualFat: day.actual.fat,
      targetFat: day.targets.fat,
    }));
  }, [nutrition.dailyProgress]);

  // Custom tooltip สำหรับกราฟ adherence
  const AdherenceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{`วันที่: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.name}: ${entry.value}%`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip สำหรับกราฟ intake
  const IntakeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{`วันที่: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name.includes("เป้าหมาย")
                  ? `${entry.name}: ${entry.value.toFixed(1)} ${
                      entry.name.includes("แคลอรี่") ? "kcal" : "g"
                    }`
                  : `${entry.name}: ${entry.value.toFixed(1)} ${
                      entry.name.includes("แคลอรี่") ? "kcal" : "g"
                    }`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Adherence Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">แนวโน้มการปฏิบัติตาม (%)</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  domain={[0, 150]}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  label={{
                    value: "Adherence (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<AdherenceTooltip />} />
                <Legend />

                {/* เส้นอ้างอิง 100% */}
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={90} stroke="#3b82f6" strokeDasharray="5 5" />
                <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="5 5" />

                {/* เส้นกราฟสำหรับแต่ละ macro */}
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="แคลอรี่"
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="โปรตีน"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="carb"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="คาร์โบไฮเดรต"
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="fat"
                  stroke="#eab308"
                  strokeWidth={2}
                  name="ไขมัน"
                  dot={{ fill: "#eab308", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Intake vs Target Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              การบริโภครายวัน vs เป้าหมาย
            </CardTitle>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <Badge variant="outline" className="text-xs">
                Actual vs Target
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intakeChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  label={{
                    value: "kcal / g",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<IntakeTooltip />} />
                <Legend />

                {/* แคลอรี่ */}
                <Bar
                  dataKey="actualCalories"
                  fill="#f97316"
                  name="แคลอรี่ (จริง)"
                  opacity={0.8}
                />
                <Bar
                  dataKey="targetCalories"
                  fill="#fb923c"
                  name="แคลอรี่ (เป้าหมาย)"
                  opacity={0.5}
                />

                {/* โปรตีน (ปรับสเกลให้เห็นบนกราฟ) */}
                <Bar
                  dataKey="actualProtein"
                  fill="#3b82f6"
                  name="โปรตีน (จริง)"
                  opacity={0.8}
                />
                <Bar
                  dataKey="targetProtein"
                  fill="#60a5fa"
                  name="โปรตีน (เป้าหมาย)"
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <p>
              * กราฟแสดงข้อมูลแคลอรี่และโปรตีนเป็นหลัก
              เนื่องจากมีค่าที่ใกล้เคียงกัน
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCharts;

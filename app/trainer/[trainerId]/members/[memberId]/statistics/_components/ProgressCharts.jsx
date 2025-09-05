import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const ProgressCharts = ({ data }) => {
  if (!data || !data.dailyProgress || data.dailyProgress.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              ไม่พบข้อมูลสำหรับสร้างกราฟ
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { dailyProgress, totals } = data;

  // จัดเตรียมข้อมูลสำหรับ Volume Progress Chart
  const volumeData = dailyProgress
    .map((day) => ({
      date: format(new Date(day.date), "dd/MM", { locale: th }),
      fullDate: day.date,
      volume: day.metrics.volume,
      reps: day.metrics.reps,
      duration: day.metrics.duration / 60, // แปลงเป็นนาที
    }))
    .reverse(); // reverse เพื่อให้เรียงจากเก่าไปใหม่

  // จัดเตรียมข้อมูลสำหรับ Weekly Frequency (group by week)
  const weeklyData = createWeeklyFrequencyData(dailyProgress);

  // จัดเตรียมข้อมูลสำหรับ Distribution Chart
  const distributionData = [
    { name: "Volume", value: totals.volume, color: "#3b82f6" },
    { name: "Reps", value: totals.reps, color: "#10b981" },
    {
      name: "Duration (min)",
      value: Math.round(totals.duration / 60),
      color: "#f59e0b",
    },
    { name: "Distance (km)", value: totals.distance, color: "#ef4444" },
  ];

  // Custom tooltip สำหรับ charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`วันที่: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Volume Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volume Progress</CardTitle>
          <p className="text-sm text-gray-600">
            ความก้าวหน้าของปริมาณการออกกำลังกายในแต่ละวัน
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-metric Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reps Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reps Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reps" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Workout Frequency</CardTitle>
            <p className="text-sm text-gray-600">
              จำนวนครั้งการออกกำลังกายในแต่ละสัปดาห์
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

// Helper function สำหรับสร้างข้อมูล weekly frequency
function createWeeklyFrequencyData(dailyProgress) {
  const weeklyMap = {};

  dailyProgress.forEach((day) => {
    const date = new Date(day.date);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
    const weekKey = format(weekStart, "dd/MM", { locale: th });

    if (!weeklyMap[weekKey]) {
      weeklyMap[weekKey] = {
        week: weekKey,
        sessions: 0,
        totalVolume: 0,
      };
    }

    weeklyMap[weekKey].sessions += 1;
    weeklyMap[weekKey].totalVolume += day.metrics.volume;
  });

  return Object.values(weeklyMap).sort(
    (a, b) => new Date(a.week) - new Date(b.week)
  );
}

export default ProgressCharts;

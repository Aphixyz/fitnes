"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { chartColors } from "../shared/ChartContainer";

const DurationChart = ({
  dailyProgress = [],
  period = { type: "WEEK", label: "1 สัปดาห์" },
  height = "h-80",
  className = "",
}) => {
  // Format วันที่แบบสั้น
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  // Data transformation สำหรับ Duration
  const chartData = useMemo(() => {
    if (!dailyProgress || dailyProgress.length === 0) return [];

    return dailyProgress.map((day) => ({
      date: day.date,
      shortDate: formatShortDate(day.date),
      duration: day.metrics?.duration || 0, // วินาที
      durationMinutes: Math.round((day.metrics?.duration || 0) / 60), // นาที
    }));
  }, [dailyProgress]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hours = Math.floor(data.duration / 3600);
      const minutes = Math.floor((data.duration % 3600) / 60);
      const timeString = hours > 0 ? `${hours}ช ${minutes}น` : `${minutes}น`;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 mb-2">
            วันที่ {new Date(data.date).toLocaleDateString("th-TH")}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors.duration }}
            />
            <span className="text-gray-600">เวลา:</span>
            <span className="font-medium">{timeString}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div
        className={`${height} flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">⏱️</div>
          <p className="text-gray-500 text-sm">ไม่มีข้อมูลเวลาการออกกำลังกาย</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="shortDate"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartColors.text }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartColors.text }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="durationMinutes"
            stroke={chartColors.duration}
            fill={`${chartColors.duration}20`}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DurationChart;

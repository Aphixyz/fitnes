"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { chartColors } from "../shared/ChartContainer";

const VolumeChart = ({
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

  // Data transformation สำหรับ Volume
  const chartData = useMemo(() => {
    if (!dailyProgress || dailyProgress.length === 0) return [];

    return dailyProgress.map((day) => ({
      date: day.date,
      shortDate: formatShortDate(day.date),
      volume: day.metrics?.volume || 0,
    }));
  }, [dailyProgress]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 mb-2">
            วันที่ {new Date(data.date).toLocaleDateString("th-TH")}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors.volume }}
            />
            <span className="text-gray-600">ปริมาณ:</span>
            <span className="font-medium">
              {data.volume.toLocaleString()} kg
            </span>
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
          <div className="text-gray-400 text-4xl mb-2">💪</div>
          <p className="text-gray-500 text-sm">
            ไม่มีข้อมูลปริมาณการออกกำลังกาย
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
          <Line
            type="monotone"
            dataKey="volume"
            stroke={chartColors.volume}
            strokeWidth={2}
            dot={{ fill: chartColors.volume, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: chartColors.volume }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;

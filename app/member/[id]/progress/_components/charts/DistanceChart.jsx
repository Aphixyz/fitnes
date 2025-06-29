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

const DistanceChart = ({
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

  // Data transformation สำหรับ Distance
  const chartData = useMemo(() => {
    if (!dailyProgress || dailyProgress.length === 0) return [];

    return dailyProgress.map((day) => ({
      date: day.date,
      shortDate: formatShortDate(day.date),
      distance: day.metrics?.distance || 0, // เมตร
      distanceKm: ((day.metrics?.distance || 0) / 1000).toFixed(2), // กิโลเมตร
    }));
  }, [dailyProgress]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const distanceText =
        data.distance >= 1000
          ? `${data.distanceKm} กม.`
          : `${data.distance} ม.`;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 mb-2">
            วันที่ {new Date(data.date).toLocaleDateString("th-TH")}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors.distance }}
            />
            <span className="text-gray-600">ระยะทาง:</span>
            <span className="font-medium">{distanceText}</span>
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
          <div className="text-gray-400 text-4xl mb-2">🏃‍♂️</div>
          <p className="text-gray-500 text-sm">
            ไม่มีข้อมูลระยะทางการออกกำลังกาย
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
            dataKey="distance"
            stroke={chartColors.distance}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartColors.distance }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistanceChart;

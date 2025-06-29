"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { chartColors } from "../shared/ChartContainer";

const SessionChart = ({
  dailyProgress = [],
  period = { type: "WEEK", label: "1 สัปดาห์" },
  height = "h-80",
  className = "",
}) => {
  // Get maximum expected sessions for period - ย้ายมาก่อน useMemo
  const getMaxSessionsForPeriod = (periodType) => {
    switch (periodType) {
      case "WEEK":
        return 7;
      case "1M":
        return 30;
      case "2M":
        return 60;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      default:
        return 30;
    }
  };

  // Data transformation สำหรับ Sessions
  const chartData = useMemo(() => {
    if (!dailyProgress || dailyProgress.length === 0) return [];

    const sessionCount = dailyProgress.length;
    const maxSessions = getMaxSessionsForPeriod(period.type);
    const percentage = Math.min((sessionCount / maxSessions) * 100, 100);

    return [
      {
        name: "Sessions",
        value: sessionCount,
        percentage: percentage,
        fill: chartColors.sessions,
      },
    ];
  }, [dailyProgress, period]);

  // Calculate frequency per week
  const getFrequencyPerWeek = () => {
    if (!dailyProgress.length) return 0;

    const sessionCount = dailyProgress.length;
    switch (period.type) {
      case "WEEK":
        return sessionCount;
      case "1M":
        return (sessionCount / 4).toFixed(1);
      case "2M":
        return (sessionCount / 8).toFixed(1);
      case "3M":
        return (sessionCount / 12).toFixed(1);
      case "6M":
        return (sessionCount / 24).toFixed(1);
      case "1Y":
        return (sessionCount / 52).toFixed(1);
      default:
        return (sessionCount / 4).toFixed(1);
    }
  };

  // Empty state
  if (!chartData || chartData.length === 0 || chartData[0].value === 0) {
    return (
      <div
        className={`${height} flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📅</div>
          <p className="text-gray-500 text-sm">ไม่มีข้อมูลการออกกำลังกาย</p>
        </div>
      </div>
    );
  }

  const sessionData = chartData[0];
  const frequencyPerWeek = getFrequencyPerWeek();

  return (
    <div className={`${height} ${className} relative`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          data={chartData}
          startAngle={90}
          endAngle={450}
        >
          <RadialBar
            dataKey="percentage"
            cornerRadius={10}
            fill={chartColors.sessions}
            stroke={chartColors.sessions}
            strokeWidth={2}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div
            className="text-3xl font-bold mb-1"
            style={{ color: chartColors.sessions }}
          >
            {sessionData.value}
          </div>
          <div className="text-sm text-gray-600 mb-1">ครั้ง</div>
          <div className="text-xs text-gray-500">
            {frequencyPerWeek} ครั้ง/สัปดาห์
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-gray-500 text-center">
          {sessionData.percentage.toFixed(0)}% ของเป้าหมาย
        </div>
      </div>
    </div>
  );
};

export default SessionChart;

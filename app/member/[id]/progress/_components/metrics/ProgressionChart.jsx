"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { chartColors } from "../shared/ChartContainer";

const ProgressionChart = ({
  dailyProgress = [],
  metric = "volume",
  period = { type: "1M", label: "1 เดือน" },
  height = "h-80",
  showTrendLine = false,
  className = "",
}) => {
  // Format วันที่แบบสั้น - ย้ายมาก่อน useMemo
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  // Data transformation สำหรับแต่ละ metric
  const chartData = useMemo(() => {
    if (!dailyProgress || dailyProgress.length === 0) return [];

    return dailyProgress.map((day) => ({
      date: day.date,
      shortDate: formatShortDate(day.date),
      volume: day.metrics.volume || 0,
      reps: day.metrics.reps || 0,
      duration: day.metrics.duration || 0, // วินาที
      durationMinutes: Math.round((day.metrics.duration || 0) / 60), // นาที
      distance: day.metrics.distance || 0,
      sessions: 1, // แต่ละวันมี 1 session
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
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{getMetricLabel(metric)}:</span>
              <span className="font-medium">
                {formatMetricValue(entry.value, metric)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Metric configuration
  const getMetricConfig = (metric) => {
    const configs = {
      volume: {
        dataKey: "volume",
        color: chartColors.volume,
        label: "ปริมาณ (kg)",
        unit: "kg",
      },
      reps: {
        dataKey: "reps",
        color: chartColors.reps,
        label: "จำนวนครั้ง",
        unit: "ครั้ง",
      },
      duration: {
        dataKey: "durationMinutes",
        color: chartColors.duration,
        label: "เวลา (นาที)",
        unit: "นาที",
      },
      distance: {
        dataKey: "distance",
        color: chartColors.distance,
        label: "ระยะทาง (ม.)",
        unit: "ม.",
      },
      sessions: {
        dataKey: "sessions",
        color: chartColors.sessions,
        label: "จำนวนครั้ง",
        unit: "ครั้ง",
      },
    };
    return configs[metric] || configs.volume;
  };

  const getMetricLabel = (metric) => {
    return getMetricConfig(metric).label;
  };

  const formatMetricValue = (value, metric) => {
    const unit = getMetricConfig(metric).unit;
    return `${value.toLocaleString()} ${unit}`;
  };

  const config = getMetricConfig(metric);

  // Render different chart types based on metric
  const renderChart = () => {
    switch (metric) {
      case "volume":
        return (
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
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: config.color }}
              connectNulls={false}
            />
          </LineChart>
        );

      case "reps":
        return (
          <BarChart data={chartData}>
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
            <Bar
              dataKey={config.dataKey}
              fill={config.color}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      case "duration":
        return (
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
              dataKey={config.dataKey}
              stroke={config.color}
              fill={`${config.color}20`}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case "distance":
        return (
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
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: config.color }}
            />
          </LineChart>
        );

      case "sessions":
        // แปลงข้อมูลสำหรับ RadialBarChart
        const radialData = [
          {
            name: "Sessions",
            value: chartData.length,
            fill: config.color,
          },
        ];

        return (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            data={radialData}
            startAngle={90}
            endAngle={450}
          >
            <RadialBar dataKey="value" cornerRadius={10} fill={config.color} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold"
              fill={config.color}
            >
              {chartData.length}
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm"
              fill={chartColors.text}
            >
              ครั้ง
            </text>
          </RadialBarChart>
        );

      default:
        return null;
    }
  };

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div
        className={`${height} flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📈</div>
          <p className="text-gray-500 text-sm">ไม่มีข้อมูลในช่วงเวลานี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

// Individual chart components for easy use
export const VolumeChart = (props) => (
  <ProgressionChart {...props} metric="volume" />
);

export const RepsChart = (props) => (
  <ProgressionChart {...props} metric="reps" />
);

export const DurationChart = (props) => (
  <ProgressionChart {...props} metric="duration" />
);

export const DistanceChart = (props) => (
  <ProgressionChart {...props} metric="distance" />
);

export const SessionsChart = (props) => (
  <ProgressionChart {...props} metric="sessions" />
);

export default ProgressionChart;

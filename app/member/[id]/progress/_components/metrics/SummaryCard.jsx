import React from "react";
import { chartColors } from "../shared/ChartContainer";

const SummaryCard = ({
  title,
  value,
  unit = "",
  average = null,
  averageUnit = "",
  icon = "📊",
  trend = null,
  color = chartColors.volume,
  className = "",
  isLoading = false,
}) => {
  // Format large numbers
  const formatValue = (val) => {
    if (typeof val !== "number") return val;

    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    } else {
      return val.toLocaleString();
    }
  };

  // Trend indicator
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-200 hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <span className="text-xl" role="img" aria-label={title}>
          {icon}
        </span>
      </div>

      {/* Main Value */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {formatValue(value)}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 font-medium">{unit}</span>
          )}
          {trend && (
            <span className={`text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
            </span>
          )}
        </div>

        {/* Average/Secondary Info */}
        {average !== null && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>เฉลี่ย:</span>
            <span className="font-medium">{formatValue(average)}</span>
            {averageUnit && <span>{averageUnit}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ตัวอย่าง metric cards สำหรับ progress
export const VolumeCard = ({ totals, averages, isLoading }) => (
  <SummaryCard
    title="ปริมาณรวม"
    value={totals?.volume || 0}
    unit="kg"
    average={averages?.volumePerSession || 0}
    averageUnit="kg/session"
    icon="💪"
    color={chartColors.volume}
    isLoading={isLoading}
  />
);

export const RepsCard = ({ totals, averages, isLoading }) => (
  <SummaryCard
    title="จำนวนครั้ง"
    value={totals?.reps || 0}
    unit="ครั้ง"
    average={averages?.repsPerSession || 0}
    averageUnit="ครั้ง/session"
    icon="🔢"
    color={chartColors.reps}
    isLoading={isLoading}
  />
);

export const DurationCard = ({ totals, averages, isLoading }) => (
  <SummaryCard
    title="เวลารวม"
    value={totals?.durationFormatted || "0ส"}
    unit=""
    average={averages?.durationPerSessionFormatted || "0ส"}
    averageUnit="/session"
    icon="⏱️"
    color={chartColors.duration}
    isLoading={isLoading}
  />
);

export const DistanceCard = ({ totals, averages, isLoading }) => (
  <SummaryCard
    title="ระยะทางรวม"
    value={totals?.distance || 0}
    unit="ม."
    average={averages?.distancePerSession || 0}
    averageUnit="ม./session"
    icon="🏃‍♂️"
    color={chartColors.distance}
    isLoading={isLoading}
  />
);

export const SessionsCard = ({ totals, averages, isLoading }) => (
  <SummaryCard
    title="จำนวนครั้งที่ออกกำลังกาย"
    value={totals?.sessions || 0}
    unit="ครั้ง"
    average={averages?.workoutFrequency || 0}
    averageUnit="ครั้ง/สัปดาห์"
    icon="📅"
    color={chartColors.sessions}
    isLoading={isLoading}
  />
);

export default SummaryCard;

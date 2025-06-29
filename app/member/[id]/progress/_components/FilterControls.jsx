"use client";

import React from "react";

const FilterControls = ({
  currentPeriod,
  onPeriodChange,
  onRefresh,
  isLoading = false,
  className = "",
}) => {
  const periods = [
    { key: "WEEK", label: "1W", fullLabel: "1 สัปดาห์" },
    { key: "1M", label: "1M", fullLabel: "1 เดือน" },
    { key: "2M", label: "2M", fullLabel: "2 เดือน" },
    { key: "3M", label: "3M", fullLabel: "3 เดือน" },
    { key: "6M", label: "6M", fullLabel: "6 เดือน" },
    { key: "1Y", label: "1Y", fullLabel: "1 ปี" },
    { key: "ALL", label: "ALL", fullLabel: "ทั้งหมด" },
  ];

  const handlePeriodClick = (periodKey) => {
    if (periodKey !== currentPeriod && !isLoading) {
      onPeriodChange(periodKey);
    }
  };

  const handleRefreshClick = () => {
    if (!isLoading && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${className}`}
    >
      {/* Period Selection Buttons */}
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => {
          const isActive = currentPeriod === period.key;
          const isDisabled = isLoading;

          return (
            <button
              key={period.key}
              onClick={() => handlePeriodClick(period.key)}
              disabled={isDisabled}
              title={period.fullLabel}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
                ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-sm active:scale-95"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
            >
              {period.label}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Current Period Label */}
        <span className="text-sm text-gray-600 hidden sm:inline">
          {periods.find((p) => p.key === currentPeriod)?.fullLabel || "ไม่ระบุ"}
        </span>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isLoading}
          title="รีเฟรชข้อมูล"
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            bg-gray-100 text-gray-700 hover:bg-gray-200
            ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-sm active:scale-95"
            }
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
              <span>โหลด...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span className="hidden sm:inline">รีเฟรช</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// พิเศษ: Advanced Filter Controls (สำหรับอนาคต)
export const AdvancedFilterControls = ({
  currentPeriod,
  onPeriodChange,
  customDateRange,
  onDateRangeChange,
  onRefresh,
  isLoading = false,
  showDateRange = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Controls */}
      <FilterControls
        currentPeriod={currentPeriod}
        onPeriodChange={onPeriodChange}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      {/* Advanced Date Range (Future Feature) */}
      {showDateRange && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">
            ช่วงเวลาที่กำหนดเอง:
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={customDateRange?.startDate || ""}
              onChange={(e) =>
                onDateRangeChange?.({
                  ...customDateRange,
                  startDate: e.target.value,
                })
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              disabled={isLoading}
            />
            <span className="text-gray-500 self-center">ถึง</span>
            <input
              type="date"
              value={customDateRange?.endDate || ""}
              onChange={(e) =>
                onDateRangeChange?.({
                  ...customDateRange,
                  endDate: e.target.value,
                })
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;

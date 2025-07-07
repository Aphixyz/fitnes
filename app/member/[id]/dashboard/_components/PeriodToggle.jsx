"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

/**
 * PeriodToggle Component - สำหรับสลับระหว่าง period ต่างๆ
 * @param {string} activePeriod - period ที่เลือกอยู่
 * @param {Function} onPeriodChange - callback เมื่อเปลี่ยน period
 */
export default function PeriodToggle({ activePeriod, onPeriodChange }) {
  const periods = [
    {
      id: "daily",
      label: "วันนี้",
      shortLabel: "Today",
      icon: "📅",
    },
    {
      id: "weekly",
      label: "สัปดาห์นี้",
      shortLabel: "This Week",
      icon: "📊",
    },
    {
      id: "monthly",
      label: "เดือนนี้",
      shortLabel: "This Month",
      icon: "📈",
    },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {periods.map((period) => (
        <Button
          key={period.id}
          variant="ghost"
          size="sm"
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-all duration-200",
            "hover:bg-white hover:shadow-sm",
            activePeriod === period.id
              ? "bg-white text-blue-600 shadow-sm border border-blue-200"
              : "text-gray-600 hover:text-gray-900"
          )}
          onClick={() => onPeriodChange(period.id)}
        >
          <span className="mr-2">{period.icon}</span>
          <span className="hidden sm:inline">{period.label}</span>
          <span className="sm:hidden">{period.shortLabel}</span>

          {/* Active Indicator */}
          {activePeriod === period.id && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
          )}
        </Button>
      ))}
    </div>
  );
}

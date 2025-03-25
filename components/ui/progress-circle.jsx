"use client";

import React from "react";
import { cn } from "@/utils/utils";

/**
 * คอมโพเนนต์สำหรับแสดงความคืบหน้าเป็นวงกลม
 * @param {number} value - ค่าความคืบหน้า (0-100)
 * @param {string} size - ขนาด (small, medium, large)
 * @param {string} trackColor - สีของเส้นรอบวง
 * @param {string} indicatorColor - สีของส่วนที่แสดงความคืบหน้า
 * @param {string} textColor - สีของตัวอักษร
 */
export function ProgressCircle({
  value = 0,
  size = "medium",
  trackColor = "stroke-gray-200",
  indicatorColor = "stroke-emerald-500",
  textColor = "text-emerald-500",
  className,
  ...props
}) {
  // กำหนดค่าขนาด
  const sizeStyles = {
    small: {
      container: "h-16 w-16",
      svg: "h-16 w-16",
      text: "text-lg",
    },
    medium: {
      container: "h-24 w-24",
      svg: "h-24 w-24",
      text: "text-xl",
    },
    large: {
      container: "h-32 w-32",
      svg: "h-32 w-32",
      text: "text-2xl",
    },
  };

  // คำนวณค่า stroke-dashoffset
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const containerClass = sizeStyles[size]?.container || sizeStyles.medium.container;
  const svgClass = sizeStyles[size]?.svg || sizeStyles.medium.svg;
  const textClass = sizeStyles[size]?.text || sizeStyles.medium.text;

  return (
    <div className={cn("relative flex items-center justify-center", containerClass, className)} {...props}>
      <svg className={svgClass} viewBox="0 0 100 100">
        {/* วงกลมด้านหลัง */}
        <circle
          className={trackColor}
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* วงกลมแสดงความคืบหน้า */}
        <circle
          className={indicatorColor}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-medium", textClass, textColor)}>
          {normalizedValue}%
        </span>
      </div>
    </div>
  );
}
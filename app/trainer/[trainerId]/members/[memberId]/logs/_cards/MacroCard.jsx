"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Circular Progress Component สำหรับแสดง Macros
 */
function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  color,
  label,
  consumed,
  remaining,
  unit = "g",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center">
      {/* Label */}
      <h3 className="text-sm font-medium mb-3" style={{ color: color }}>
        {label}
      </h3>

      {/* Circular Progress */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(value)}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            /{max}
            {unit}
          </span>
        </div>
      </div>

      {/* Remaining text */}
      <p className="text-sm text-gray-500 mt-3">
        เหลือ {remaining} {unit}
      </p>
    </div>
  );
}

/**
 * MacroCard Component - แสดง Protein, Carb, Fat แบบ Circular Progress
 * @param {Object} props
 * @param {Object} props.consumed - {protein: number, carb: number, fat: number}
 * @param {Object} props.targets - {protein_g: number, carb_g: number, fat_g: number}
 * @param {boolean} props.isLoading - สถานะการโหลด
 */
export default function MacroCard({
  consumed = { protein: 0, carb: 0, fat: 0 },
  targets = { protein_g: 0, carb_g: 0, fat_g: 0 },
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mx-auto mb-4"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // คำนวณค่าที่เหลือสำหรับแต่ละ macro
  const carbRemaining = Math.max(0, targets.carb_g - consumed.carb);
  const fatRemaining = Math.max(0, targets.fat_g - consumed.fat);
  const proteinRemaining = Math.max(0, targets.protein_g - consumed.protein);

  return (
    <Card className="p-6 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Macros
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* คาร์บโบไฮเดรต */}
          <CircularProgress
            value={consumed.carb || 0}
            max={targets.carb_g || 0}
            size={160}
            strokeWidth={16}
            color="#10b981" // เขียว
            label="คาร์บโบไฮเดรต"
            consumed={consumed.carb || 0}
            remaining={carbRemaining}
            unit="g"
          />

          {/* ไขมัน */}
          <CircularProgress
            value={consumed.fat || 0}
            max={targets.fat_g || 0}
            size={160}
            strokeWidth={16}
            color="#8b5cf6" // ม่วง
            label="ไขมัน"
            consumed={consumed.fat || 0}
            remaining={fatRemaining}
            unit="g"
          />

          {/* โปรตีน */}
          <CircularProgress
            value={consumed.protein || 0}
            max={targets.protein_g || 0}
            size={160}
            strokeWidth={16}
            color="#f59e0b" // ส้ม
            label="โปรตีน"
            consumed={consumed.protein || 0}
            remaining={proteinRemaining}
            unit="g"
          />
        </div>
      </CardContent>
    </Card>
  );
}

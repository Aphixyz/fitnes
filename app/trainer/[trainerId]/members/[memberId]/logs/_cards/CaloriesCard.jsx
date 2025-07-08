"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Circular Progress Component สำหรับแสดง Calories
 */
function CircularProgress({
  value,
  max,
  size = 200,
  strokeWidth = 20,
  label,
  color,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
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
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 mt-1">{label}</span>
      </div>
    </div>
  );
}

/**
 * CaloriesCard Component with Tabs
 * @param {Object} props
 * @param {number} props.targetCalories - เป้าหมายแคลอรี่
 * @param {number} props.consumedCalories - แคลอรี่ที่บริโภคแล้ว
 * @param {boolean} props.isLoading - สถานะการโหลด
 */
export default function CaloriesCard({
  targetCalories = 0,
  consumedCalories = 0,
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState("consumed");

  // คำนวณ remaining calories
  const remaining = Math.max(0, targetCalories - consumedCalories);

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Calories 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="w-48 h-48 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Calories</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="consumed">Consumed</TabsTrigger>
            <TabsTrigger value="remaining">Remaining</TabsTrigger>
          </TabsList>

          <TabsContent value="consumed" className="space-y-0">
            <div className="flex items-center justify-center">
              <CircularProgress
                value={consumedCalories}
                max={targetCalories}
                size={200}
                strokeWidth={16}
                label="กินแล้ว"
                color="#3b82f6"
              />
            </div>
          </TabsContent>

          <TabsContent value="remaining" className="space-y-0">
            <div className="flex items-center justify-center">
              <CircularProgress
                value={remaining}
                max={targetCalories}
                size={200}
                strokeWidth={16}
                label="เหลือ"
                color="#22c55e"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">เป้าหมาย</p>
              <p className="font-semibold">{targetCalories.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">กินแล้ว</p>
              <p className="font-semibold text-blue-600">
                {consumedCalories.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เหลือ</p>
              <p className="font-semibold text-green-600">
                {remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

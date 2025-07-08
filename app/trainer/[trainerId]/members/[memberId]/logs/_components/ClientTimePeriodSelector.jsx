"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TimePeriodSelector from "./TimePeriodSelector";

/**
 * Client-side wrapper สำหรับ TimePeriodSelector
 * จัดการ state และ URL parameters
 */
export default function ClientTimePeriodSelector({ trainerId, memberId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state from URL parameters
  useEffect(() => {
    const period = searchParams.get("period") || "daily";
    const date = searchParams.get("date");

    setSelectedPeriod(period);

    if (date) {
      setSelectedDate(new Date(date));
    }
  }, [searchParams]);

  // Update URL when period changes
  const handlePeriodChange = async (newPeriod) => {
    setIsLoading(true);
    setSelectedPeriod(newPeriod);

    // Update URL with new parameters
    const params = new URLSearchParams(searchParams);
    params.set("period", newPeriod);
    params.set("date", selectedDate.toISOString().split("T")[0]);

    router.push(
      `/trainer/${trainerId}/members/${memberId}/macros-plan?${params.toString()}`
    );

    // Simulate loading (เพื่อให้ดู smooth)
    setTimeout(() => setIsLoading(false), 500);
  };

  // Update URL when date changes
  const handleDateChange = async (newDate) => {
    setIsLoading(true);
    setSelectedDate(newDate);

    // Update URL with new parameters
    const params = new URLSearchParams(searchParams);
    params.set("period", selectedPeriod);
    params.set("date", newDate.toISOString().split("T")[0]);

    router.push(
      `/trainer/${trainerId}/members/${memberId}/macros-plan?${params.toString()}`
    );

    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            กำลังโหลด...
          </span>
        </div>
      </div>
    );
  }

  return (
    <TimePeriodSelector
      selectedPeriod={selectedPeriod}
      selectedDate={selectedDate}
      onPeriodChange={handlePeriodChange}
      onDateChange={handleDateChange}
    />
  );
}

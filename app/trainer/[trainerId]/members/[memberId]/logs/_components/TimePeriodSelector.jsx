"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * TimePeriodSelector Component
 * @param {Object} props
 * @param {string} props.selectedPeriod - "daily" | "weekly" | "custom"
 * @param {Date} props.selectedDate - วันที่ที่เลือก
 * @param {Function} props.onPeriodChange - callback เมื่อเปลี่ยน period
 * @param {Function} props.onDateChange - callback เมื่อเปลี่ยนวันที่
 */
export default function TimePeriodSelector({
  selectedPeriod = "daily",
  selectedDate = new Date(),
  onPeriodChange,
  onDateChange,
}) {
  // วันที่วันนี้
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // ฟังก์ชันเปลี่ยนวันที่ (สำหรับ daily)
  const handleDateNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange?.(newDate);
  };

  // ฟังก์ชันเปลี่ยนสัปดาห์ (สำหรับ weekly)
  const handleWeekNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange?.(newDate);
  };

  // คำนวณช่วงสัปดาห์
  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };

  const weekRange = getWeekRange(selectedDate);

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <Tabs
          value={selectedPeriod}
          onValueChange={onPeriodChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">รายวัน</TabsTrigger>
            <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
            <TabsTrigger value="custom">เลือกวันที่</TabsTrigger>
          </TabsList>

          {/* Daily Tab */}
          <TabsContent value="daily" className="mt-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <p className="text-lg font-semibold">
                  {format(selectedDate, "d MMMM yyyy", { locale: th })}
                </p>
                {isToday && (
                  <p className="text-sm text-green-600 font-medium">วันนี้</p>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation("next")}
                disabled={isToday}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange?.(new Date())}
                disabled={isToday}
              >
                กลับไปวันนี้
              </Button>
            </div>
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="mt-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleWeekNavigation("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <p className="text-lg font-semibold">
                  สัปดาห์ที่ {format(selectedDate, "w", { locale: th })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(weekRange.start, "d MMM", { locale: th })} -{" "}
                  {format(weekRange.end, "d MMM yyyy", { locale: th })}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleWeekNavigation("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week Info */}
            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">จันทร์ - อาทิตย์</p>
            </div>
          </TabsContent>

          {/* Custom Date Tab */}
          <TabsContent value="custom" className="mt-4">
            <div className="flex items-center justify-center">
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    onDateChange?.(date);
                  }
                }}
                placeholder="เลือกวันที่"
                dateFormat="d MMMM yyyy"
                locale={th}
                className="w-[280px]"
                calendarProps={{
                  disabled: (date) => date > new Date(),
                  initialFocus: true,
                }}
              />
            </div>

            <div className="text-center mt-3">
              <p className="text-sm text-muted-foreground">
                เลือกวันที่ที่ต้องการดูข้อมูล
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

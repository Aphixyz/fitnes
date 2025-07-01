"use client";

import React, { useState } from "react";
import MacroPlanDisplay from "./MacroPlanDisplay";
import NutritionLogger from "./NutritionLogger";
import DailyProgress from "./DailyProgress";
import WeeklyProgress from "./WeeklyProgress";

/**
 * Client-side wrapper สำหรับ Nutrition Page
 * จัดการ refresh logic หลังจากบันทึกข้อมูลสำเร็จ
 */
const NutritionPageClient = ({ memberId, macroPlan }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback สำหรับ refresh ข้อมูลหลังจากบันทึกใหม่
  const handleNutritionUpdate = () => {
    // เพิ่ม refreshKey เพื่อ trigger re-render ใน DailyProgress และ WeeklyProgress
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {/* แสดงแผน Macro ปัจจุบัน */}
      <MacroPlanDisplay plan={macroPlan} />

      {/* ฟอร์มบันทึกอาหาร */}
      <NutritionLogger memberId={memberId} onSuccess={handleNutritionUpdate} />

      {/* ความคืบหน้ารายวัน - ใช้ refreshKey เป็น key เพื่อ force re-mount */}
      <DailyProgress
        key={`daily-${refreshKey}`}
        memberId={memberId}
        macroPlan={macroPlan}
      />

      {/* ความคืบหน้ารายสัปดาห์ - ใช้ refreshKey เป็น key เพื่อ force re-mount */}
      <WeeklyProgress
        key={`weekly-${refreshKey}`}
        memberId={memberId}
        macroPlan={macroPlan}
      />
    </>
  );
};

export default NutritionPageClient;

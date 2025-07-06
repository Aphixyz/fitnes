"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createMacroCardsData } from "@/actions/member/dashboard/TargetCalculator";
import MacroCard from "./MacroCard";
import PeriodToggle from "./PeriodToggle";
import MacroDetailModal from "./MacroDetailModal";
import DashboardOverview from "./DashboardOverview";

/**
 * MacroDashboard Component - Dashboard หลักสำหรับ Macronutrient Tracking
 * @param {Object} dashboardData - ข้อมูล dashboard ทั้งหมด
 * @param {Object} statsData - สถิติต่างๆ
 */
export default function MacroDashboard({ dashboardData, statsData }) {
  const [activePeriod, setActivePeriod] = useState("daily");
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ตรวจสอบข้อมูล
  if (!dashboardData?.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {dashboardData?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { data } = dashboardData;

  // สร้าง macro cards data สำหรับ period ที่เลือก ผ่าน macro-engine
  const macroCards = createMacroCardsData(data.targets, activePeriod);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setActivePeriod(newPeriod);
  };

  // Handle macro card click
  const handleMacroClick = (macro) => {
    setSelectedMacro(macro);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMacro(null);
  };

  // แปลง period เป็นภาษาไทย
  const periodLabels = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    monthly: "รายเดือน",
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Overview */}
      <DashboardOverview
        memberData={data.member}
        healthData={data.health}
        statsData={statsData?.data}
        trainerData={data.trainer}
      />

      {/* Macro Tracking Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🎯 เป้าหมายโภชนาการ
            </h2>
            <p className="text-gray-600 text-sm">
              ติดตามการบริโภคแมโครนิวเทรียนต์ {periodLabels[activePeriod]}
            </p>
          </div>

          {/* Period Toggle */}
          <PeriodToggle
            activePeriod={activePeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>

        {/* Macro Cards Grid */}
        <div className="space-y-4">
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {macroCards.map((macro) => (
              <MacroCard
                key={macro.id}
                macro={macro}
                onClick={handleMacroClick}
                consumed={0} // TODO: ดึงข้อมูลการบริโภคจริง
              />
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {macroCards.map((macro) => (
                <MacroCard
                  key={macro.id}
                  macro={macro}
                  onClick={handleMacroClick}
                  consumed={0} // TODO: ดึงข้อมูลการบริโภคจริง
                  className="min-w-[280px] flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>สรุปเป้าหมาย{periodLabels[activePeriod]}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {macroCards.map((macro) => (
                <div
                  key={macro.id}
                  className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleMacroClick(macro)}
                >
                  <div className="text-2xl mb-2">{macro.icon}</div>
                  <div className={`text-lg font-bold ${macro.textColor}`}>
                    {macro.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {macro.name} ({macro.unit})
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calories Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  รวมแคลอรี่{periodLabels[activePeriod]}:
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {macroCards
                    .find((m) => m.id === "calories")
                    ?.value.toLocaleString() || 0}{" "}
                  kcal
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                โปรตีน:{" "}
                {(
                  (macroCards.find((m) => m.id === "protein")?.value || 0) * 4
                ).toLocaleString()}{" "}
                kcal • คาร์บ:{" "}
                {(
                  (macroCards.find((m) => m.id === "carbs")?.value || 0) * 4
                ).toLocaleString()}{" "}
                kcal • ไขมัน:{" "}
                {(
                  (macroCards.find((m) => m.id === "fat")?.value || 0) * 9
                ).toLocaleString()}{" "}
                kcal
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>⚡</span>
              <span>การดำเนินการด่วน</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div className="text-sm font-medium text-blue-700">
                  บันทึกอาหาร
                </div>
              </button>

              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div className="text-sm font-medium text-green-700">
                  ดูประวัติ
                </div>
              </button>

              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="text-sm font-medium text-purple-700">
                  ปรับเป้าหมาย
                </div>
              </button>

              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <div className="text-sm font-medium text-orange-700">
                  ติดต่อเทรนเนอร์
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macro Detail Modal */}
      <MacroDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        macro={selectedMacro}
        period={activePeriod}
        consumed={0} // TODO: ดึงข้อมูลการบริโภคจริง
      />
    </div>
  );
}

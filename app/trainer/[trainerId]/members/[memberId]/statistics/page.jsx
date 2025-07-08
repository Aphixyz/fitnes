"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchProgress } from "@/actions/trainer/progress/fetchProgress";
import WorkoutStatsSummary from "./_components/WorkoutStatsSummary";
import ProgressCharts from "./_components/ProgressCharts";
import NutritionStatsSummary from "./_components/NutritionStatsSummary";
import NutritionCharts from "./_components/NutritionCharts";
import PeriodSelector from "./_components/PeriodSelector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, Dumbbell, Utensils } from "lucide-react";

const StatisticsPage = () => {
  const params = useParams();
  const { trainerId, memberId } = params;

  const [progressData, setProgressData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูล progress
  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchProgress(parseInt(memberId), selectedPeriod);

      if (result.success) {
        setProgressData(result.data);
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
    } catch (err) {
      console.error("Error loading progress data:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Load data เมื่อ component mount หรือ period เปลี่ยน
  useEffect(() => {
    if (memberId) {
      loadProgressData();
    }
  }, [memberId, selectedPeriod]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadProgressData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500 text-lg">{error}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!progressData || !progressData.metadata.hasData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <TrendingUp className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ไม่พบข้อมูลการออกกำลังกาย
            </h3>
            <p className="text-gray-600">
              สมาชิกยังไม่มีประวัติการบันทึกการออกกำลังกายในช่วงเวลาที่เลือก
            </p>
          </div>
          <div className="flex space-x-4">
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            สถิติและความก้าวหน้า
          </h1>
          <p className="text-gray-600">
            ข้อมูลความก้าวหน้าครบถ้วน: การออกกำลังกาย + การปฏิบัติตามแผนโภชนาการ
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            การออกกำลังกาย
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            โภชนาการ
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - แสดงทั้งสองส่วนแบบสรุป */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Workout Summary */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  สรุปการออกกำลังกาย
                </h3>
              </div>
              <WorkoutStatsSummary data={progressData} />
            </div>

            {/* Nutrition Summary */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  สรุปการปฏิบัติตามแผนโภชนาการ
                </h3>
              </div>
              <NutritionStatsSummary data={progressData} />
            </div>
          </div>
        </TabsContent>

        {/* Workout Tab - แสดงข้อมูล workout แบบเต็ม */}
        <TabsContent value="workout" className="space-y-8">
          <WorkoutStatsSummary data={progressData} />
          <ProgressCharts data={progressData} />
        </TabsContent>

        {/* Nutrition Tab - แสดงข้อมูล nutrition แบบเต็ม */}
        <TabsContent value="nutrition" className="space-y-8">
          <NutritionStatsSummary data={progressData} />
          <NutritionCharts data={progressData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;

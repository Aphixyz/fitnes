"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchProgress } from "@/actions/member/progression/fetchProgress";
import WorkoutStatsSummary from "./_components/WorkoutStatsSummary";
import ProgressCharts from "./_components/ProgressCharts";
import PeriodSelector from "./_components/PeriodSelector";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";

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
            สถิติการออกกำลังกาย
          </h1>
          <p className="text-gray-600">
            ข้อมูลความก้าวหน้าและการวิเคราะห์ผลการออกกำลังกาย
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
      <div className="space-y-8">
        {/* Summary Section */}
        <WorkoutStatsSummary data={progressData} />

        {/* Charts Section */}
        <ProgressCharts data={progressData} />

      </div>
    </div>
  );
};

export default StatisticsPage;

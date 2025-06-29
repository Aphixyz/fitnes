"use client";

import React, { useState, useTransition } from "react";
import { fetchProgress } from "@/actions/member/progression/fetchProgress";
import FilterControls from "./FilterControls";
import {
  VolumeCard,
  RepsCard,
  DurationCard,
  DistanceCard,
  SessionsCard,
} from "./metrics/SummaryCard";
// Import individual chart components
import VolumeChart from "./charts/VolumeChart";
import RepsChart from "./charts/RepsChart";
import DurationChart from "./charts/DurationChart";
import DistanceChart from "./charts/DistanceChart";
import SessionChart from "./charts/SessionChart";
import ChartContainer, {
  LineChartContainer,
  BarChartContainer,
  AreaChartContainer,
  RadialChartContainer,
} from "./shared/ChartContainer";
import ErrorBoundary, { CardErrorFallback } from "./shared/ErrorBoundary";

const ProgressDashboard = ({
  memberId,
  initialData,
  initialPeriod = "WEEK",
}) => {
  // State Management
  const [progressData, setProgressData] = useState(initialData);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Data Fetching
  const fetchNewData = async (period) => {
    try {
      const result = await fetchProgress(memberId, period);

      if (result.success) {
        setProgressData(result.data);
        setError(null);
      } else {
        throw new Error(result.message || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError(err.message);
    }
  };

  // Event Handlers
  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === currentPeriod) return;

    setCurrentPeriod(newPeriod);
    setError(null);

    startTransition(async () => {
      await fetchNewData(newPeriod);
    });
  };

  const handleRefresh = () => {
    setError(null);
    startTransition(async () => {
      await fetchNewData(currentPeriod);
    });
  };

  const handleRetry = () => {
    handleRefresh();
  };

  // Check if data exists
  const hasData = progressData?.dailyProgress?.length > 0;

  // Main Error State
  if (error && !progressData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </h3>
        <p className="text-red-700 mb-4 text-sm">{error}</p>
        <button
          onClick={handleRetry}
          disabled={isPending}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
        >
          {isPending ? "กำลังโหลด..." : "ลองใหม่"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <FilterControls
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        onRefresh={handleRefresh}
        isLoading={isPending}
      />

      {/* Error Alert (แสดงเมื่อมี error แต่ยังมีข้อมูลเก่า) */}
      {error && progressData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <span className="text-sm">
              ไม่สามารถอัพเดทข้อมูลล่าสุดได้: {error}
            </span>
            <button
              onClick={handleRetry}
              className="ml-auto text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <ErrorBoundary fallback={CardErrorFallback}>
          <VolumeCard
            totals={progressData?.totals}
            averages={progressData?.averages}
            isLoading={isPending}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={CardErrorFallback}>
          <RepsCard
            totals={progressData?.totals}
            averages={progressData?.averages}
            isLoading={isPending}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={CardErrorFallback}>
          <DurationCard
            totals={progressData?.totals}
            averages={progressData?.averages}
            isLoading={isPending}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={CardErrorFallback}>
          <DistanceCard
            totals={progressData?.totals}
            averages={progressData?.averages}
            isLoading={isPending}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={CardErrorFallback}>
          <SessionsCard
            totals={progressData?.totals}
            averages={progressData?.averages}
            isLoading={isPending}
          />
        </ErrorBoundary>
      </div>

      {/* Main Chart - Volume Progression */}
      <ErrorBoundary>
        <LineChartContainer
          title="📊 แนวโน้มปริมาณการออกกำลังกาย (Volume)"
          subtitle={`แสดงข้อมูล${progressData?.period?.label || ""} - รวม ${
            progressData?.totals?.sessions || 0
          } ครั้ง`}
          height="h-96"
          isLoading={isPending}
          error={!hasData ? "ไม่มีข้อมูลในช่วงเวลานี้" : null}
          onRetry={handleRetry}
        >
          <VolumeChart
            dailyProgress={progressData?.dailyProgress || []}
            period={progressData?.period}
          />
        </LineChartContainer>
      </ErrorBoundary>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reps Chart */}
        <ErrorBoundary>
          <BarChartContainer
            title="🔢 จำนวนครั้งการออกกำลังกาย"
            subtitle="แสดงจำนวนครั้งในแต่ละวัน"
            height="h-80"
            isLoading={isPending}
            error={!hasData ? "ไม่มีข้อมูลในช่วงเวลานี้" : null}
            onRetry={handleRetry}
          >
            <RepsChart
              dailyProgress={progressData?.dailyProgress || []}
              period={progressData?.period}
            />
          </BarChartContainer>
        </ErrorBoundary>

        {/* Duration Chart */}
        <ErrorBoundary>
          <AreaChartContainer
            title="⏱️ เวลาการออกกำลังกาย"
            subtitle="แสดงระยะเวลาในแต่ละวัน"
            height="h-80"
            isLoading={isPending}
            error={!hasData ? "ไม่มีข้อมูลในช่วงเวลานี้" : null}
            onRetry={handleRetry}
          >
            <DurationChart
              dailyProgress={progressData?.dailyProgress || []}
              period={progressData?.period}
            />
          </AreaChartContainer>
        </ErrorBoundary>

        {/* Distance Chart */}
        <ErrorBoundary>
          <LineChartContainer
            title="🏃‍♂️ ระยะทางการออกกำลังกาย"
            subtitle="แสดงระยะทางรวมในแต่ละวัน"
            height="h-80"
            isLoading={isPending}
            error={!hasData ? "ไม่มีข้อมูลในช่วงเวลานี้" : null}
            onRetry={handleRetry}
          >
            <DistanceChart
              dailyProgress={progressData?.dailyProgress || []}
              period={progressData?.period}
            />
          </LineChartContainer>
        </ErrorBoundary>

        {/* Sessions Chart */}
        <ErrorBoundary>
          <RadialChartContainer
            title="📅 ความสม่ำเสมอการออกกำลังกาย"
            subtitle={`ความถี่: ${
              progressData?.averages?.workoutFrequency || 0
            } ครั้ง/สัปดาห์`}
            height="h-80"
            isLoading={isPending}
            error={!hasData ? "ไม่มีข้อมูลในช่วงเวลานี้" : null}
            onRetry={handleRetry}
          >
            <SessionChart
              dailyProgress={progressData?.dailyProgress || []}
              period={progressData?.period}
            />
          </RadialChartContainer>
        </ErrorBoundary>
      </div>

      {/* Data Info Footer */}
      {progressData?.metadata && (
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>
            ข้อมูลล่าสุด:{" "}
            {new Date(progressData.metadata.generatedAt).toLocaleString(
              "th-TH"
            )}
            {isPending && " (กำลังอัพเดท...)"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;

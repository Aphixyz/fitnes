"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Activity,
  Utensils,
  Weight,
  BarChart3,
  RefreshCw,
  Trophy,
  Flame,
} from "lucide-react";

// Import Server Actions
import {
  getProgressAnalytics,
  getWeightChartData,
  getVolumeChartData,
  getNutritionChartData,
} from "@/actions/member/progress/getProgressAnalytics";
import { getActivityCalendarData } from "@/actions/member/progress/getActivityCalendarData";

import WeightChart from "../_components/progress/WeightChart";
import VolumeChart from "../_components/progress/VolumeChart";
import NutritionChart from "../_components/progress/NutritionChart";
import ProgressStats from "../_components/progress/ProgressStats";
import GoalProgress from "../_components/progress/GoalProgress";
import ActivityCalendar from "../_components/progress/ActivityCalendar";

export default function ProgressPage() {
  const params = useParams();
  const memberId = parseInt(params.id);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [weightChartData, setWeightChartData] = useState([]);
  const [volumeChartData, setVolumeChartData] = useState([]);
  const [nutritionChartData, setNutritionChartData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (memberId) {
      loadProgressData();
    }
  }, [memberId, selectedPeriod]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      const [
        analyticsResult,
        weightResult,
        volumeResult,
        nutritionResult,
        calendarResult,
      ] = await Promise.all([
        getProgressAnalytics(memberId, parseInt(selectedPeriod)),
        getWeightChartData(memberId, 6),
        getVolumeChartData(memberId, 12),
        getNutritionChartData(memberId, 8),
        getActivityCalendarData(memberId, 12), // 12 เดือนย้อนหลัง
      ]);

      if (analyticsResult.success) {
        setProgressData(analyticsResult.data);
      }

      if (weightResult.success) {
        setWeightChartData(weightResult.data);
      }

      if (volumeResult.success) {
        setVolumeChartData(volumeResult.data);
      }

      if (nutritionResult.success) {
        setNutritionChartData(nutritionResult.data);
      }

      if (calendarResult.success) {
        setCalendarData(calendarResult.data);
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsPulling(true);
  };

  const handleTouchMove = (e) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.min(Math.max(currentY - startY, 0), 80);
    setPullDistance(distance);
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      await handleRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  // Swipe gesture handlers for tab navigation
  const tabs = ["overview", "calendar", "weight", "workout", "nutrition"];

  const handleSwipeStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleSwipeMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleSwipeEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);
    const minSwipeDistance = 50;

    // Only process horizontal swipes (not vertical)
    if (Math.abs(deltaX) > minSwipeDistance && deltaY < 100) {
      const currentIndex = tabs.indexOf(activeTab);

      if (deltaX > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1]);
        // Add visual feedback for swipe
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else if (deltaX < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1]);
        // Add visual feedback for swipe
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }

    // Reset touch positions
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };


  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm transition-all duration-200"
          style={{
            transform: `translateY(${Math.min(pullDistance - 60, 20)}px)`,
          }}
        >
          <div className="flex items-center gap-2 py-2">
            <RefreshCw
              className={`h-5 w-5 text-blue-600 ${
                pullDistance > 60 ? "animate-spin" : ""
              }`}
              style={{
                transform: `rotate(${pullDistance * 4}deg)`,
                opacity: Math.min(pullDistance / 60, 1),
              }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pullDistance > 60 ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช"}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ความคืบหน้า
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ติดตามผลการพัฒนา
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 h-9 w-9"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Mobile Period Selector */}
          <div className="mt-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7" className="h-12 text-base">
                  7 วันที่ผ่านมา
                </SelectItem>
                <SelectItem value="30" className="h-12 text-base">
                  30 วันที่ผ่านมา
                </SelectItem>
                <SelectItem value="90" className="h-12 text-base">
                  90 วันที่ผ่านมา
                </SelectItem>
                <SelectItem value="180" className="h-12 text-base">
                  6 เดือนที่ผ่านมา
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Mobile Quick Stats with Enhanced Touch */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card
            className="bg-white dark:bg-gray-800 border-0 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md"
            onClick={() => setActiveTab("workout")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {progressData.workout_stats.total_workout_days || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  วันที่ออกกำลังกาย
                </p>
                <p className="text-xs text-gray-500">ใน {selectedPeriod} วัน</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white dark:bg-gray-800 border-0 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md"
            onClick={() => setActiveTab("workout")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {Math.round(
                    (progressData.workout_stats.total_volume || 0) / 1000
                  ).toLocaleString()}
                  K
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Volume
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white dark:bg-gray-800 border-0 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md"
            onClick={() => setActiveTab("nutrition")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <Utensils className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {progressData.nutrition_stats.logged_days || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  วันบันทึกอาหาร
                </p>
                <p className="text-xs text-gray-500">วัน</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white dark:bg-gray-800 border-0 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md"
            onClick={() => setActiveTab("weight")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <Weight className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {progressData.weight_progress ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {progressData.weight_progress.change > 0 ? "+" : ""}
                        {progressData.weight_progress.change.toFixed(1)}
                      </p>
                      {progressData.weight_progress.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : progressData.weight_progress.change < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">-</p>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  เปลี่ยนแปลงน้ำหนัก
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress Card */}
        {/* {progressData?.goal_progress && (
          <GoalProgress goalData={progressData.goal_progress} />
        )} */}

        {/* Mobile Tabs with Enhanced Touch Targets and Gestures */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 p-1 mb-4">
            {/* Swipe hint */}
            <TabsList className="grid w-full grid-cols-5 h-14 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <TabsTrigger
                value="overview"
                className="text-xs font-medium h-12 px-2 flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200 active:scale-95"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="leading-none">ภาพรวม</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="text-xs font-medium h-12 px-2 flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200 active:scale-95"
              >
                <Calendar className="h-4 w-4" />
                <span className="leading-none">ปฏิทิน</span>
              </TabsTrigger>
              <TabsTrigger
                value="weight"
                className="text-xs font-medium h-12 px-2 flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200 active:scale-95"
              >
                <Weight className="h-4 w-4" />
                <span className="leading-none">น้ำหนัก</span>
              </TabsTrigger>
              <TabsTrigger
                value="workout"
                className="text-xs font-medium h-12 px-2 flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200 active:scale-95"
              >
                <Activity className="h-4 w-4" />
                <span className="leading-none">ออกกำลัง</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="text-xs font-medium h-12 px-2 flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200 active:scale-95"
              >
                <Utensils className="h-4 w-4" />
                <span className="leading-none">โภชนาการ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Swipeable Tab Content */}
          <div
            className="touch-pan-y"
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            onTouchEnd={handleSwipeEnd}
          >
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                {progressData?.weekly_activity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Workout History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {progressData.weekly_activity.length > 0 ? (
                          progressData.weekly_activity.map((day, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {new Date(
                                    day.workout_date
                                  ).toLocaleDateString("th-TH", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {day.programs_completed} Programs,{" "}
                                  {day.total_sets} Sets
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600 dark:text-blue-400">
                                  {Math.round(
                                    day.daily_volume || 0
                                  ).toLocaleString()}{" "}
                                  kg
                                </p>
                                <p className="text-xs text-gray-500">Volume</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            No workout history
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress Statistics */}
                {progressData && (
                  <ProgressStats
                    workoutStats={progressData.workout_stats}
                    nutritionStats={progressData.nutrition_stats}
                    periodDays={progressData.period_days}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <ActivityCalendar data={calendarData} />
            </TabsContent>

            <TabsContent value="weight">
              <WeightChart data={weightChartData} />
            </TabsContent>

            <TabsContent value="workout">
              <VolumeChart data={volumeChartData} />
            </TabsContent>

            <TabsContent value="nutrition">
              <NutritionChart data={nutritionChartData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

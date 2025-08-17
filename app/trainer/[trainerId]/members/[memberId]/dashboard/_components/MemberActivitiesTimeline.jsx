"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  Activity as ActivityLucide,
  Filter,
  Dumbbell,
  Apple,
  Scale,
  Camera,
  Clock,
  Target,
  TrendingDown,
  TrendingUp as TrendUp,
} from "lucide-react";

// Import helper components
import { ActivityIcon, getActivityTypeConfig } from "./ActivityIcon";
import NutritionProgress from "./NutritionProgress";
import WorkoutSetsTable from "./WorkoutSetsTable";
import {
  formatDateThai,
  formatTime,
  getActivityTitle,
  getActivitySummary,
  isGoodProgress,
  generateMockData,
} from "./ActivityHelpers";

/**
 * WeightDisplay component - แสดงน้ำหนักและเป้าหมาย
 */
function WeightDisplay({ weight, memberId }) {
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGoalData() {
      if (!weight || !memberId) return;
      
      try {
        setLoading(true);
        const { getMemberWeightHistory } = await import(
          "@/actions/trainer/dashboard/getMemberWeightHistory"
        );
        
        const result = await getMemberWeightHistory(memberId);
        
        if (result.success && result.data.goalWeight) {
          setGoalData({
            goalWeight: result.data.goalWeight,
            goalType: result.data.goalType || 'ไม่ระบุ'
          });
        }
      } catch (err) {
        console.error("Error fetching goal data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGoalData();
  }, [weight, memberId]);

  return (
    <Card className="border border-blue-200 rounded-lg">
      <CardContent className="px-4 py-3">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 w-full">
            <div className="p-2 rounded-full bg-blue-100">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">น้ำหนัก</div>
              <div className="text-sm text-gray-600">{weight} กก.</div>
            </div>
          </div>
          
          {/* Goal Information */}
          {goalData && !loading && (
            <div className="ml-11 pt-2 border-t border-gray-100 space-y-1">
              <div className=" text-sm">
                <span className="text-gray-600">เป้าหมาย : </span>
                <span className="font-medium text-gray-900">{goalData.goalWeight} กก.</span>
              </div>
              <div className="  text-sm">
                <span className="text-gray-600">ประเภทเป้าหมาย : </span>
                <span className="font-medium text-gray-900"> {goalData.goalType}</span>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="ml-11 pt-2 border-t border-gray-100">
              <Skeleton className="h-4 w-32" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * HealthMetricsDisplay component - แสดงข้อมูลการวัดค่าสุขภาพในวันนั้น
 */
function HealthMetricsDisplay({ data, memberId }) {
  const { weight, bodyFat, measurements = {} } = data;

  return (
    <div className="space-y-4">
      {/* Weight Display with Goal Comparison (if available) */}
      {weight && (
        <WeightDisplay weight={weight} memberId={memberId} />
      )}

      {/* Body Fat Card (if available) */}
      {bodyFat && (
        <Card className="border border-orange-200 rounded-lg">
          <CardContent className="px-4 py-3">
            <div className="flex items-center space-x-3 w-full">
              <div className="p-2 rounded-full bg-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">เปอร์เซ็นต์ไขมัน</div>
                <div className="text-sm text-gray-600">{bodyFat}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Body Measurements Card (if available) */}
      {Object.keys(measurements).length > 0 && (
        <Card className="border border-purple-200 rounded-lg">
          <CardContent className="px-4 py-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div className="font-semibold text-gray-900">ขนาดรอบส่วน</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                {Object.entries(measurements).map(([key, value]) => {
                  const labels = {
                    chest: "รอบอก ",
                    waist: "รอบเอว ", 
                    hip: "รอบสะโพก ",
                    arm: "รอบแขน ",
                    thigh: "รอบขา ",
                  };

                  return (
                    <div key={key} className=" text-sm">
                      <span className="text-gray-600">{labels[key]}:</span>
                      <span className="font-medium text-gray-900"> {value} ซม.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * ProgressPhotoDisplay component - แสดงข้อมูลรูปภาพความคืบหน้าจริงจากฐานข้อมูล
 */
function ProgressPhotoDisplay({ activity, memberId }) {
  const [progressPhotos, setProgressPhotos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProgressPhotos() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action
        const { getMemberProgressPhotos } = await import(
          "@/actions/trainer/dashboard/getMemberProgressPhotos"
        );

        // Extract date from activity timestamp
        const activityDate = activity.timestamp.split("T")[0];
        const result = await getMemberProgressPhotos(memberId, activityDate);

        if (result.success) {
          setProgressPhotos(result.data);
        } else {
          setError(result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลรูปภาพ");
        }
      } catch (err) {
        console.error("Error fetching progress photos:", err);
        setError("ไม่สามารถโหลดข้อมูลรูปภาพได้");
      } finally {
        setLoading(false);
      }
    }

    if (memberId && activity.timestamp) {
      fetchProgressPhotos();
    }
  }, [memberId, activity.timestamp]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!progressPhotos || !progressPhotos.hasProgressPhotos) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
        <div className="text-gray-500">ไม่มีรูปภาพความคืบหน้าสำหรับวันนี้</div>
      </div>
    );
  }

  const { photos, angles, additionalData } = progressPhotos;
  const angleLabels = {
    front: "ด้านหน้า",
    side: "ด้านข้าง",
    back: "ด้านหลัง",
  };

  return (
    <div className="space-y-4">
      {/* Progress Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["front", "side", "back"].map((angle) => {
          const hasPhoto = angles.includes(angle);
          const photoPath = photos[angle];

          return (
            <div
              key={angle}
              className={`border rounded-lg overflow-hidden ${
                hasPhoto
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Angle Label */}
              <div className="p-2 text-center text-sm font-medium">
                <span className={hasPhoto ? "text-green-700" : "text-gray-500"}>
                  {angleLabels[angle]} {hasPhoto ? "✓" : "-"}
                </span>
              </div>

              {/* Photo Display */}
              <div className="aspect-[3/4] bg-gray-100">
                {hasPhoto && photoPath ? (
                  <img
                    src={
                      photoPath.startsWith("/uploads/")
                        ? photoPath
                        : `/uploads/member_health/${memberId}/${photoPath}`
                    }
                    alt={`Progress photo - ${angleLabels[angle]}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback for missing/broken images */}
                <div
                  className={`w-full h-full flex items-center justify-center text-gray-400 ${
                    hasPhoto && photoPath ? "hidden" : "flex"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📷</div>
                    <div className="text-xs">
                      {hasPhoto ? "ไม่สามารถโหลดรูปได้" : "ไม่มีรูป"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional metrics if available */}
      {(additionalData?.weight || additionalData?.bodyFat) && (
        <div className="rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {additionalData.bodyFat && (
              <div>
                <span className="text-blue-600">เปอร์เซ็นต์ไขมัน: {additionalData.bodyFat}%</span>{" "}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * NutritionActivityContent component - แสดงข้อมูลโภชนาการจริงจากฐานข้อมูล
 */
function NutritionActivityContent({ activity, memberId }) {
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNutritionData() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action
        const { getMemberNutritionData } = await import(
          "@/actions/trainer/dashboard/getMemberNutritionData"
        );

        // Extract date from activity timestamp
        const activityDate = activity.timestamp.split("T")[0];
        const result = await getMemberNutritionData(memberId, activityDate);

        if (result.success) {
          setNutritionData(result.data);
        } else {
          setError(result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลโภชนาการ");
        }
      } catch (err) {
        console.error("Error fetching nutrition data:", err);
        setError("ไม่สามารถโหลดข้อมูลโภชนาการได้");
      } finally {
        setLoading(false);
      }
    }

    if (memberId && activity.timestamp) {
      fetchNutritionData();
    }
  }, [memberId, activity.timestamp]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!nutritionData) {
    return (
      <div className="p-4 text-center text-gray-500">
        ไม่พบข้อมูลโภชนาการสำหรับวันนี้
      </div>
    );
  }

  // Pass real data to NutritionProgress
  return (
    <NutritionProgress
      totalCalories={nutritionData.intake.calories}
      goalCalories={nutritionData.targets.calories}
      protein={nutritionData.intake.protein}
      proteinGoal={nutritionData.targets.protein}
      carb={nutritionData.intake.carb}
      carbGoal={nutritionData.targets.carb}
      fat={nutritionData.intake.fat}
      fatGoal={nutritionData.targets.fat}
    />
  );
}

/**
 * WorkoutActivityContent component - แสดงข้อมูลการออกกำลังกาย
 */
function WorkoutActivityContent({ activity, memberId }) {
  return <WorkoutSetsTable activity={activity} memberId={memberId} />;
}

/**
 * ActivityContent component - render เนื้อหากิจกรรมตามประเภท
 */
function ActivityContent({ activity, memberId }) {
  const { type, data } = activity;

  switch (type) {
    case "nutrition":
      return (
        <NutritionActivityContent activity={activity} memberId={memberId} />
      );

    case "workout":
      return <WorkoutActivityContent activity={activity} memberId={memberId} />;

    case "health_metrics":
      return <HealthMetricsDisplay data={data} memberId={memberId} />;

    case "progress_photo":
      return <ProgressPhotoDisplay activity={activity} memberId={memberId} />;

    default:
      return (
        <div className="p-4 text-center text-gray-500">
          ไม่สามารถแสดงข้อมูลประเภทนี้ได้
        </div>
      );
  }
}

/**
 * ActivityTypeFilter component - สำหรับกรองกิจกรรมตามประเภท
 */
function ActivityTypeFilter({ selectedTypes, onTypeChange, activityCounts }) {
  const activityTypeConfig = {
    workout: {
      label: "ออกกำลังกาย",
      icon: Dumbbell,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      activeColor: "bg-blue-500 text-white",
    },
    nutrition: {
      label: "โภชนาการ",
      icon: Apple,
      color: "bg-green-100 text-green-700 border-green-200",
      activeColor: "bg-green-500 text-white",
    },
    health_metrics: {
      label: "สุขภาพ",
      icon: Scale,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      activeColor: "bg-purple-500 text-white",
    },
    progress_photo: {
      label: "รูปภาพ",
      icon: Camera,
      color: "bg-orange-100 text-orange-700 border-orange-200",
      activeColor: "bg-orange-500 text-white",
    },
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">กรองกิจกรรม:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(activityTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const isSelected = selectedTypes.includes(type);
          const count = activityCounts[type] || 0;

          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => onTypeChange(type)}
              className={`h-8 px-3 ${
                isSelected ? config.activeColor : config.color
              } border transition-all duration-200 hover:scale-105`}
            >
              <Icon className="h-3 w-3 mr-1.5" />
              <span className="text-xs font-medium">{config.label}</span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTypeChange("all")}
          className={`h-8 px-3 ${
            selectedTypes.length === 0
              ? "bg-gray-500 text-white"
              : "bg-gray-100 text-gray-700 border-gray-200"
          } transition-all duration-200 hover:scale-105`}
        >
          <Target className="h-3 w-3 mr-1.5" />
          <span className="text-xs font-medium">ทั้งหมด</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * ActivityItem component - รายการกิจกรรมแต่ละรายการ
 */
function ActivityItem({ activity, index, memberId }) {
  const [workoutInfo, setWorkoutInfo] = useState(null);
  const [progressPhotoInfo, setProgressPhotoInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch workout info for workout activities to get program name
  useEffect(() => {
    async function fetchActivityInfo() {
      try {
        setLoading(true);

        if (activity.type === "workout") {
          // Import and call the server action to get workout info
          const { getMemberWorkoutData } = await import(
            "@/actions/trainer/dashboard/getMemberWorkoutData"
          );

          // Extract date from activity timestamp
          const activityDate = activity.timestamp.split("T")[0];
          const result = await getMemberWorkoutData(memberId, activityDate);

          if (result.success && result.data.hasWorkoutData) {
            setWorkoutInfo(result.data.workoutInfo);
          }
        } else if (activity.type === "progress_photo") {
          // Import and call the server action to get progress photo info
          const { getMemberProgressPhotos } = await import(
            "@/actions/trainer/dashboard/getMemberProgressPhotos"
          );

          // Extract date from activity timestamp
          const activityDate = activity.timestamp.split("T")[0];
          const result = await getMemberProgressPhotos(memberId, activityDate);

          if (result.success && result.data.hasProgressPhotos) {
            setProgressPhotoInfo(result.data);
          }
        }
      } catch (err) {
        console.error("Error fetching activity info:", err);
      } finally {
        setLoading(false);
      }
    }

    if (memberId && activity.timestamp) {
      fetchActivityInfo();
    }
  }, [memberId, activity.timestamp, activity.type]);

  // Create updated activity with additional data
  let updatedActivity = activity;

  if (activity.type === "workout" && workoutInfo) {
    updatedActivity = {
      ...activity,
      data: {
        ...activity.data,
        programName: workoutInfo.programName,
      },
    };
  } else if (activity.type === "progress_photo" && progressPhotoInfo) {
    updatedActivity = {
      ...activity,
      data: {
        ...activity.data,
        photoCount: progressPhotoInfo.photoCount,
        angles: progressPhotoInfo.angles,
      },
    };
  }

  const title = getActivityTitle(updatedActivity);
  const summary = getActivitySummary(updatedActivity);
  const activityConfig = getActivityTypeConfig(activity.type);
  const time = formatTime(activity.timestamp);

  return (
    <Card className="mb-3 overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
      <AccordionItem value={`activity-${index}`} className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50/50">
          <div className="flex items-center space-x-3 w-full">
            <div className={`p-2 rounded-full ${activityConfig.bgColor}`}>
              <ActivityIcon type={activity.type} className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {loading &&
                  (activity.type === "workout" ||
                    activity.type === "progress_photo")
                    ? "กำลังโหลด..."
                    : title}
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${activityConfig.badgeColor} hidden sm:inline-flex`}
                >
                  {activityConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="pt-3 border-t border-gray-100">
            <ActivityContent activity={updatedActivity} memberId={memberId} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

/**
 * DayGroup component - กลุ่มกิจกรรมในแต่ละวัน
 */
function DayGroup({ dayGroup, memberId, selectedTypes }) {
  const { date, activitiesByDate } = dayGroup;
  const formattedDate = formatDateThai(date);

  // Filter activities based on selected types
  const filteredActivities =
    selectedTypes.length === 0
      ? activitiesByDate
      : activitiesByDate.filter((activity) =>
          selectedTypes.includes(activity.type)
        );

  // Count different activity types
  const activityCounts = activitiesByDate.reduce((counts, activity) => {
    counts[activity.type] = (counts[activity.type] || 0) + 1;
    return counts;
  }, {});

  // Don't render if no activities match filter
  if (filteredActivities.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Date Header */}
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
        <div className="px-6">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-gray-800 whitespace-nowrap">
              {formattedDate}
            </h3>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
      </div>

      {/* Activities List */}
      <Accordion type="single" collapsible className="space-y-2">
        {filteredActivities.map((activity, index) => (
          <ActivityItem
            key={`${date}-${index}`}
            activity={activity}
            index={`${date}-${index}`}
            memberId={memberId}
          />
        ))}
      </Accordion>
    </div>
  );
}

/**
 * LoadingSkeleton component - แสดงขณะโหลดข้อมูล
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MemberActivitiesTimeline - Component หลักสำหรับแสดง timeline กิจกรรมของสมาชิก
 */
export function MemberActivitiesTimeline({
  trainerId,
  memberId,
  options = {},
  useMockData = false,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (useMockData) {
          // Use mock data for testing
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
          const mockData = generateMockData();
          setData(mockData.data);
        } else {
          // Import and call the server action
          const { getMemberActivityTimeline } = await import(
            "@/actions/trainer/dashboard/getMemberActivityTimeline"
          );
          const result = await getMemberActivityTimeline(
            trainerId,
            memberId,
            options
          );

          if (result.success) {
            setData(result.data);
          } else {
            setError(result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
          }
        }
      } catch (err) {
        console.error("Error fetching activity timeline:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    if (trainerId && memberId) {
      fetchData();
    }
  }, [trainerId, memberId, options, useMockData]);

  const handleTypeChange = (type) => {
    if (type === "all") {
      setSelectedTypes([]);
    } else {
      setSelectedTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert className="border-red-200 bg-red-50">
          <ActivityLucide className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || !data.activities || data.activities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ActivityLucide className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  ไม่มีข้อมูลกิจกรรม
                </h3>
                <p className="text-gray-500 max-w-md">
                  ยังไม่พบกิจกรรมของสมาชิกในช่วงเวลาที่เลือก
                  กิจกรรมจะปรากฏเมื่อสมาชิกเริ่มบันทึกข้อมูล
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { member, activities, summary } = data;

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Activities Timeline */}
      <div className="space-y-6">
        {activities.map((dayGroup, index) => (
          <DayGroup
            key={dayGroup.date}
            dayGroup={dayGroup}
            memberId={memberId}
            selectedTypes={selectedTypes}
          />
        ))}
      </div>

    </div>
  );
}

export default MemberActivitiesTimeline;

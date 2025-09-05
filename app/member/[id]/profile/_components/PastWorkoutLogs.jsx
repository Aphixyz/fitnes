"use client";

import React, { useState } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { getProgressMemberData } from "@/actions/member/progression/getProgressMemberData";
import exercisesData from "@/data/exercises.json";

// ฟังก์ชันสำหรับการหา exercise metadata จาก exercise_id
const getExerciseMeta = (exerciseId) => {
  return exercisesData.find((ex) => ex.id === exerciseId) || null;
};

// ฟังก์ชันสำหรับแสดงผล Training Variables ตามประเภทการฝึก
const formatTrainingVariables = (sets, exerciseMeta) => {
  // ตรวจสอบว่ามีข้อมูลประเภทใดบ้าง
  const hasWeight = sets.some((set) => set.actualWeight);
  const hasReps = sets.some((set) => set.actualReps);
  const hasTime = sets.some((set) => set.actualTime);
  const hasDistance = sets.some((set) => set.actualDistance);

  // กำหนดคอลัมน์ที่จะแสดงตามประเภทการฝึก
  let columns = [];
  let columnHeaders = [];

  switch (exerciseMeta.category) {
    case "weight":
      // Weight Training: Sets x (Weight x Reps)
      if (hasWeight && hasReps) {
        columns = ["set", "weight_reps"];
        columnHeaders = ["", "WEIGHT x REPS"];
      } else if (hasWeight) {
        columns = ["set", "weight"];
        columnHeaders = ["SET", "WEIGHT"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "REPS"];
      }
      break;

    case "bodyweight":
      // Bodyweight/Isometric: Sets x Time หรือ Sets x Reps
      if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "REPS"];
      }
      break;

    case "cardio":
      // Cardio: Distance, Time, Pace
      if (hasDistance && hasTime) {
        columns = ["set", "distance_time"];
        columnHeaders = ["SET", "DISTANCE & TIME"];
      } else if (hasDistance) {
        columns = ["set", "distance"];
        columnHeaders = ["SET", "DISTANCE"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      }
      break;

    case "hiit":
      // HIIT/Circuit: Time per movement, Rounds
      if (hasTime && hasReps) {
        columns = ["set", "time_reps"];
        columnHeaders = ["SET", "TIME x ROUNDS"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      } else if (hasReps) {
        columns = ["set", "reps"];
        columnHeaders = ["SET", "ROUNDS"];
      }
      break;

    case "speed":
      // Speed Training: Distance x Time
      if (hasDistance && hasTime) {
        columns = ["set", "distance_time"];
        columnHeaders = ["SET", "DISTANCE x TIME"];
      } else if (hasDistance) {
        columns = ["set", "distance"];
        columnHeaders = ["SET", "DISTANCE"];
      } else if (hasTime) {
        columns = ["set", "time"];
        columnHeaders = ["SET", "TIME"];
      }
      break;

    default:
      // Fallback: แสดงทุกอย่างที่มี
      columns = ["set"];
      columnHeaders = ["เซ็ต"];
      if (hasWeight && hasReps) {
        columns.push("weight_reps");
        columnHeaders.push("น้ำหนัก x รอบ");
      } else {
        if (hasWeight) {
          columns.push("weight");
          columnHeaders.push("น้ำหนัก");
        }
        if (hasReps) {
          columns.push("reps");
          columnHeaders.push("รอบ");
        }
      }
      if (hasTime) {
        columns.push("time");
        columnHeaders.push("เวลา");
      }
      if (hasDistance) {
        columns.push("distance");
        columnHeaders.push("ระยะ");
      }
  }

  return { columns, columnHeaders };
};

// ฟังก์ชันสำหรับแสดงค่าในแต่ละคอลัมน์
const renderCellValue = (set, columnType) => {
  switch (columnType) {
    case "set":
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
            {set.setOrder}
          </div>
        </div>
      );

    case "weight":
      const weight = set.actualWeight || 0;
      const weightStr = parseFloat(weight).toString();
      return `${weightStr} กก.`;

    case "reps":
      return `${set.actualReps || 0} ครั้ง`;

    case "time":
      const minutes = Math.floor((set.actualTime || 0) / 60);
      const seconds = (set.actualTime || 0) % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")} นาที`;

    case "distance":
      const km = Math.floor((set.actualDistance || 0) / 1000);
      const m = (set.actualDistance || 0) % 1000;
      if (km > 0) {
        const decimalPart = m.toString().padStart(3, "0");
        const trimmedDecimal = decimalPart.replace(/0+$/, "");
        const displayDecimal = trimmedDecimal ? `.${trimmedDecimal}` : "";
        return `${km}${displayDecimal} กิโลเมตร`;
      }
      return `${m} เมตร`;

    case "weight_reps":
      const weightForReps = set.actualWeight || 0;
      const weightStrForReps = parseFloat(weightForReps).toString();
      return `${weightStrForReps} กก. × ${set.actualReps || 0} ครั้ง`;

    case "distance_time":
      const distKm = Math.floor((set.actualDistance || 0) / 1000);
      const distM = (set.actualDistance || 0) % 1000;
      const timeMin = Math.floor((set.actualTime || 0) / 60);
      const timeSec = (set.actualTime || 0) % 60;

      let distanceStr;
      if (distKm > 0) {
        const decimalPart = distM.toString().padStart(3, "0");
        const trimmedDecimal = decimalPart.replace(/0+$/, "");
        const displayDecimal = trimmedDecimal ? `.${trimmedDecimal}` : "";
        distanceStr = `${distKm}${displayDecimal} กิโลเมตร`;
      } else {
        distanceStr = `${distM} เมตร`;
      }

      const timeStr = `${timeMin}:${timeSec.toString().padStart(2, "0")}`;
      return `${distanceStr} × ${timeStr} นาที`;

    case "time_reps":
      const tMin = Math.floor((set.actualTime || 0) / 60);
      const tSec = (set.actualTime || 0) % 60;
      return `${tMin}:${tSec.toString().padStart(2, "0")} นาที × ${
        set.actualReps || 0
      } รอบ`;

    default:
      return "-";
  }
};

export default function PastWorkoutLogs({ workoutSummary, memberId }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle workout card click
  const handleWorkoutClick = async (workout) => {
    setSelectedWorkout(workout);
    setLoading(true);
    setIsDrawerOpen(true);
    
    try {
      // Fetch detailed workout data for this exercise_log_id
      const progressData = await getProgressMemberData(memberId, workout.exercise_log_id);
      
      if (progressData.success && progressData.data.workoutLogDetail) {
        // Group exercises by exercise_id and calculate totals
        const exerciseGroups = {};
        
        progressData.data.workoutLogDetail.forEach((detail) => {
          const exerciseId = detail.exerciseName; // exerciseName ในที่นี้คือ exercise_id จาก database
          
          if (!exerciseGroups[exerciseId]) {
            exerciseGroups[exerciseId] = {
              exerciseId,
              programName: detail.programName,
              sets: [],
            };
          }
          
          exerciseGroups[exerciseId].sets.push({
            setOrder: detail.set_order,
            plannedWeight: detail.planned_weight,
            plannedReps: detail.planned_reps,
            plannedTime: detail.planned_time,
            plannedDistance: detail.planned_distance,
            actualWeight: detail.actual_weight,
            actualReps: detail.actual_reps,
            actualTime: detail.actual_time,
            actualDistance: detail.actual_distance,
          });
        });
        
        setWorkoutDetails({
          programName: progressData.data.workoutLogDetail[0]?.programName || workout.ProgramName,
          exerciseGroups: Object.values(exerciseGroups)
        });
      }
    } catch (error) {
      console.error('Error fetching workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group workouts by date
  const groupedWorkouts = workoutSummary?.reduce((acc, workout) => {
    const date = workout.log_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workout);
    return acc;
  }, {}) || {};

  // Helper function to format date in Thai
  const formatDateThai = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (!workoutSummary || workoutSummary.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          <p>ยังไม่มีประวัติการออกกำลังกาย</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedWorkouts)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, workouts]) => (
          <div key={date}>
            {/* Date Header with Lines */}
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="px-4 text-gray-600 font-medium">
                {formatDateThai(date)}
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Workout Cards for this date */}
            <div className="space-y-4">
              {workouts.map((workout, index) => (
                <div
                  key={`${workout.exercise_log_id}-${index}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleWorkoutClick(workout)}
                >
                  {/* Header Text */}
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">
                      ได้บันทึกการฝึกโปรแกรม :
                    </p>
                  </div>

                  {/* Program Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {workout.ProgramName}
                  </h3>

                  {/* Divider Line */}
                  <div className="w-full h-px bg-gray-200 mb-4"></div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-center">
                    {/* See More Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkoutClick(workout);
                      }}
                      className="bg-transparent text-teal-400 font-semibold text-sm hover:text-teal-500 transition-colors uppercase tracking-wide"
                    >
                      ดูเพิ่มเติม
                    </button>
                  </div>
                </div>
                ))}
            </div>
          </div>
        ))}

      {/* Workout Detail Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="flex items-center justify-between border-b border-gray-200 pb-4">
            <DrawerTitle className="text-lg font-semibold">
              ได้บันทึกการฝึกโปรแกรม :
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          
          {selectedWorkout && (
            <div className="p-6 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
                </div>
              ) : workoutDetails ? (
                <div>
                  {/* Program Name Header */}
                  <div className="mb-4">
                    <div className="flex justify-center mb-2">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {workoutDetails.programName || "ไม่ระบุโปรแกรม"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Breakdown */}
                  <div>
                    <div className="space-y-6">
                      {workoutDetails.exerciseGroups.map((exercise, index) => {
                        const exerciseMeta = getExerciseMeta(exercise.exerciseId);
                        const exerciseName = exerciseMeta?.name || exercise.exerciseId;
                        const exerciseImage = exerciseMeta?.images?.[0]
                          ? `/exercises/${exerciseMeta.images[0]}`
                          : "/default-avatar.png";

                        const { columns, columnHeaders } = formatTrainingVariables(
                          exercise.sets,
                          exerciseMeta
                        );

                        return (
                          <div key={index}>
                            <div className="flex items-center gap-4 mb-3">
                              {/* Exercise Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={exerciseImage}
                                  alt={exerciseName}
                                  className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                />
                              </div>
                              {/* Exercise Name */}
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {exerciseName}
                              </h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full table-auto">
                                <thead>
                                  <tr className="bg-gray-50">
                                    {columnHeaders.map((header, headerIndex) => (
                                      <th
                                        key={headerIndex}
                                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {exercise.sets.map((set, setIndex) => (
                                    <tr key={setIndex} className="hover:bg-gray-50">
                                      {columns.map((columnType, columnIndex) => (
                                        <td
                                          key={columnIndex}
                                          className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                          {renderCellValue(set, columnType)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</div>
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
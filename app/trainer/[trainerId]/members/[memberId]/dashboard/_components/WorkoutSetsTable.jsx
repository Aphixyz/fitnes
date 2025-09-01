import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dumbbell, Weight, RotateCcw } from "lucide-react";

// Import exercise data
import exercisesData from "@/data/exercises.json";

/**
 * Get exercise name from exercise ID
 */
function getExerciseName(exerciseId) {
  const exercise = exercisesData.find(ex => ex.id === exerciseId);
  return exercise ? exercise.name : exerciseId;
}

/**
 * Format time from seconds to time format
 */
function formatTime(seconds) {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');
    
    if (remainingSeconds === 0) {
      return `${minutesStr}:00 น.`;
    } else {
      return `${minutesStr}:${secondsStr} น.`;
    }
  }
  const secondsStr = seconds.toString().padStart(2, '0');
  return `00:${secondsStr} น.`;
}

/**
 * Format distance from meters to readable format
 */
function formatDistance(meters) {
  if (meters >= 1000) {
    const kilometers = meters / 1000;
    return `${kilometers} กม.`;
  }
  return `${meters} ม.`;
}

/**
 * Format time for compact display (combined cases)
 */
function formatTimeCompact(seconds) {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');
    
    if (remainingSeconds === 0) {
      return `${minutesStr}:00 น.`;
    } else {
      return `${minutesStr}:${secondsStr} น.`;
    }
  }
  const secondsStr = seconds.toString().padStart(2, '0');
  return `00:${secondsStr} น.`;
}

/**
 * Format distance for compact display (combined cases)
 */
function formatDistanceCompact(meters) {
  if (meters >= 1000) {
    const kilometers = meters / 1000;
    return `${kilometers} กก.`;
  }
  return `${meters} ม.`;
}

/**
 * ExerciseAccordionItem component - แสดงท่าออกกำลังกายใน Accordion
 */
function ExerciseAccordionItem({ exercise, index }) {
  const { exerciseId, exerciseName, sets = [] } = exercise;
  
  // Get the readable exercise name from the exercise ID
  const displayName = getExerciseName(exerciseId);

  // Calculate summary statistics
  const totalVolume = sets.reduce((sum, set) => {
    return sum + (set.weight || 0) * (set.reps || 0);
  }, 0);
  const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0);

  return (
    <AccordionItem
      value={`exercise-${index}`}
      className="border rounded-lg mb-2"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="text-left">
              <div className="font-medium text-gray-800">ท่า: {displayName}</div>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="pt-2 border-t border-gray-100">
          {sets.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              ไม่มีข้อมูล sets
            </div>
          ) : (
            <div className="space-y-3 ">
              {/* Sets List */}
              <div className="space-y-2 ">
                {sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className="flex items-center justify-between p-2 bg-white rounded border-b border-gray-100"
                  >
                    <div className="flex items-center space-x-2 ">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded ">
                        Set {set.setNumber || setIndex + 1}:
                      </span>
                      <div className="flex items-center space-x-4 text-sm">
                        {(() => {
                          // Count how many data types we have
                          const hasWeight = !!set.weight;
                          const hasReps = !!set.reps;
                          const hasTime = !!set.time;
                          const hasDistance = !!set.distance;
                          const dataCount = [hasWeight, hasReps, hasTime, hasDistance].filter(Boolean).length;

                          // Case 1: Weight and Reps only
                          if (hasWeight && hasReps && !hasTime && !hasDistance) {
                            return (
                              <span className="font-medium">
                                {set.weight} กก. X {set.reps} ครั้ง
                              </span>
                            );
                          }

                          // Case 2: Time only
                          if (hasTime && !hasWeight && !hasReps && !hasDistance) {
                            return (
                              <span className="font-medium text-blue-600">
                                {formatTime(set.time)}
                              </span>
                            );
                          }

                          // Case 3: Distance only
                          if (hasDistance && !hasWeight && !hasReps && !hasTime) {
                            return (
                              <span className="font-medium text-green-600">
                                {formatDistance(set.distance)}
                              </span>
                            );
                          }

                          // Case 4: Combined cases (2 or more data types)
                          if (dataCount >= 2) {
                            const parts = [];
                            
                            if (hasReps) parts.push(`${set.reps} ครั้ง`);
                            if (hasWeight) parts.push(`${set.weight} กก.`);
                            if (hasTime) parts.push(formatTimeCompact(set.time));
                            if (hasDistance) parts.push(formatDistanceCompact(set.distance));
                            
                            return (
                              <span className="font-medium">
                                {parts.join(' x ')}
                              </span>
                            );
                          }

                          // Case 5: Single data types
                          if (hasWeight && !hasReps) {
                            return (
                              <span className="font-medium">
                                {set.weight} กก.
                              </span>
                            );
                          }

                          if (hasReps && !hasWeight) {
                            return (
                              <span className="font-medium">
                                {set.reps} ครั้ง
                              </span>
                            );
                          }

                          // Case 6: No data
                          return (
                            <span className="text-gray-400 italic">
                              ไม่มีข้อมูล
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * WorkoutLoading component - แสดงขณะโหลดข้อมูล
 */
function WorkoutLoading() {
  return (
    <div className="space-y-4">
      {/* Loading for exercise list */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * WorkoutSetsTable component - แสดงข้อมูลการออกกำลังกายจริงจากฐานข้อมูล
 */
export function WorkoutSetsTable({ activity, memberId }) {
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWorkoutData() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action
        const { getMemberWorkoutData } = await import(
          "@/actions/trainer/dashboard/getMemberWorkoutData"
        );

        // Extract date from activity timestamp
        const activityDate = activity.timestamp.split("T")[0];
        const result = await getMemberWorkoutData(memberId, activityDate);

        if (result.success) {
          setWorkoutData(result.data);
        } else {
          setError(
            result.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลการออกกำลังกาย"
          );
        }
      } catch (err) {
        console.error("Error fetching workout data:", err);
        setError("ไม่สามารถโหลดข้อมูลการออกกำลังกายได้");
      } finally {
        setLoading(false);
      }
    }

    if (memberId && activity.timestamp) {
      fetchWorkoutData();
    }
  }, [memberId, activity.timestamp]);

  if (loading) {
    return <WorkoutLoading />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert className="border-red-200 bg-red-50">
          <Dumbbell className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!workoutData || !workoutData.hasWorkoutData) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
        <Dumbbell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-gray-500">
          ไม่มีข้อมูลการออกกำลังกายสำหรับวันนี้
        </div>
      </div>
    );
  }

  const { exercises} = workoutData;

  return (
    <div className="space-y-4">
      {/* Exercise List - Accordion */}
      {exercises.length === 0 ? (
        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
          <div className="text-gray-500">ไม่มีรายการท่าออกกำลังกาย</div>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {exercises.map((exercise, index) => (
            <ExerciseAccordionItem
              key={`${exercise.exerciseId}-${index}`}
              exercise={exercise}
              index={index}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}

export default WorkoutSetsTable;

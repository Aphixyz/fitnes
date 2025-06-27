"use client";

import { useState } from "react";
import exercisesData from "@/data/exercises.json";

/**
 * ExerciseCard - Client Component
 * แสดงข้อมูล exercise พร้อม sets
 */
const ExerciseCard = ({ exercise, exerciseIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDownToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleExpanded();
    }
  };

  const formatRestTime = (restSeconds) => {
    if (!restSeconds) return "-";
    const minutes = Math.floor(restSeconds / 60);
    const seconds = restSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const formatSetValue = (value, unit = "") => {
    return value ? `${value}${unit}` : "-";
  };

  // ฟังก์ชันหาชื่อ exercise จาก ID
  const getExerciseName = (exerciseId) => {
    const exerciseFound = exercisesData.find((ex) => ex.id === exerciseId);
    return exerciseFound ? exerciseFound.name : exerciseId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Exercise Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggleExpanded}
        onKeyDown={handleKeyDownToggle}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "ยุบ" : "ขยาย"} exercise ${exerciseIndex}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                {exerciseIndex}
              </span>
              <h5 className="font-medium text-gray-900">
                {getExerciseName(exercise.exercise_id)}
              </h5>
              <span className="text-sm text-gray-500">
                ({exercise.sets.length} เซ็ต)
              </span>
            </div>

            <div className="ml-9 flex flex-wrap gap-4 text-sm">
              {exercise.exercise_rest && (
                <div>
                  <span className="text-gray-500">พัก: </span>
                  <span className="font-medium text-gray-900">
                    {formatRestTime(exercise.exercise_rest)}
                  </span>
                </div>
              )}

              {exercise.exercise_notes && (
                <div className="w-full">
                  <span className="text-gray-500">Notes: </span>
                  <span className="text-gray-700">
                    {exercise.exercise_notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Icon */}
          <div className="ml-4">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Sets Table - Collapsible */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {exercise.sets.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">
                ยังไม่มี sets ใน exercise นี้
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        เซ็ต
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        น้ำหนัก
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        จำนวนครั้ง
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        เวลา
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        ระยะ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set) => (
                      <tr
                        key={set.program_exercise_set_id}
                        className="border-b border-gray-100 hover:bg-white transition-colors"
                      >
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {set.set_order}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-900">
                          {formatSetValue(set.weight, "kg")}
                        </td>
                        <td className="py-2 px-3 text-gray-900">
                          {formatSetValue(set.reps)}
                        </td>
                        <td className="py-2 px-3 text-gray-900">
                          {set.time ? formatRestTime(set.time) : "-"}
                        </td>
                        <td className="py-2 px-3 text-gray-900">
                          {formatSetValue(set.distance, "m")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;

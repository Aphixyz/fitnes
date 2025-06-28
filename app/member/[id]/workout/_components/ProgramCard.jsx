"use client";

import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import WorkoutLoggingModal from "./WorkoutLoggingModal";

/**
 * ProgramCard - Client Component
 * แสดงข้อมูล workout program พร้อม exercises
 */
const ProgramCard = ({ program, programIndex, workoutPlan }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDownToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleExpanded();
    }
  };

  const handleStartLogging = (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้ toggle expanded
    setIsLoggingModalOpen(true);
  };

  const handleCloseLoggingModal = () => {
    setIsLoggingModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Program Header - Clickable */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleToggleExpanded}
          onKeyDown={handleKeyDownToggle}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "ยุบ" : "ขยาย"} program ${
            program.program_name
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {programIndex}
                </span>
                <h4 className="text-lg font-semibold text-gray-900">
                  {program.program_name}
                </h4>
                <span className="text-sm text-gray-500">
                  ({program.exercises.length} ท่าออกกำลังกาย)
                </span>
              </div>

              {program.program_note && (
                <p className="text-sm text-gray-600 ml-11">
                  {program.program_note}
                </p>
              )}
            </div>

            {/* Action Buttons และ Toggle Icon */}
            <div className="flex items-center gap-3 ml-4">
              {/* ปุ่มเริ่มบันทึก */}
              <button
                onClick={handleStartLogging}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                aria-label={`เริ่มบันทึกการออกกำลังกายสำหรับ ${program.program_name}`}
              >
                เริ่มบันทึก
              </button>

              {/* Toggle Icon */}
              <div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
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
        </div>

        {/* Exercises List - Collapsible */}
        {isExpanded && (
          <div className="border-t bg-gray-50">
            {program.exercises.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  ยังไม่มี exercises ใน program นี้
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {program.exercises.map((exercise, exerciseIndex) => (
                  <ExerciseCard
                    key={exercise.program_exercise_id}
                    exercise={exercise}
                    exerciseIndex={exerciseIndex + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workout Logging Modal */}
      <WorkoutLoggingModal
        isOpen={isLoggingModalOpen}
        onClose={handleCloseLoggingModal}
        program={program}
        workoutPlan={workoutPlan}
      />
    </>
  );
};

export default ProgramCard;

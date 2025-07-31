"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import WorkoutProgramDialog from "@/app/member/[id]/quick-add/workout-log/_components/WorkoutProgramDialog";
import WorkoutLoggingModal from "@/app/member/[id]/quick-add/workout-log/_components/WorkoutLoggingModal";
import exercisesData from "@/data/exercises.json";

/**
 * WorkoutProgramCard - Client Component เฉพาะสำหรับหน้านี้
 * แสดงข้อมูล workout program พร้อมรายชื่อท่าออกกำลังกายทั้งหมด
 */
const WorkoutProgramCard = ({ program, programIndex, workoutPlan }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleKeyDownOpen = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenDialog();
    }
  };

  const handleStartWorkout = () => {
    // เปิด WorkoutLoggingModal แทน console.log
    setIsLoggingModalOpen(true);
  };

  const handleCloseLoggingModal = () => {
    setIsLoggingModalOpen(false);
  };

  // ฟังก์ชันหา meta จาก exercises.json
  const getExerciseName = (exerciseId) => {
    const exercise = exercisesData.find((ex) => ex.id === exerciseId);
    return exercise?.name || `Exercise ${exerciseId}`;
  };

  // สร้างรายชื่อท่าออกกำลังกาย (แสดงแค่ 3 ท่าแรก + "และอื่นๆ")
  const getExerciseNames = () => {
    const names = program.exercises.map((ex) =>
      getExerciseName(ex.exercise_id)
    );
    if (names.length <= 3) {
      return names.join(", ");
    } else {
      return `${names.slice(0, 3).join(", ")} และอื่นๆ (${
        names.length - 3
      } ท่า)`;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        {/* Program Header - Clickable */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleOpenDialog}
          onKeyDown={handleKeyDownOpen}
          tabIndex={0}
          role="button"
          aria-label={`ดูรายละเอียด program ${programIndex}: ${program.program_name}`}
        >
          <div className="space-y-3">
            {/* Program Title & Index */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {programIndex}
                </span>
                <h4 className="text-lg font-semibold text-gray-900">
                  {program.program_name}
                </h4>
                <span className="text-sm text-gray-500">
                  ({program.exercises.length} ท่า)
                </span>
              </div>

              {/* Click Icon */}
              <div className="ml-4">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Exercise Names List */}
            <div className="pl-11">
              <p className="text-sm text-gray-600 leading-relaxed">
                {getExerciseNames()}
              </p>
            </div>
          </div>
        </div>

        {/* Start Workout Button */}
        <div className="px-4 pb-4">
          <Button
            onClick={handleStartWorkout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            เริ่มบันทึกการออกกำลังกาย
          </Button>
        </div>
      </div>

      {/* Program Dialog */}
      <WorkoutProgramDialog
        program={program}
        programIndex={programIndex}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onStartWorkout={handleStartWorkout}
      />

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

export default WorkoutProgramCard;

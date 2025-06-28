"use client";

import { useState } from "react";

/**
 * WorkoutControls - Client Component
 * ปุ่มควบคุมต่าง ๆ สำหรับ workout plan
 */
const WorkoutControls = ({ workoutPlan }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartWorkout = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement start workout logic
      console.log("Starting workout for plan:", workoutPlan.workout_plan_id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // เปลี่ยนเส้นทางไปหน้า workout session หรือแสดง modal
      alert("เริ่ม workout แล้ว! (นี่คือ demo)");
    } catch (error) {
      console.error("Error starting workout:", error);
      alert("เกิดข้อผิดพลาดในการเริ่ม workout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = () => {
    // TODO: Navigate to workout history page
    console.log(
      "Viewing workout history for plan:",
      workoutPlan.workout_plan_id
    );
    alert("ดูประวัติ workout (นี่คือ demo)");
  };

  const handleEditPlan = () => {
    // TODO: Navigate to edit plan page
    console.log("Editing workout plan:", workoutPlan.workout_plan_id);
    alert("แก้ไข workout plan (นี่คือ demo)");
  };

  const handleKeyDownStart = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStartWorkout();
    }
  };

  const handleKeyDownHistory = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleViewHistory();
    }
  };

  const handleKeyDownEdit = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEditPlan();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Start Workout Button - Primary */}
      <button
        onClick={handleStartWorkout}
        onKeyDown={handleKeyDownStart}
        disabled={isLoading}
        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="เริ่ม workout"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            กำลังเริ่ม...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z"
              />
            </svg>
            เริ่ม Workout
          </>
        )}
      </button>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        {/* View History Button */}
        <button
          onClick={handleViewHistory}
          onKeyDown={handleKeyDownHistory}
          className="inline-flex items-center justify-center px-4 py-3 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          aria-label="ดูประวัติ workout"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden sm:inline">ประวัติ</span>
        </button>

        {/* Edit Plan Button */}
        <button
          onClick={handleEditPlan}
          onKeyDown={handleKeyDownEdit}
          className="inline-flex items-center justify-center px-4 py-3 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          aria-label="แก้ไข workout plan"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="hidden sm:inline">แก้ไข</span>
        </button>
      </div>
    </div>
  );
};

export default WorkoutControls;

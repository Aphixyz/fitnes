"use client";

import { useState, useEffect } from "react";
import exercisesData from "@/data/exercises.json";
import ExerciseSetForm, { ExerciseSetTable } from "./ExerciseSetForm";
import WorkoutSummary from "./WorkoutSummary";

/**
 * WorkoutLoggingModal - Client Component
 * Modal สำหรับบันทึกข้อมูลการออกกำลังกาย (แบบ carousel)
 */
const WorkoutLoggingModal = ({ isOpen, onClose, program }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right");
  const [loggedSets, setLoggedSets] = useState({}); // เก็บข้อมูลการ log ของแต่ละเซต

  if (!isOpen) return null;

  const exercises = program?.exercises || [];
  const totalPages = exercises.length + 1; // จำนวนท่า + หน้าสรุป
  const isLastPage = currentPage === exercises.length;
  const isFirstPage = currentPage === 0;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseModal = () => {
    setCurrentPage(0);
    setIsAnimating(false);
    setLoggedSets({}); // Reset logged data เมื่อปิด modal
    onClose();
  };

  const handleNextPage = () => {
    if (currentPage < exercises.length && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection("right");

      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection("left");

      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  // ฟังก์ชันหาชื่อ exercise จาก ID
  const getExerciseName = (exerciseId) => {
    const exerciseFound = exercisesData.find((ex) => ex.id === exerciseId);
    return exerciseFound ? exerciseFound.name : exerciseId;
  };

  // คำนวณสถิติการ logging สำหรับ exercise ปัจจุบัน
  const getExerciseStats = (exercise) => {
    const exerciseLoggedSets = Object.keys(loggedSets).filter((key) =>
      key.startsWith(`${exercise.program_exercise_id}_`)
    );

    const completedSets = exerciseLoggedSets.length;
    const totalSets = exercise.sets?.length || 0;

    // คำนวณน้ำหนักรวม (weight × reps สำหรับทุก logged sets)
    const totalWeight = exerciseLoggedSets.reduce((sum, setKey) => {
      const setData = loggedSets[setKey];
      if (setData && setData.weight && setData.reps) {
        return sum + setData.weight * setData.reps;
      }
      return sum;
    }, 0);

    return {
      completedSets,
      totalSets,
      totalWeight,
    };
  };

  // Get current exercise name for modal header
  const getCurrentExerciseName = () => {
    if (isLastPage) return `สรุปการออกกำลังกาย${program?.program_name || ""}`;
    const exercise = exercises[currentPage];
    return getExerciseName(exercise?.exercise_id);
  };

  // Render Current Exercise Page
  const renderExercisePage = () => {
    if (isLastPage) {
      return renderSummaryPage();
    }

    const exercise = exercises[currentPage];
    const stats = getExerciseStats(exercise);

    return (
      <div className="p-6 bg-white text-gray-900">
        {/* Exercise Stats Header */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalWeight}
                </div>
                <div className="text-sm text-gray-600">น้ำหนักรวม (กก.)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedSets}/{stats.totalSets}
                </div>
                <div className="text-sm text-gray-600">เซต</div>
              </div>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-4 text-sm">
              <div></div>
              {exercise.exercise_rest && (
                <div>
                  <span className="text-gray-600">พักระหว่างเซต: </span>
                  <span className="font-medium text-gray-900">
                    {exercise.exercise_rest} วิ
                  </span>
                </div>
              )}
            </div>
            {exercise.exercise_notes && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">หมายเหตุ: </span>
                <span className="text-gray-700">{exercise.exercise_notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Sets Table */}
        {(() => {
          // คำนวณ active fields จากทุก sets ใน exercise นี้
          const getAllActiveFields = () => {
            const fieldsSet = new Set();
            exercise.sets?.forEach((set) => {
              if (set.weight !== null) fieldsSet.add("weight");
              if (set.reps !== null) fieldsSet.add("reps");
              if (set.time !== null) fieldsSet.add("time");
              if (set.distance !== null) fieldsSet.add("distance");
            });

            const fieldOrder = ["weight", "reps", "time", "distance"];
            return fieldOrder
              .filter((field) => fieldsSet.has(field))
              .map((key) => ({ key }));
          };

          const exerciseActiveFields = getAllActiveFields();

          return (
            <ExerciseSetTable
              exerciseName={getExerciseName(exercise.exercise_id)}
              activeFields={exerciseActiveFields}
            >
              {exercise.sets?.map((set, setIndex) => (
                <ExerciseSetForm
                  key={set.program_exercise_set_id}
                  set={set}
                  exercise={exercise}
                  loggedSets={loggedSets}
                  setLoggedSets={setLoggedSets}
                />
              ))}
            </ExerciseSetTable>
          );
        })()}
      </div>
    );
  };

  // Render Summary Page
  const renderSummaryPage = () => {
    return (
      <div className="p-6 bg-white text-gray-900">
        <WorkoutSummary
          exercises={exercises}
          loggedSets={loggedSets}
          getExerciseStats={getExerciseStats}
        />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getCurrentExerciseName()}
            </h2>
          </div>

          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="ปิด modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {/* Navigation Arrows */}
          {!isFirstPage && (
            <button
              onClick={handlePreviousPage}
              disabled={isAnimating}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-gray-50 rounded-full shadow-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าก่อนหน้า"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {!isLastPage && (
            <button
              onClick={handleNextPage}
              disabled={isAnimating}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-gray-50 rounded-full shadow-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าถัดไป"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Slide Content */}
          <div
            className={`max-h-[calc(90vh-200px)] overflow-y-auto transition-all duration-300 ease-in-out bg-white ${
              isAnimating
                ? slideDirection === "right"
                  ? "transform translate-x-2 opacity-75"
                  : "transform -translate-x-2 opacity-75"
                : "transform translate-x-0 opacity-100"
            }`}
          >
            {renderExercisePage()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage
                    ? "bg-blue-500 scale-125"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isLastPage && (
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                บันทึกข้อมูล
              </button>
            )}

            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLoggingModal;

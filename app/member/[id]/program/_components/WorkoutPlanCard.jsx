"use client";

import ProgramCard from "./ProgramCard";

/**
 * WorkoutPlanCard - Client Component
 * แสดงข้อมูล workout plan พร้อม programs และ controls
 */
const WorkoutPlanCard = ({ workoutPlan }) => {
  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(workoutPlan.plan_enddate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Plan Header Card - Modern Design */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
        <div className="space-y-3 sm:space-y-4">
          {/* Plan Title */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {workoutPlan.plan_name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm sm:text-lg font-medium">
                  {formatDateShort(workoutPlan.plan_startdate)} -{" "}
                  {formatDateShort(workoutPlan.plan_enddate)}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 self-start">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-green-700">
                {workoutPlan.plan_status}
              </span>
            </div>
          </div>

          {/* Plan Note */}
          {workoutPlan.plan_note && (
            <div className="bg-blue-50/50 border-l-4 border-blue-400 rounded-r-lg p-3 sm:p-4">
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                {workoutPlan.plan_note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Programs */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          ทั้งหมด {workoutPlan.programs.length} โปรแกรม
        </h3>

        {workoutPlan.programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">
              ยังไม่มี workout programs
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {workoutPlan.programs.map((program, index) => (
              <ProgramCard
                key={program.workout_program_id}
                program={program}
                programIndex={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanCard;

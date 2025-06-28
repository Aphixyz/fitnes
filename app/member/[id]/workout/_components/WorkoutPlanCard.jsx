"use client";

import ProgramCard from "./ProgramCard";
import WorkoutControls from "./WorkoutControls";

/**
 * WorkoutPlanCard - Client Component
 * แสดงข้อมูล workout plan พร้อม programs และ controls
 */
const WorkoutPlanCard = ({ workoutPlan }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    <div className="space-y-6">
      {/* Plan Header Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Plan Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {workoutPlan.plan_name}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {workoutPlan.plan_status}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">ระยะเวลา</p>
                <p className="font-medium text-gray-900">
                  {workoutPlan.plan_duration} วัน
                </p>
              </div>
              <div>
                <p className="text-gray-500">เริ่มต้น</p>
                <p className="font-medium text-gray-900">
                  {formatDate(workoutPlan.plan_startdate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">สิ้นสุด</p>
                <p className="font-medium text-gray-900">
                  {formatDate(workoutPlan.plan_enddate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">เหลือ</p>
                <p
                  className={`font-medium ${
                    daysRemaining > 7
                      ? "text-green-600"
                      : daysRemaining > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {daysRemaining > 0 ? `${daysRemaining} วัน` : "หมดเวลาแล้ว"}
                </p>
              </div>
            </div>

            {workoutPlan.plan_note && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{workoutPlan.plan_note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          โปรแกรม ({workoutPlan.programs.length})
        </h3>

        {workoutPlan.programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-500">ยังไม่มี workout programs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutPlan.programs.map((program, index) => (
              <ProgramCard
                key={program.workout_program_id}
                program={program}
                programIndex={index + 1}
                workoutPlan={workoutPlan}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanCard;

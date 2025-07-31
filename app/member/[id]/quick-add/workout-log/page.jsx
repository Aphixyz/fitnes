import { Button } from "@/components/ui/button";
import Link from "next/link";

import { fetchActiveWorkoutPlan } from "@/actions/member/my-workout-plans/fetchWorkoutPlans.js";
import WorkoutProgramCard from "./_components/WorkoutProgramCard";

/**
 * WorkoutLogPage - SSR Server Component
 * แสดงหน้าเลือกเซสชันการฝึกสำหรับบันทึก workout log
 */
export default async function WorkoutLogPage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ===== ดึงข้อมูล active workout plan =====
  const workoutPlanResult = await fetchActiveWorkoutPlan(memberId);

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Workout Plan Overview */}
      {workoutPlanResult.success && workoutPlanResult.data && (
        <div className="mb-6">
          {/* Plan Header Card - Modern Design */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
            <div className="space-y-3 sm:space-y-4">
              {/* Plan Title */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {workoutPlanResult.data.plan_name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm sm:text-lg font-medium">
                      {formatDateShort(workoutPlanResult.data.plan_startdate)} -{" "}
                      {formatDateShort(workoutPlanResult.data.plan_enddate)}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 self-start">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-700">
                    {workoutPlanResult.data.plan_status}
                  </span>
                </div>
              </div>

              {/* Plan Note */}
              {workoutPlanResult.data.plan_note && (
                <div className="bg-blue-50/50 border-l-4 border-blue-400 rounded-r-lg p-3 sm:p-4">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {workoutPlanResult.data.plan_note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workout Session Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!workoutPlanResult.success || !workoutPlanResult.data ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ยังไม่มี Workout Plan
            </h3>
            <p className="text-gray-600 mb-4">
              คุณยังไม่มี workout plan ที่ active กรุณาติดต่อเทรนเนอร์
            </p>
            <Link href={`/member/${memberId}/program`}>
              <Button variant="outline">ดูแผนโปรแกรม</Button>
            </Link>
          </div>
        ) : workoutPlanResult.data.programs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">ยังไม่มี workout programs ในแผนนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutPlanResult.data.programs.map((program, index) => (
              <WorkoutProgramCard
                key={program.workout_program_id}
                program={program}
                programIndex={index + 1}
                workoutPlan={workoutPlanResult.data}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  // Empty state for no workout plan
  if (!workoutPlanResult.success || !workoutPlanResult.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
          <div className="flex items-center justify-between p-4 h-16">
            <Link
              href={`/member/${memberId}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              บันทึกการออกกำลังกาย
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="space-y-4">
            {/* Workout Sessions Section */}
            <div className="space-y-3">
              <div className="px-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  เลือกเซสชันการฝึก
                </h2>
              </div>

              {/* Empty Workout Plan Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="mb-4">
                  <div className="text-6xl">📊</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ยังไม่มี Workout Plan
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  คุณยังไม่มี workout plan ที่ active กรุณาติดต่อเทรนเนอร์
                </p>
                <Link href={`/member/${memberId}/program`}>
                  <Button variant="outline">ดูแผนโปรแกรม</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
        <div className="flex items-center justify-between p-4 h-16">
          <Link
            href={`/member/${memberId}/dashboard`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            บันทึกการออกกำลังกาย
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="space-y-4">
          {/* Workout Plan Overview */}
          {workoutPlanResult.success && workoutPlanResult.data && (
            <div className="space-y-3">
              <div className="px-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {workoutPlanResult.data.plan_name}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm font-medium">
                    {formatDateShort(workoutPlanResult.data.plan_startdate)} -{" "}
                    {formatDateShort(workoutPlanResult.data.plan_enddate)}
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
                  <span className="text-sm font-medium text-green-700">
                    {workoutPlanResult.data.plan_status}
                  </span>
                </div>
              </div>

              {/* Plan Note */}
              {workoutPlanResult.data.plan_note && (
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mx-1">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {workoutPlanResult.data.plan_note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Workout Session Selection */}
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-xl font-semibold text-gray-900">
                เลือกเซสชันการฝึก
              </h2>
            </div>

            {workoutPlanResult.data.programs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="mb-4">
                  <div className="text-6xl">🏳️</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ยังไม่มี Workout Programs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ยังไม่มี workout programs ในแผนนี้
                </p>
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
      </div>
    </div>
  );
}

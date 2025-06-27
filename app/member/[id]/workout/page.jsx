import { fetchActiveWorkoutPlan } from "../../../../actions/member/my-workout-plans/fetchWorkoutPlans.js";
import WorkoutPlanCard from "./_components/WorkoutPlanCard";

/**
 * Workout Page - SSR Server Component
 * แสดงข้อมูล active workout plan ของ member
 */
const WorkoutPage = async ({ params }) => {
  const { id: memberId } = await params;

  // Server-side data fetching
  const workoutPlanResult = await fetchActiveWorkoutPlan(parseInt(memberId));

  // จัดการกรณีไม่มีข้อมูล
  if (!workoutPlanResult.success || !workoutPlanResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ยังไม่มี Workout Plan
            </h2>
            <p className="text-gray-600 mb-6">
              คุณยังไม่มี workout plan ที่ active อยู่ ไปสร้างใหม่กันเลย!
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              สร้าง Workout Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">การออกกำลังกายของฉัน</h1>
          <p className="text-gray-600">ติดตามและบันทึกการออกกำลังกายของฉัน</p>
        </div>

        {/* Workout Plan Content */}
        <WorkoutPlanCard workoutPlan={workoutPlanResult.data} />
      </div>
    </div>
  );
};

export default WorkoutPage;

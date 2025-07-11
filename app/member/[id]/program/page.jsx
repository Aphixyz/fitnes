import { fetchActiveWorkoutPlan } from "../../../../actions/member/my-workout-plans/fetchWorkoutPlans.js";
import WorkoutPlanCard from "./_components/WorkoutPlanCard.jsx";
import { fetchNutritionPlans } from "@/actions/member/my-nutrition-plans/fetchNutritionPlans.js";
import { convertRatiosToGrams } from "@/utils/macro-utils.js";
import MacroPlanTable from "./_components/MacroPlanTable.jsx";

/**
 * Workout Page - SSR Server Component
 * แสดงข้อมูล active workout plan ของ member
 */
const ProgramPage = async ({ params }) => {
  const { id: memberId } = await params;

  // ===== ดึง macro plan (active) =====
  let macroPlan = null;
  let macroGrams = null;
  try {
    macroPlan = await fetchNutritionPlans(parseInt(memberId));
    if (macroPlan) {
      macroGrams = convertRatiosToGrams(
        macroPlan.calorie_target || 0,
        macroPlan.protein_ratio || 0,
        macroPlan.carb_ratio || 0,
        macroPlan.fat_ratio || 0
      );
    }
  } catch (e) {
    macroPlan = null;
    macroGrams = null;
  }

  // Server-side data fetching
  const workoutPlanResult = await fetchActiveWorkoutPlan(parseInt(memberId));

  // ===== UI: Macro Plan Section =====
  const macroSection =
    macroPlan && macroGrams ? (
      <MacroPlanTable
        calories={macroPlan.calorie_target}
        protein_g={macroGrams.protein_g}
        carb_g={macroGrams.carb_g}
        fat_g={macroGrams.fat_g}
      />
    ) : (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ยังไม่มีแผนโภชนาการ
          </h2>
          <p className="text-gray-600">
            กรุณาติดต่อเทรนเนอร์เพื่อขอรับแผนโภชนาการ
          </p>
        </div>
      </div>
    );

  // ===== UI: Workout Plan Section =====
  if (!workoutPlanResult.success || !workoutPlanResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {macroSection}
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
              คุณยังไม่มี workout plan
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl ">
        {/* Content */}
        <div className="">
          {/* Workout Plan Content */}
          <WorkoutPlanCard workoutPlan={workoutPlanResult.data} />
        </div>
        
        <div className="">
          {/* Macro Plan Section */}
          {macroSection}
        </div>
      </div>
    </div>
  );
};

export default ProgramPage;

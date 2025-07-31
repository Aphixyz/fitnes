import { fetchActiveWorkoutPlan } from "../../../../actions/member/my-workout-plans/fetchWorkoutPlans.js";
import WorkoutPlanCard from "./_components/WorkoutPlanCard.jsx";
import { fetchNutritionPlans } from "@/actions/member/my-nutrition-plans/fetchNutritionPlans.js";
import { convertRatiosToGrams } from "@/utils/macro-utils.js";
import MacroPlanTable from "./_components/MacroPlanTable.jsx";

/**
 * Program Page - SSR Server Component
 * แสดงข้อมูล active workout plan และ nutrition plan ของ member
 * Mobile-first responsive design
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
      <div className="w-full">
        <MacroPlanTable
          calories={macroPlan.calorie_target}
          protein_g={macroGrams.protein_g}
          carb_g={macroGrams.carb_g}
          fat_g={macroGrams.fat_g}
        />
      </div>
    ) : (
      <div className="w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            ยังไม่มีแผนโภชนาการ
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            กรุณาติดต่อเทรนเนอร์เพื่อขอรับแผนโภชนาการที่เหมาะกับคุณ
          </p>
        </div>
      </div>
    );

  // ===== UI: Workout Plan Section =====
  if (!workoutPlanResult.success || !workoutPlanResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Nutrition Plan Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                แผนโภชนาการ
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            {macroSection}
          </section>

          {/* Workout Plan Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                แผนออกกำลังกาย
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                ยังไม่มีแผนออกกำลังกาย
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
                คุณยังไม่มีแผนออกกำลังกายที่กำหนดไว้ กรุณาติดต่อเทรนเนอร์เพื่อสร้างแผนที่เหมาะกับคุณ
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  ติดต่อเทรนเนอร์
                </button>
                <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
                  ดูแผนตัวอย่าง
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Content */}
      <div className="px-1 sm:px-6 lg:px-8 py-1 sm:py-2 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Workout Plan Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              แผนออกกำลังกาย
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          </div>
          <WorkoutPlanCard workoutPlan={workoutPlanResult.data} />
        </section>

        {/* Nutrition Plan Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              แผนโภชนาการ
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          {macroSection}
        </section>
      </div>
    </div>
  );
};

export default ProgramPage;

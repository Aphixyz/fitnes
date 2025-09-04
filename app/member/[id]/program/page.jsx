import { fetchActiveWorkoutPlan } from "../../../../actions/member/my-workout-plans/fetchWorkoutPlans.js";
import WorkoutPlanCard from "./_components/WorkoutPlanCard.jsx";
import { fetchNutritionPlans } from "@/actions/member/my-nutrition-plans/fetchNutritionPlans.js";
import { convertRatiosToGrams } from "@/utils/macro-utils.js";
import MacroPlanTable from "./_components/MacroPlanTable.jsx";
import WeeklyNutritionGrid from "./_components/WeeklyNutritionGrid.jsx";

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
  const macroSection = (
    <WeeklyNutritionGrid
      nutritionData={
        macroPlan && macroGrams
          ? {
              calories: macroPlan.calorie_target,
              protein: macroGrams.protein_g,
              carb: macroGrams.carb_g,
              fat: macroGrams.fat_g,
            }
          : null
      }
    />
  );

  // ===== UI: Workout Plan Section =====
  if (!workoutPlanResult.success || !workoutPlanResult.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20 w-full flex items-center justify-center">
          <h1 className="text-xl font-semibold text-gray-900">แผนโปรแกรม</h1>
        </div>

        {/* Content - Mobile Responsive */}
        <div className="px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
          {/* Single Column Layout for Mobile */}
          <div className="space-y-6">
            {/* Workout Plan Section */}
            <div className="space-y-3">
              <div className="px-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  แผนออกกำลังกาย
                </h2>
              </div>

              {/* Empty Workout Plan Card - Mobile Responsive */}
              <div className="p-4 sm:p-6 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="text-6xl sm:text-8xl">🫩</div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
                  ไม่มีแผนออกกำลังกาย
                </h3>
                <p className="text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  เทรนเนอร์ยังไม่ได้สร้างแผนออกกำลังกายให้คุณ
                </p>
              </div>
            </div>

            {/* Nutrition Plan Section */}
            <div className="space-y-3">
              <div className="px-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  แผนโภชนาการรายสัปดาห์
                </h2>
              </div>

              {/* Nutrition Plan Card */}
              <div className="w-full">{macroSection}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20 w-full flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-900">แผนโปรแกรม</h1>
      </div>

      <div className="px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
        {/* Single Column Layout for Better Mobile Experience */}
        <div className="space-y-6">
          {/* Workout Plan Section */}
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-xl font-semibold text-gray-900">
                แผนฝึกออกกำลังกาย
              </h2>
            </div>

            {/* Workout Plan Card */}
            <div className="w-full">
              <WorkoutPlanCard workoutPlan={workoutPlanResult.data} />
            </div>
          </div>

          {/* Nutrition Plan Section */}
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-xl font-semibold text-gray-900">
                แผนโภชนาการรายสัปดาห์
              </h2>
            </div>

            {/* Nutrition Plan Card */}
            <div className="w-full">{macroSection}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramPage;

import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import { fetchWorkoutPlanByMemberId } from "@/lib/db/fetchWorkoutPlanByMemberId";
import WorkoutPlanLists from "./_components/WorkoutPlanLists";

export default async function MemberWorkoutPlansPage({ params }) {
  // Extract params
  const { trainerId, memberId } = await params;

  // ดึงข้อมูลสมาชิกในฝั่ง server
  const memberResult = await getMemberDetails(trainerId, memberId);

  // ดึงข้อมูลแผนออกกำลังกายในฝั่ง server
  const plansResult = await fetchWorkoutPlanByMemberId(trainerId, memberId);
  const plans = plansResult.success ? plansResult.plans : [];

  // หาแผนที่ active อยู่ (ถ้ามี)
  const activePlan = plans.find((plan) => plan.plan_status === "active");

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      {/* เนื้อหาหลัก - ส่งข้อมูลให้ Client Component */}
      <div className="space-y-6 ">
        <WorkoutPlanLists
          trainerId={trainerId}
          memberId={memberId}
          plans={plans}
          activePlan={activePlan}
          hasError={!plansResult.success}
          errorMessage={!plansResult.success ? plansResult.message : null}
        />
      </div>
    </div>
  );
}

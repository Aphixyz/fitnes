import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import { createWorkoutPlanForMember } from "@/actions/trainer/workout/workout_plan/createWorkoutPlanForMember";
import WorkoutPlanForm from "./_components/WorkoutPlanForm";

export default async function CreateWorkoutPlanPage({ params }) {
  const { trainerId, memberId } = await params;

  // ดึงข้อมูลสมาชิกที่ฝั่ง server
  const memberResult = await getMemberDetails(trainerId, memberId);
  const memberName = memberResult.success
    ? `${memberResult.member.member_firstname} ${memberResult.member.member_lastname}`
    : "ไม่พบข้อมูลสมาชิก";

  return (
    <form action={createWorkoutPlanForMember} className="container py-6">
      <input type="hidden" name="trainer_id" value={trainerId} />
      <input type="hidden" name="member_id" value={memberId} />
      <WorkoutPlanForm
        memberName={memberName}
        title="สร้างโปรแกรมการออกกำลังกาย"
      />
    </form>
  );
}

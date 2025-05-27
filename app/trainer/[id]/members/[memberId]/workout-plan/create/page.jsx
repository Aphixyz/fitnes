import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import WorkoutPlanForm from "./_components/WorkoutPlanForm";
import { createWorkoutPlanForMember } from "@/actions/trainer/workout/workout_plan/createWorkoutPlanForMember";
import { getMemberDetails } from "@/actions/trainer/getMemberDetails";

export default async function CreateWorkoutPlanPage({ params }) {
  const { id: trainerId, memberId } = await params;
  // const { trainerId, memberId } =  params;

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

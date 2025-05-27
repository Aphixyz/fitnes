import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutPlanTable from "./WorkoutPlanTable";
import { getWorkoutPlanByMemberId } from "@/actions/trainer/workout/workout_plan/getWorkoutPlansByMemberId";
import EmptyPlanCard from "./EmptyPlanCard";

// ทำเป็น server component (ไม่มี "use client")
export default async function WorkoutPlanList({ trainerId, memberId }) {
  // โหลดข้อมูลในฝั่ง server
  const response = await getWorkoutPlanByMemberId({
    trainer_id: Number(trainerId),
    member_id: Number(memberId),
    includeDetails: false,
  });

  const plans = response.success ? response.plans : [];
  
  // กรณีไม่มีแผน
  if (plans.length === 0) {
    return <EmptyPlanCard trainerId={trainerId} memberId={memberId} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>แผนออกกำลังกายทั้งหมด</CardTitle>
        <CardDescription>
          รายการแผนออกกำลังกายสำหรับสมาชิกนี้
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ส่ง plans ที่ได้ไปให้ WorkoutPlanTable ที่เป็น client component */}
        <WorkoutPlanTable 
          plans={plans} 
          trainerId={trainerId} 
          memberId={memberId} 
        />
      </CardContent>
    </Card>
  );
}
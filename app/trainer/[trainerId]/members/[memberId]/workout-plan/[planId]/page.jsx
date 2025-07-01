import { fetchWorkoutDetailById } from "@/lib/db/fetchWorkoutDetailById";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/utils/utils";
import EditInfoBtn from "./_components/EditInfoBtn";
import ProgramHeader from "./_components/ProgramHeader";
import ProgramList from "./_components/ProgramList";

export default async function WorkoutPlanPage({ params }) {
  // Extract params from URL
  const { trainerId, memberId, planId, programId } = await params;

  // Fetch workout plan details
  const response = await fetchWorkoutDetailById({
    trainer_id: Number(trainerId),
    member_id: Number(memberId),
    workout_plan_id: Number(planId),
  });

  // Handle not found or errors
  if (!response.success) {
    notFound();
  }

  const { plan } = response;

  // Calculate duration text
  const getDurationText = (duration) => {
    if (!duration || duration === 0) return "ไม่กำหนด";
    return `${duration} สัปดาห์`;
  };

  // จำนวนโปรแกรมทั้งหมด
  const programCount = plan.programs ? plan.programs.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {plan.plan_name}
          </h1>
          <p className="text-muted-foreground">รายละเอียดแผนการออกกำลังกาย</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/trainer/${trainerId}/members/${memberId}/workout-plan`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <EditInfoBtn
            plan={plan}
            trainerId={trainerId}
            memberId={memberId}
            planId={planId}
          />
        </div>
      </div>

      {/* แสดงรายละเอียดแผน */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลแผนการออกกำลังกาย</CardTitle>
          <CardDescription>รายละเอียดและระยะเวลา</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">ข้อมูลทั่วไป</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ระยะเวลา</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(plan.plan_startdate)} -{" "}
                      {plan.plan_enddate
                        ? formatDate(plan.plan_enddate)
                        : "ไม่กำหนด"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ระยะเวลาโปรแกรม</p>
                    <p className="text-sm text-muted-foreground">
                      {getDurationText(plan.plan_duration)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {plan.plan_note && (
            <div>
              <h3 className="text-sm font-medium mb-1">บันทึกเพิ่มเติม</h3>
              <p className="text-sm text-muted-foreground">{plan.plan_note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ส่วนหัวของโปรแกรมย่อย */}
      <ProgramHeader
        programCount={programCount}
        trainerId={trainerId}
        memberId={memberId}
        planId={planId}
      />

      {/* แสดงรายการโปรแกรมย่อย */}
      <ProgramList
        programs={plan.programs}
        trainerId={trainerId}
        memberId={memberId}
        planId={planId}
      />
    </div>
  );
}

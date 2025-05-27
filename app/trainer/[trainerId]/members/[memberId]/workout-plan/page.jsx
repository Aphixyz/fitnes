// import * as React from "react";

import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import { fetchWorkoutPlanByMemberId } from "@/lib/db/fetchWorkoutPlanByMemberId";
import WorkoutPlanLists from "./_components/WorkoutPlanLists";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default async function MemberWorkoutPlansPage({ params }) {
  // Extract params
  const { trainerId, memberId } = params;

  // ดึงข้อมูลสมาชิกในฝั่ง server
  const memberResult = await getMemberDetails(trainerId, memberId);
  const memberName = memberResult.success
    ? `${memberResult.member.member_firstname} ${memberResult.member.member_lastname}`
    : "ไม่พบข้อมูล";

  // ดึงข้อมูลแผนออกกำลังกายในฝั่ง server
  const plansResult = await fetchWorkoutPlanByMemberId(trainerId, memberId);
  const plans = plansResult.success ? plansResult.plans : [];

  // หาแผนที่ active อยู่ (ถ้ามี)
  const activePlan = plans.find((plan) => plan.plan_status === "active");

  return (
    <div className="space-y-6">
      {/* PageHeader ส่วน */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            แผนออกกำลังกาย
          </h1>
          <p className="text-muted-foreground">
            จัดการแผนออกกำลังกายสำหรับ {memberName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/trainer/${trainerId}/members/${memberId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <Link
            href={`/trainer/${trainerId}/members/${memberId}/workout-plan/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างแผนใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* เนื้อหาหลัก - ส่งข้อมูลให้ Client Component */}
      <WorkoutPlanLists
        trainerId={trainerId}
        memberId={memberId}
        plans={plans}
        activePlan={activePlan}
        hasError={!plansResult.success}
        errorMessage={!plansResult.success ? plansResult.message : null}
      />
    </div>
  );
}

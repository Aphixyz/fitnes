// import * as React from "react";

import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import WorkoutPlanList from "./_components/WorkoutPlanLists";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default async function MemberWorkoutPlansPage({ params }) {
  params = await params;
  
  const trainerId = params.id;
  const memberId = params.memberId;

  // ดึงข้อมูลสมาชิกในฝั่ง server
  const memberResult = await getMemberDetails(trainerId, memberId);
  const memberName = memberResult.success ? 
    `${memberResult.member.member_firstname} ${memberResult.member.member_lastname}` : 
    "ไม่พบข้อมูล";

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

      {/* เนื้อหาหลัก - ใช้ Server Component */}
      <WorkoutPlanList 
        trainerId={trainerId} 
        memberId={memberId} 
      />
    </div>
  );
}
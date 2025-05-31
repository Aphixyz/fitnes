"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import WorkoutPlanForm from "@/app/trainer/_components/workout/WorkoutPlanForm";

export default function CreateWorkoutPlanPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;

  const [memberName, setMemberName] = useState("");

  // ดึงข้อมูลสมาชิก
  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const result = await getMemberDetails(trainerId, memberId);
        if (result.success) {
          setMemberName(
            `${result.member.member_firstname} ${result.member.member_lastname}`
          );
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสมาชิกได้",
          variant: "destructive",
        });
      }
    };

    fetchMemberDetails();
  }, [trainerId, memberId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            สร้างโปรแกรมการฝึกใหม่
          </h1>
          <p className="text-muted-foreground">สำหรับ {memberName}</p>
        </div>
        <Link href={`/trainer/${trainerId}/members/${memberId}/workout-plan`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      {/* ใช้ WorkoutPlanForm และส่ง memberId เพื่อระบุสมาชิกโดยอัตโนมัติ */}
      <WorkoutPlanForm trainerId={trainerId} memberId={memberId} />
    </div>
  );
}
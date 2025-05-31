"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkoutPlanById } from "@/actions/trainer/workout/workoutv1/workoutPlanActions";
import WorkoutPlanForm from "@/app/trainer/_components/workout/WorkoutPlanForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditMemberWorkoutPlanPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;
  const planId = params.planId;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      setLoading(true);
      try {
        const result = await getWorkoutPlanById(planId, trainerId);

        if (result.success) {
          // Verify that this plan belongs to the specified member
          if (result.plan.member_id.toString() !== memberId) {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: "โปรแกรมการฝึกนี้ไม่ได้เป็นของสมาชิกที่ระบุ",
              variant: "destructive",
            });
            router.push(
              `/trainer/${trainerId}/members/${memberId}/workout-plan`
            );
            return;
          }

          setPlan(result.plan);
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
            variant: "destructive",
          });
          router.push(`/trainer/${trainerId}/members/${memberId}/workout-plan`);
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
          variant: "destructive",
        });
        router.push(`/trainer/${trainerId}/members/${memberId}/workout-plan`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, [trainerId, memberId, planId, router]);

  const memberName = plan
    ? `${plan.member_firstname} ${plan.member_lastname}`
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            แก้ไขโปรแกรมการฝึก
          </h1>
          {!loading && plan && (
            <p className="text-muted-foreground">สำหรับ {memberName}</p>
          )}
        </div>
        <Link
          href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`}
        >
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      ) : plan ? (
        <WorkoutPlanForm
          trainerId={trainerId}
          initialData={plan}
          memberId={memberId}
        />
      ) : null}
    </div>
  );
}

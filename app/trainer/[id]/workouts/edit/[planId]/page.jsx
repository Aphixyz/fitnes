"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWorkoutPlanById } from "@/actions/trainer/(workout)/workoutPlanActions";
import WorkoutPlanForm from "@/app/trainer/_components/(workout)/WorkoutPlanForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function EditWorkoutPlanPage({ params }) {
  const { id: trainerId, planId } = React.use(params);
  const router = useRouter();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      setLoading(true);
      try {
        const result = await getWorkoutPlanById(planId, trainerId);
        
        if (result.success) {
          setPlan(result.plan);
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
            variant: "destructive",
          });
          router.back();
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
          variant: "destructive",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, [trainerId, planId, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">แก้ไขโปรแกรมการฝึก</h1>
        <p className="text-muted-foreground">
          แก้ไขข้อมูลโปรแกรมการฝึก
        </p>
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
          memberId={plan.member_id}
        />
      ) : null}
    </div>
  );
}
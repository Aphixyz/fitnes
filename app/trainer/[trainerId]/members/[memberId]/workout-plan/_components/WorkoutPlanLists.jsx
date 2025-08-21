"use client";

import { useState } from "react";
import WorkoutPlanTable from "./WorkoutPlanTable";
import EmptyState from "./EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { changePlanStatus } from "@/actions/trainer/workout/workout_plan/changePlanStatus";
import { useToast } from "@/components/ui/use-toast";

export default function WorkoutPlanLists({
  trainerId,
  memberId,
  plans = [],
  activePlan,
  hasError = false,
  errorMessage = null,
}) {
  const [plansList, setPlansList] = useState(plans);
  const [active, setActive] = useState(activePlan);
  const { toast } = useToast();

  // จัดการเปลี่ยนสถานะแผนการออกกำลังกาย
  const handleStatusChange = async (planId, newStatus) => {
    try {
      const result = await changePlanStatus({
        plan_id: planId,
        status: newStatus,
      });

      if (result.updated) {
        // อัพเดตข้อมูลใน state
        const updatedPlans = plansList.map((plan) =>
          plan.workout_plan_id === planId
            ? { ...plan, plan_status: newStatus }
            : plan
        );

        // ถ้าเปลี่ยนเป็น active ให้ inactive แผนอื่นที่ active อยู่
        if (newStatus === "active") {
          const updatedPlansWithOneActive = updatedPlans.map((plan) =>
            plan.workout_plan_id !== planId && plan.plan_status === "active"
              ? { ...plan, plan_status: "inactive" }
              : plan
          );
          setPlansList(updatedPlansWithOneActive);

          // อัพเดต active plan
          setActive(
            updatedPlansWithOneActive.find(
              (plan) => plan.workout_plan_id === planId
            )
          );
        } else {
          setPlansList(updatedPlans);

          // ถ้าแผนที่เปลี่ยนสถานะเป็นแผนที่ active อยู่และไม่ได้เปลี่ยนเป็น active
          if (active && active.workout_plan_id === planId) {
            setActive(null);
          }
        }

        toast({
          title: "อัพเดตสถานะสำเร็จ",
          description: "เปลี่ยนสถานะแผนการออกกำลังกายเรียบร้อย",
        });
      }
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive",
      });
      console.error("Error updating status:", err);
    }
  };

  if (hasError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">
              {errorMessage || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {plansList.length > 0 ? (
        <WorkoutPlanTable
          plans={plansList}
          trainerId={trainerId}
          memberId={memberId}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <EmptyState trainerId={trainerId} memberId={memberId} />
      )}
    </div>
  );
}

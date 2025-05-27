"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWorkoutProgram } from "@/actions/trainer/workout/workout_program/addWorkoutProgram";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProgramHeader({
  programCount,
  trainerId,
  memberId,
  planId,
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const handleAddProgram = () => {
    start(async () => {
      const result = await addWorkoutProgram({
        workout_plan_id: planId,
        trainer_id: trainerId,
      });
      if (result.success) {
        router.push(
          `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/programs/${result.data.workout_program_id}?isNewProgram=true`
        );
      }
    });
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">โปรแกรมทั้งหมด</h2>
        <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full h-7 w-7 text-sm font-medium">
          {programCount}
        </span>
      </div>

      <Button
        onClick={handleAddProgram}
        size="sm"
        className="gap-1"
        disabled={isPending}
      >
        <Plus className="h-4 w-4" />
        {isPending ? "กำลังโหลด..." : "เพิ่มโปรแกรมย่อย"}
      </Button>
    </div>
  );
}

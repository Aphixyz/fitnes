"use client";

import WorkoutPlanForm from "@/app/trainer/_components/(workout)/WorkoutPlanForm";
import React, { use } from "react";

export default function CreateWorkoutPlanPage({ params }) {
  const { id: trainerId } = React.use(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">สร้างโปรแกรมการฝึกใหม่</h1>
        <p className="text-muted-foreground">
          กรอกข้อมูลโปรแกรมการฝึกสำหรับสมาชิก
        </p>
      </div>

      <WorkoutPlanForm trainerId={trainerId} />
    </div>
  );
}
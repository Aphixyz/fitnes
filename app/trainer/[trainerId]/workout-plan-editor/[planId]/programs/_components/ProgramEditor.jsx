"use client";

import ExercisePicker from "./ExercisePicker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ProgramEditor({
  workoutProgramId,
  trainerId,
  onExerciseAdded,
}) {
  return (
    <div className="sticky top-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center ">
            <Settings className="h-5 w-5 mr-2" />
            เลือกท่าออกกำลังกาย
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            <ExercisePicker
              workoutProgramId={workoutProgramId}
              trainerId={trainerId}
              onExerciseAdded={onExerciseAdded}
              isPanel={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

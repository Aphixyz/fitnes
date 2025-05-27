"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProgramExerciseList from "./ProgramExerciseList";

export default function ProgramForm({ exercises = [], onExercisesChange }) {
  const { toast } = useToast();

  // จัดการเมื่อมีการอัพเดตข้อมูลท่า
  const handleUpdateExercise = (exerciseId, data) => {
    const updatedExercises = exercises.map((ex) => {
      if (ex.program_exercise_id === exerciseId) {
        return { ...ex, ...data };
      }
      return ex;
    });

    onExercisesChange(updatedExercises);
  };

  // จัดการเมื่อมีการลบท่า
  const handleDeleteExercise = (exerciseId) => {
    const filteredExercises = exercises.filter(
      (ex) => ex.program_exercise_id !== exerciseId
    );

    // อัพเดต order_index หลังจากลบ
    const reindexedExercises = filteredExercises.map((ex, index) => ({
      ...ex,
      order_index: index,
    }));

    onExercisesChange(reindexedExercises);
  };

  // จัดการเมื่อมีการเรียงลำดับใหม่
  const handleReorderExercises = (reorderedExercises) => {
    onExercisesChange(reorderedExercises);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dumbbell className="h-5 w-5 mr-2" />
          ท่าออกกำลังกายในโปรแกรม
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProgramExerciseList
          exercises={exercises}
          onUpdate={handleUpdateExercise}
          onDelete={handleDeleteExercise}
          onReorder={handleReorderExercises}
        />
      </CardContent>
    </Card>
  );
}

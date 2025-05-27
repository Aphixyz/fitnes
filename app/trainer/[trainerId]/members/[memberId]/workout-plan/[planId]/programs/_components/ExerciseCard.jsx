"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseImage from "./ExerciseImage";

export default function ExerciseCard({ exercise, onSelect }) {
  return (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-accent/10">
      <div className="flex items-center gap-3">
        <ExerciseImage
          id={exercise.id}
          name={exercise.name}
          width={48}
          height={48}
          className="rounded-md"
        />
        <div>
          <p className="font-medium text-sm">{exercise.name}</p>
          <p className="text-xs text-muted-foreground">
            {exercise.primaryMuscles?.join(", ") || "-"}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSelect(exercise)}
        className="h-8 w-8 rounded-full"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

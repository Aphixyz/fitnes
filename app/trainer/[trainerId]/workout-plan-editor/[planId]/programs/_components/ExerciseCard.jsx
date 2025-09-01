"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExerciseImage from "./ExerciseImage";

export default function ExerciseCard({ exercise, onSelectExercise }) {
  return (
    <div className="border rounded-md p-3 hover:bg-accent/5 transition-colors flex items-center gap-3 group">
      {/* Exercise Image */}
      <div className="w-14 h-14 bg-muted rounded-md overflow-hidden flex-shrink-0">
        <ExerciseImage exerciseId={exercise.id} name={exercise.name} />
      </div>

      {/* Exercise Details */}
      <div className="flex-grow">
        <h3 className="font-medium text-sm line-clamp-1">{exercise.name}</h3>
        <div className="text-xs text-muted-foreground">
          {exercise.primaryMuscles?.slice(0, 2).join(", ")}
          {exercise.primaryMuscles?.length > 2 && " และอื่นๆ"}
        </div>
        <div className="text-xs flex flex-wrap mt-1 gap-1">
          {exercise.category && (
            <span className="bg-accent/30 rounded-full px-2 py-0.5 text-xs">
              {exercise.category}
            </span>
          )}
          {exercise.equipment && (
            <span className="bg-accent/30 rounded-full px-2 py-0.5 text-xs">
              {exercise.equipment}
            </span>
          )}
        </div>
      </div>

      {/* Add Button */}
      <Button
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onSelectExercise();
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

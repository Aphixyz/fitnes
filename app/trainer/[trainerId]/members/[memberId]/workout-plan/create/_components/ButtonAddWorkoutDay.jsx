"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ButtonAddWorkoutDay({ onClick }) {
  return (
    <Button
      variant="outline"
      className="w-full py-6 border-dashed border-2 flex items-center justify-center gap-2"
      onClick={onClick}
    >
      <Plus className="h-5 w-5" />
      <span>เพิ่มวันฝึกใหม่</span>
    </Button>
  );
}

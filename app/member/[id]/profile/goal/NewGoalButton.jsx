"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

export default function NewGoalButton({ memberId }) {
  const router = useRouter();

  const handleOpenNewGoalPage = () => {
    router.push(`/member/${memberId}/profile/goal/new`);
  };

  return (
    <Button
      onClick={handleOpenNewGoalPage}
      className="flex items-center gap-2"
      size="sm"
    >
      <Plus className="h-4 w-4" />
      <Target className="h-4 w-4" />
      กำหนดเป้าหมายใหม่
    </Button>
  );
}

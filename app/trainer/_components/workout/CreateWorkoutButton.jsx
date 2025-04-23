"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MemberSelectModal from "@/app/trainer/_components/shared/MemberSelectModal";

export default function CreateWorkoutButton({
  trainerId,
  variant = "default",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> สร้างโปรแกรมใหม่
      </Button>

      <MemberSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainerId={trainerId}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import MemberSelectModal from "@/app/trainer/_components/shared/MemberSelectModal";
import { Button } from "@/components/ui/button";

export default function CreateWorkoutButton({ trainerId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Workout Program
      </Button>

      <MemberSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainerId={trainerId}
      />
    </>
  );
}

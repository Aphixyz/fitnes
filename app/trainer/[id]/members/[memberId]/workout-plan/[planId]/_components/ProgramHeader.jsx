"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgramHeader({ programCount, trainerId, memberId, planId }) {
  const router = useRouter();
  
  const handleAddProgram = () => {
    // นำทางไปยังหน้าสำหรับการเพิ่มโปรแกรมใหม่
    router.push(`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/add-program`);
    // หรือสามารถเปิด Modal สำหรับเพิ่มโปรแกรมได้
  };
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">โปรแกรมทั้งหมด</h2>
        <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full h-7 w-7 text-sm font-medium">
          {programCount}
        </span>
      </div>
      
      <Button onClick={handleAddProgram} size="sm" className="gap-1">
        <Plus className="h-4 w-4" />
        เพิ่มโปรแกรมย่อย
      </Button>
    </div>
  );
}
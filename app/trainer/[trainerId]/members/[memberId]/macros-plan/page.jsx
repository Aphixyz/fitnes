"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import MacroPlanList from "./_components/MacroPlanList";
import CreateMacroPlanSheet from "./_components/CreateMacroPlanSheet";

const MacroPlanManagementPage = () => {
  const params = useParams();
  const { trainerId, memberId } = params;

  // States - เรียบง่ายเหมือน component อื่นๆ
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ===== Event Handlers =====
  const handleCreatePlan = () => {
    setIsCreateModalOpen(true);
  };

  const handlePlanCreated = () => {
    setIsCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "สำเร็จ",
      description: "สร้างแผนโภชนาการใหม่เรียบร้อยแล้ว",
    });
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  // ===== Main Render =====
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Macro Plans List */}
      <MacroPlanList
        key={refreshKey}
        memberId={memberId}
        trainerId={trainerId}
        onCreateClick={handleCreatePlan}
      />

      {/* Create Sheet */}
      <CreateMacroPlanSheet
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handlePlanCreated}
        memberId={memberId}
        trainerId={trainerId}
      />
    </div>
  );
};

export default MacroPlanManagementPage;

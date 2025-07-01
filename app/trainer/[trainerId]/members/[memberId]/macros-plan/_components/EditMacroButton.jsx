"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Target, Settings } from "lucide-react";
import EditMacroTargetsModal from "./EditMacroTargetsModal";

/**
 * ===================================================================
 * EDIT MACRO BUTTON COMPONENT
 * ===================================================================
 *
 * ปุ่มสำหรับเปิด EditMacroTargetsModal
 * รองรับทั้งแบบ button และ icon-only
 */
export default function EditMacroButton({
  memberName,
  currentTargets,
  period = "daily",
  variant = "outline", // "outline" | "ghost" | "secondary"
  size = "sm",
  iconOnly = false,
  className = "",
  onSave,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (newTargets, period) => {
    // TODO: Phase 2 - จะมี server action
    console.log("Saving new targets:", newTargets, "for period:", period);

    if (onSave) {
      onSave(newTargets, period);
    }
  };

  if (iconOnly) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={() => setIsModalOpen(true)}
          className={`p-2 ${className}`}
          title="แก้ไข Macro Targets"
        >
          <Edit3 className="h-4 w-4" />
        </Button>

        <EditMacroTargetsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          memberName={memberName}
          currentTargets={currentTargets}
          period={period}
          onSave={handleSave}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Settings className="h-4 w-4" />
        แก้ไข Targets
      </Button>

      <EditMacroTargetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberName={memberName}
        currentTargets={currentTargets}
        period={period}
        onSave={handleSave}
      />
    </>
  );
}

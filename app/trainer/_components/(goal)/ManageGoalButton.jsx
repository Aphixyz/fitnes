"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import GoalManagementModal from "./GoalManagementModal";

/**
 * ปุ่มจัดการเป้าหมายการออกกำลังกายที่สามารถใช้ซ้ำได้ในส่วนต่างๆ ของแอปพลิเคชัน
 *
 * @param {Object} props
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 * @param {string} props.memberId - รหัสสมาชิก
 * @param {string} props.memberName - ชื่อสมาชิก
 * @param {number} props.currentWeight - น้ำหนักปัจจุบันของสมาชิก
 * @param {string} props.variant - รูปแบบปุ่ม (default, outline, secondary, etc.)
 * @param {string} props.size - ขนาดปุ่ม (default, sm, lg)
 */
export default function ManageGoalButton({
  trainerId,
  memberId,
  memberName,
  currentWeight,
  variant = "default",
  size = "default",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
      >
        <Target className="h-4 w-4 mr-1" />
        จัดการเป้าหมาย
      </Button>

      <GoalManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainerId={trainerId}
        memberId={memberId}
        memberName={memberName}
        currentWeight={currentWeight}
      />
    </>
  );
}

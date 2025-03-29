"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, Dumbbell, Apple, LineChart, Calendar, RotateCcw } from "lucide-react";

/**
 * เมนูการจัดการสมาชิกแบบดรอปดาวน์
 * @param {Object} props
 * @param {Object} props.member - ข้อมูลสมาชิก
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 */
export default function MemberActionMenu({ member, trainerId }) {
  const router = useRouter();
  const isActive = member.registration_status_text === "active";
  const isExpired = member.registration_status_text === "expired";

  // ฟังก์ชันจัดการการคลิกตัวเลือกต่างๆ
  const handleViewDetails = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}`);
  };

  const handleEditWorkout = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/workout`);
  };

  const handleEditNutrition = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/nutrition`);
  };

  const handleViewProgress = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/progress`);
  };

  const handleRenew = () => {
    // สามารถใช้ Modal หรือนำทางไปยังหน้าต่ออายุสมาชิก
    router.push(`/trainer/${trainerId}/members/${member.member_id}/renew`);
  };

  const handleReactivate = () => {
    // สำหรับนำสมาชิกที่หมดอายุกลับมาใช้งานอีกครั้ง
    router.push(`/trainer/${trainerId}/members/${member.member_id}/reactivate`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          จัดการ <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50 bg-white shadow-md">
        {/* แสดงตัวเลือกตามสถานะของสมาชิก */}
        <DropdownMenuItem onClick={handleViewDetails} className="cursor-pointer hover:bg-gray-100">
          <User className="mr-2 h-4 w-4" /> ดูรายละเอียด
        </DropdownMenuItem>

        {/* ตัวเลือกสำหรับสมาชิกที่กำลังใช้งาน */}
        {isActive && (
          <>
            <DropdownMenuItem onClick={handleEditWorkout} className="cursor-pointer hover:bg-gray-100">
              <Dumbbell className="mr-2 h-4 w-4" /> แก้ไขโปรแกรม
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditNutrition} className="cursor-pointer hover:bg-gray-100">
              <Apple className="mr-2 h-4 w-4" /> แก้ไขโภชนาการ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewProgress} className="cursor-pointer hover:bg-gray-100">
              <LineChart className="mr-2 h-4 w-4" /> ติดตามความก้าวหน้า
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRenew} className="cursor-pointer hover:bg-gray-100">
              <Calendar className="mr-2 h-4 w-4" /> ต่ออายุ
            </DropdownMenuItem>
          </>
        )}

        {/* ตัวเลือกสำหรับสมาชิกที่หมดอายุ */}
        {isExpired && (
          <>
            <DropdownMenuItem onClick={handleRenew} className="cursor-pointer hover:bg-gray-100">
              <Calendar className="mr-2 h-4 w-4" /> ต่ออายุ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReactivate} className="cursor-pointer hover:bg-gray-100">
              <RotateCcw className="mr-2 h-4 w-4" /> นำกลับ
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
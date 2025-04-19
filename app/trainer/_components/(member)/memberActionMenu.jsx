"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  User,
  Dumbbell,
  Apple,
  LineChart,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  getActiveWorkoutPlan,
  getActiveNutritionPlan,
} from "@/actions/trainer/(workout)/workoutPlanActions";

export function toast({ title, description, variant = "default" }) {
  return (
    <Toast
      title={title}
      description={description}
      variant={variant}
    />
  );
}

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

  const handleWorkout = async () => {
    try {
      if (!member.member_id) {
        console.error("Member ID is undefined");
        toast.error("ไม่พบข้อมูลสมาชิก");
        return;
      }
      const plan = await getActiveWorkoutPlan(member.member_id);
      if (plan) {
        router.push(`/trainer/${trainerId}/workouts/${plan.workout_plan_id}`);
      } else {
        toast({
          title: "Error",
          description: "ไม่พบข้อมูลสมาชิก",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching active workout plan:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลโปรแกรมการฝึก");
    }
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
        <DropdownMenuItem
          onClick={handleViewDetails}
          className="cursor-pointer hover:bg-gray-100"
        >
          <User className="mr-2 h-4 w-4" /> ดูรายละเอียด
        </DropdownMenuItem>

        {/* ตัวเลือกสำหรับสมาชิกที่กำลังใช้งาน */}
        {isActive && (
          <>
            <DropdownMenuItem
              onClick={handleWorkout}
              className="cursor-pointer hover:bg-gray-100"
            >
              <Dumbbell className="mr-2 h-4 w-4" /> โปรแกรมฝึกออกกำลังกาย
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleEditNutrition}
              className="cursor-pointer hover:bg-gray-100"
            >
              <Apple className="mr-2 h-4 w-4" /> โภชนาการ
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleViewProgress}
              className="cursor-pointer hover:bg-gray-100"
            >
              <LineChart className="mr-2 h-4 w-4" /> ติดตามความก้าวหน้า
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRenew}
              className="cursor-pointer hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-4 w-4" /> ต่ออายุ
            </DropdownMenuItem>
          </>
        )}

        {/* ตัวเลือกสำหรับสมาชิกที่หมดอายุ */}
        {isExpired && (
          <>
            <DropdownMenuItem
              onClick={handleRenew}
              className="cursor-pointer hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-4 w-4" /> ต่ออายุ
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReactivate}
              className="cursor-pointer hover:bg-gray-100"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> นำกลับ
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

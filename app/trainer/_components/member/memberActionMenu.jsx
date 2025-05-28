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
  Trash,
} from "lucide-react";
import {
  getActiveWorkoutPlan,
  getActiveNutritionPlan,
} from "@/schemas/workoutv1/workoutPlanActions";

export function toast({ title, description, variant = "default" }) {
  return <Toast title={title} description={description} variant={variant} />;
}

/**
 * เมนูการจัดการสมาชิกแบบดรอปดาวน์
 * @param {Object} props
 * @param {Object} props.member - ข้อมูลสมาชิก
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 */
export default function MemberActionMenu({ member, trainerId, onMemberChanged }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่พบข้อมูลสมาชิก",
          variant: "destructive",
        });
        return;
      }
      const plan = await getActiveWorkoutPlan(member.member_id);
      if (plan) {
        router.push(`/trainer/${trainerId}/workouts/${plan.workout_plan_id}`);
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่พบข้อมูลสมาชิก",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching active workout plan:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูล پروแกรมการฝึก",
        variant: "destructive",
      });
    }
  };

  const handleEditNutrition = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/nutrition`);
  };

  const handleViewProgress = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/progress`);
  };

  const handleRenew = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/renew`);
  };

  const handleDelete = async () => {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
    return;
  }

  if (!member.registration_id) {
    toast({
      title: "ข้อผิดพลาด",
      description: "ไม่พบ registration_id ของสมาชิก",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    const success = await deleteMember(member.registration_id, trainerId);
    if (success) {
      toast({
        title: "สำเร็จ",
        description: "ลบสมาชิกสำเร็จ",
        variant: "success",
      });
      onMemberChanged?.();
    } else {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    toast({
      title: "ข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการลบสมาชิก",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleReactivate = () => {
    router.push(`/trainer/${trainerId}/members/${member.member_id}/reactivate`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          disabled={isLoading}
        >
          {isLoading ? "กำลังดำเนินการ..." : "จัดการ"}
          {!isLoading && <ChevronDown className="ml-1 h-4 w-4" />}
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
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer  text-red-600 "
            >
              <Trash className="mr-2 h-4 w-4" /> ลบ
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
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer !hover:bg-red-600 text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" /> ลบ
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

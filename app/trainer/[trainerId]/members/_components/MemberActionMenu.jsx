"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Dumbbell, Apple, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteMember } from "@/actions/trainer/member/deleteMember";
import { toast } from "@/components/ui/use-toast";

const MemberActionMenu = ({ member, trainerId, onMemberDeleted }) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // จัดการแผนออกกำลังกาย
  const handleWorkoutPlan = () => {
    router.push(
      `/trainer/${trainerId}/members/${member.member_id}/workout-plan`
    );
  };

  // จัดการโภชนาการ
  const handleNutritionPlan = () => {
    router.push(
      `/trainer/${trainerId}/members/${member.member_id}/nutrition-plan`
    );
  };

  // จัดการลบสมาชิก
  const handleDeleteMember = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMember(trainerId, member.member_id);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
          variant: "default",
        });

        // เรียก callback เพื่ออัปเดตข้อมูลในหน้าหลัก
        if (onMemberDeleted) {
          onMemberDeleted(member.member_id);
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="เมนูจัดการสมาชิก"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleWorkoutPlan}
            className="cursor-pointer"
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            จัดการแผนออกกำลังกาย
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleNutritionPlan}
            className="cursor-pointer"
          >
            <Apple className="mr-2 h-4 w-4" />
            จัดการโภชนาการ
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleDeleteMember(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบลูกค้า
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog ยืนยันการลบ */}
      {/* <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบลูกค้า</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ <strong>{member.full_name}</strong>{" "}
              ออกจากรายชื่อลูกค้าหรือไม่?
              <br />
              <span className="text-red-600 font-medium">
                การดำเนินการนี้จะลบข้อมูลทั้งหมดและไม่สามารถย้อนกลับได้
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบลูกค้า"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
};

export default MemberActionMenu;

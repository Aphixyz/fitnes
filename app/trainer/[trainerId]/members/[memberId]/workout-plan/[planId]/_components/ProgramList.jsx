"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteWorkoutProgram } from "@/actions/trainer/workout/workout_program/deleteWorkoutProgram";
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
import { toast } from "@/components/ui/use-toast";

export default function ProgramList({ programs, trainerId, memberId, planId }) {
  const router = useRouter();

  // ฟังก์ชันเพื่อนำทางไปหน้าแก้ไขโปรแกรม
  const handleProgramClick = (programId) => {
    router.push(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/programs/${programId}`
    );
  };

  // ฟังก์ชันสำหรับการนำทางไปยังหน้าเพิ่มโปรแกรม
  const handleAddProgram = () => {
    router.push(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/add-program`
    );
  };

  if (!programs || programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="mb-4 text-muted-foreground text-center">
          <p className="mb-2">ยังไม่มีโปรแกรมย่อยในแผนนี้</p>
          <p className="text-sm">
            เพิ่มโปรแกรมย่อยเพื่อสร้างแผนการออกกำลังกายแบบเต็มรูปแบบ
          </p>
        </div>
        <Button onClick={handleAddProgram} className="gap-1">
          <Plus className="h-4 w-4" />
          เพิ่มโปรแกรมย่อย
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 mt-4">
      {programs.map((program) => (
        <ProgramCard
          key={program.workout_program_id}
          program={program}
          trainerId={trainerId}
          memberId={memberId}
          planId={planId}
          onClick={() => handleProgramClick(program.workout_program_id)}
        />
      ))}
    </div>
  );
}

function ProgramCard({ program, trainerId, memberId, planId, onClick }) {
  const router = useRouter();
  const programId = program.workout_program_id;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // นำทางไปหน้าแก้ไขโปรแกรม
  const handleEdit = (e) => {
    e.stopPropagation(); // ป้องกันการ trigger onClick ของ card
    router.push(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/programs/${programId}`
    );
  };

  // เปิด dialog ยืนยันการลบ
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // ป้องกันการ trigger onClick ของ card
    setIsDeleteDialogOpen(true);
  };

  // ดำเนินการลบโปรแกรม
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteWorkoutProgram({
        workout_program_id: programId,
      });

      if (result.deleted) {
        toast({
          title: "ลบโปรแกรมสำเร็จ",
          description: `โปรแกรม "${program.program_name}" ถูกลบออกแล้ว`,
          variant: "default",
        });
        // เนื่องจาก server action เรียก revalidatePath อยู่แล้ว
        // เราไม่จำเป็นต้อง refresh หน้าเอง
      } else {
        throw new Error("ไม่สามารถลบโปรแกรมได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบโปรแกรม:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโปรแกรมได้ กรุณาลองอีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/10 transition-colors w-full"
        onClick={onClick}
      >
        <CardHeader className="p-4 flex flex-row justify-between items-start space-y-0">
          <CardTitle className="text-lg font-medium">
            {program.program_name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
              onClick={(e) => e.stopPropagation()} // ป้องกันการ trigger onClick ของ card
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">เมนู</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>แก้ไขโปรแกรม</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()} // ป้องกันการ trigger onClick ของ card
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>ทำสำเนาโปรแกรม</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>ลบโปรแกรม</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {program.exercises && program.exercises.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {program.exercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="flex items-center space-x-2"
                >
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-sm truncate">
                    {exercise.exercise_name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ไม่มีท่าออกกำลังกาย</p>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            จำนวนท่า: {program.exercises?.length || 0} ท่า
          </div>
        </CardContent>
      </Card>

      {/* Dialog ยืนยันการลบ */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโปรแกรม</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโปรแกรม "{program.program_name}" ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
              และท่าออกกำลังกายทั้งหมดในโปรแกรมนี้จะถูกลบไปด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบโปรแกรม"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

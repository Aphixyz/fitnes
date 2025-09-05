"use client";

import { useState } from "react";
import { deleteTrainer } from "@/actions/admin/deleteTrainer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeleteTrainerButton({ trainerId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const Route = useRouter();
  const handleDelete = async () => {
    const success = await deleteTrainer(trainerId);
    setOpen(false);

    if (success) {
      toast.success("✅ ลบผู้ฝึกสอนสำเร็จ");
      onDeleted?.(trainerId);
      Route.push("/admin/trainers");
    } else {
      toast.error("❌ ลบไม่สำเร็จ");
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="p-1 text-red-500 hover:text-red-600 transition-colors"
      >
        🗑️
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              คุณแน่ใจหรือไม่ที่จะลบผู้ฝึกสอนนี้?
            </AlertDialogTitle>
            <p className="text-sm text-gray-500">
              การลบนี้ไม่สามารถย้อนกลับได้
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

// นำเข้าคอมโพเนนต์ Toast จาก shadcn/ui ที่มีอยู่แล้ว
// คอมโพเนนต์นี้เป็น Wrapper เพื่อความสะดวกในการใช้งาน
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

// ฟังก์ชันเพื่อแสดง Toast สำหรับใช้ภายนอกคอมโพเนนต์
export function useWorkoutToast() {
  const { toast } = useToast();

  const showSuccessToast = (
    title = "สำเร็จ",
    description = "ดำเนินการเรียบร้อย"
  ) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showErrorToast = (
    title = "เกิดข้อผิดพลาด",
    description = "กรุณาลองใหม่อีกครั้ง"
  ) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showWarningToast = (title, description, actionLabel, actionFn) => {
    toast({
      title,
      description,
      variant: "default",
      className: "bg-yellow-50 border-yellow-300 text-yellow-900",
      action: actionLabel ? (
        <ToastAction altText={actionLabel} onClick={actionFn}>
          {actionLabel}
        </ToastAction>
      ) : undefined,
    });
  };

  return {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
  };
}

// คอมโพเนนต์ไม่ได้ render อะไรโดยตรง แต่ให้ hook สำหรับใช้งาน
export default function WorkoutToast({ children }) {
  // ในกรณีที่ต้องการใช้งาน Toast ภายในคอมโพเนนต์
  return children;
}

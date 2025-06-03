"use client";

import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AddButton = ({
  type = "button",
  buttonText = "เพิ่มข้อมูล",
  route,
  id, // 👈 เพิ่ม prop สำหรับ id
  isSubmitting = false,
  onClick,
  showIcon = true,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (route) {
      // ถ้ามี id และ route มี [id] ให้แทนที่ [id] ด้วยค่า id
      const fullRoute = id ? route.replace("[id]", id) : route;
      router.push(fullRoute);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      type={type}
      onClick={type === "submit" ? undefined : handleClick}
      disabled={isSubmitting}
      className="group flex items-center justify-center space-x-2 mt-4 ml-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
    >
      {showIcon && (
        <CirclePlus className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
      )}
      <span className="text-sm font-semibold">
        {isSubmitting ? "กำลังบันทึก..." : buttonText}
      </span>
    </Button>
  );
};

export default AddButton;
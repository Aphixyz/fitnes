"use client";

import { CirclePlus, Loader2 } from "lucide-react"; // 👈 เพิ่ม Loader2
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AddButton = ({
  type = "button",
  buttonText = "เพิ่มข้อมูล",
  route,
  id,
  isSubmitting = false,
  onClick,
  showIcon = true,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (route) {
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
      className="group flex items-center justify-center space-x-2 mt-4 ml-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300"
    >
      {isSubmitting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {showIcon && (
            <CirclePlus className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
          )}
          <span className="text-sm font-semibold">{buttonText}</span>
        </>
      )}
    </Button>
  );
};

export default AddButton;

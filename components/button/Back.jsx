"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
  variant="secondary"
  onClick={() => router.back()}
  className="group flex items-center space-x-1"
>
  <Undo2 className="h-5 w-5 transition-all duration-200 group-hover:text-blue-500 group-hover:scale-110" />
  <span className="text-sm text-gray-600 group-hover:text-blue-500 transition-all duration-200">
    ย้อนกลับ
  </span>
</Button>
  );
};

export default BackButton;

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

const BackButton = ({ onClick }) => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={onClick || (() => router.back())}
      className="group flex items-center justify-center space-x-2 mt-4 ml-4 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
    >
      <Undo2 className="h-5 w-5 transition-all duration-300 group-hover:text-white group-hover:scale-110" />
      <span className="text-sm font-semibold text-white group-hover:text-white transition-all duration-300">
        ย้อนกลับ
      </span>
    </Button>
  );
};

export default BackButton;

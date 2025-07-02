"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

const BackButton = ({ onClick, buttonText = "" }) => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={onClick || (() => router.back())}
      className="group inline-flex items-center space-x-2 mt-4 ml-4 bg-white border text-black rounded-lg   hover:bg-gray-200 hover:scale-105  transition-all duration-300 px-4 py-2"
    >
      <span className="flex items-center justify-center">
        <Undo2 className="h-5 w-5 transition-all duration-300 group-hover:bg-gray-200 group-hover:scale-110" />
      </span>
      {buttonText && (
        <span className="text-sm font-semibold text-white group-hover:text-white transition-all duration-300">
          {buttonText}
        </span>
      )}
    </Button>
  );
};

export default BackButton;

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ViewButton = ({
  route = "/admin/packages",
  buttonText = "แพ็คเกจ",
  icon: Icon = null, // เพิ่ม prop icon
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="group flex items-center justify-center space-x-2 mt-4 ml-4 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 hover:scale-105 hover:shadow-lg transition-all duration-300"
    >
      {Icon && <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />}
      <span className="text-sm font-semibold">{buttonText}</span>
    </Button>
  );
};

export default ViewButton;

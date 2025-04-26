import { UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ManageUser = ({ route = "/admin/trainers/manage", buttonText = "จัดการผู้ใช้" }) => {
  const router = useRouter();

  const handleRouteChange = () => {
    router.push(route);
  };

  return (
    <Button
      variant="primary"
      onClick={handleRouteChange}
      className="group flex items-center justify-center space-x-2 mt-4 ml-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 hover:shadow-lg transition-all duration-300"
    >
      <UserPen className="h-5 w-5 transition-all duration-300 group-hover:text-white group-hover:scale-110" />
      <span className="text-sm font-semibold text-white group-hover:text-white transition-all duration-300">
        {buttonText}
      </span>
    </Button>
  );
};

export default ManageUser;

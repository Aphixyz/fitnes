"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Home,
  Calendar,
  Plus,
  TrendingUp,
  User,
  Dumbbell,
  Apple,
  Scale,
  Activity,
} from "lucide-react";
import NutrientLogModal from "@/app/member/[id]/quick-add/nutrient-log/nutrientLogModal";

const MemberBottomNav = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false);

  // ดึง memberId จาก pathname หากไม่มี props
  const getMemberIdFromPath = () => {
    const pathParts = pathname.split("/");
    const memberIdIndex = pathParts.findIndex((part) => part === "member") + 1;
    if (memberIdIndex > 0 && memberIdIndex < pathParts.length) {
      return pathParts[memberIdIndex];
    }
    return "";
  };

  // ใช้ memberId จาก props หรือจาก pathname
  const memberId = getMemberIdFromPath();

  // Navigation items สำหรับ bottom nav
  const navItems = [
    {
      href: `/member/${memberId}/dashboard`,
      icon: Home,
      label: "หน้าหลัก",
      active: pathname === `/member/${memberId}/dashboard`,
    },
    {
      // href: `/member/${memberId}/workout`,
      href: `/member/${memberId}/program`,
      icon: Calendar,
      label: "แผนการ",
      active: pathname === `/member/${memberId}/program`,
    },
    {
      href: "#",
      icon: Plus,
      isQuickAdd: true,
    },
    {
      href: `/member/${memberId}/progress`,
      icon: TrendingUp,
      label: "ความคืบหน้า",
      active: pathname === `/member/${memberId}/progress`,
    },
    {
      href: `/member/${memberId}/profile`,
      icon: User,
      label: "โปรไฟล์",
      active: pathname === `/member/${memberId}/profile`,
    },
  ];

  // Quick actions สำหรับ drawer
  const quickActions = [
    {
      href: `/member/${memberId}/quick-add/workout-log`,
      icon: Dumbbell,
      label: "บันทึกการออกกำลังกาย",
      description: "บันทึกเซสชันการฝึกวันนี้",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      href: `/member/${memberId}/quick-add/nutrient-log`,
      icon: Apple,
      label: "บันทึกโภชนาการ",
      description: "บันทึกแคลอรี่และสารอาหาร",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      href: `/member/${memberId}/quick-add/weight-log`,
      icon: Scale,
      label: "บันทึกน้ำหนัก",
      description: "บันทึกน้ำหนักและสัดส่วน",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      href: `/member/${memberId}/quick-add/metrics-log`,
      icon: Activity,
      label: "บันทึกเมตริก",
      description: "บันทึกการวัดสัดส่วนร่างกาย",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const handleQuickActionClick = (href) => {
    setIsDrawerOpen(false);

    // ถ้าเป็น nutrient log ให้เปิด modal แทนการ navigate
    if (href.includes("nutrient-log")) {
      setIsNutrientModalOpen(true);
      return;
    }

    window.location.href = href;
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            if (item.isQuickAdd) {
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center justify-center h-16 w-16 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  )}
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center h-16 w-16 rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                  item.active
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Actions Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[80vh] bg-gray-50 border-none shadow-none">
          <DrawerTitle className="sr-only">Quick Actions Menu</DrawerTitle>
          <div className="px-4 pb-6 pt-4 space-y-6">
            {/* 2 ปุ่มบน: Log Workout, Log Food */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/workout-log`
                  )
                }
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:shadow-md transition-all"
                aria-label="Log Workout"
                tabIndex={0}
              >
                <Dumbbell className="h-8 w-8 mb-2" />
                <span className="font-semibold text-base">Log Workout</span>
              </button>
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/nutrient-log`
                  )
                }
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:shadow-md transition-all"
                aria-label="Log Food"
                tabIndex={0}
              >
                <Apple className="h-8 w-8 mb-2" />
                <span className="font-semibold text-base">Log Food</span>
              </button>
            </div>
            {/* 2 ปุ่มล่าง: บันทึกน้ำหนัก, บันทึกเมตริก */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/weight-log`
                  )
                }
                className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:shadow-md transition-all"
                aria-label="บันทึกน้ำหนัก"
                tabIndex={0}
              >
                <Scale className="h-6 w-6 mr-3" />
                <span className="font-medium text-base">บันทึกน้ำหนัก</span>
              </button>
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/metrics-log`
                  )
                }
                className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:shadow-md transition-all"
                aria-label="บันทึกเมตริก"
                tabIndex={0}
              >
                <Activity className="h-6 w-6 mr-3" />
                <span className="font-medium text-base">บันทึกเมตริก</span>
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Bottom padding สำหรับ content */}
      <div className="h-20" />

      {/* Nutrient Log Modal */}
      <NutrientLogModal
        isOpen={isNutrientModalOpen}
        onClose={() => setIsNutrientModalOpen(false)}
        memberId={memberId}
      />
    </>
  );
};

export default MemberBottomNav;

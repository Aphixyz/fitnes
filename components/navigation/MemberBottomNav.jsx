"use client";

import { useState, useEffect } from "react";
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
  Zap,
  Sparkles,
} from "lucide-react";
import NutrientLogModal from "@/app/member/[id]/quick-add/nutrient-log/nutrientLogModal";
import WeightLogModal from "@/app/member/[id]/quick-add/weight-log/weightLogModal";
import MetricLogComp from "@/app/member/[id]/quick-add/metrics-log/metricLogComp";

const MemberBottomNav = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

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

    // ถ้าเป็น weight log ให้เปิด modal แทนการ navigate
    if (href.includes("weight-log")) {
      setIsWeightModalOpen(true);
      return;
    }

    // ถ้าเป็น metrics log ให้เปิด modal แทนการ navigate
    if (href.includes("metrics-log")) {
      setIsMetricModalOpen(true);
      return;
    }

    window.location.href = href;
  };

  // ===== Handle Data Change Callback =====
  const handleDataChange = () => {
    // Refresh หน้าปัจจุบันเพื่ออัปเดตข้อมูล
    window.location.reload();
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
                <div key={index} className="relative">
                  <button
                    className={cn(
                      "relative flex items-center justify-center h-16 w-16 rounded-full",
                      "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600",
                      "text-white shadow-lg shadow-emerald-500/25",
                      "hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700",
                      "hover:shadow-xl hover:shadow-emerald-500/40",
                      "hover:scale-110 active:scale-95",
                      "transition-all duration-300 ease-out",
                      "focus:outline-none focus:ring-4 focus:ring-emerald-300/50",
                      "border-2 border-white/20"
                    )}
                    onClick={() => setIsDrawerOpen(true)}
                    type="button"
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 opacity-0 hover:opacity-20 transition-opacity duration-300" />
                    
                    {/* Main icon with sparkle effect */}
                    <div className="relative flex items-center justify-center">
                      <Zap className="h-7 w-7 relative z-10" />
                      <Sparkles className="absolute h-3 w-3 -top-1 -right-1 animate-pulse" />
                    </div>
                  </button>
                  
                  {/* Pulse ring animation */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping pointer-events-none" />
                  <div className="absolute inset-1 rounded-full border border-emerald-300/20 animate-pulse pointer-events-none" />
                </div>
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
        <DrawerContent className="max-h-[85vh] bg-gradient-to-br from-gray-50 to-white border-none shadow-2xl">
          <DrawerTitle className="sr-only">Quick Actions Menu</DrawerTitle>
          

          <div className="px-6 pb-8 pt-6 space-y-6">
            {/* 2 ปุ่มบน: Log Workout, Log Food */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/workout-log`
                  )
                }
                className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border border-blue-100 text-black focus:outline-none focus:ring-4 focus:ring-blue-200/50 hover:shadow-xl hover:scale-105 hover:border-blue-200 transition-all duration-300"
                aria-label="Log Workout"
                tabIndex={0}
              >
                <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-semibold text-base text-gray-900 mb-1">บันทึกออกกำลังกาย</span>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/nutrient-log`
                  )
                }
                className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border border-green-100 text-black focus:outline-none focus:ring-4 focus:ring-green-200/50 hover:shadow-xl hover:scale-105 hover:border-green-200 transition-all duration-300"
                aria-label="Log Food"
                tabIndex={0}
              >
                <div className="p-3 bg-green-50 rounded-full mb-3 group-hover:bg-green-100 transition-colors">
                  <Apple className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-semibold text-base text-gray-900 mb-1">บันทึกโภชนาการ</span>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
            
            {/* 2 ปุ่มล่าง: บันทึกน้ำหนัก, บันทึกเมตริก */}
            <div className="space-y-3">
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/weight-log`
                  )
                }
                className="group w-full flex items-center p-5 bg-white rounded-2xl shadow-md border border-purple-100 text-black focus:outline-none focus:ring-4 focus:ring-purple-200/50 hover:shadow-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300"
                aria-label="บันทึกน้ำหนัก"
                tabIndex={0}
              >
                <div className="p-3 bg-purple-50 rounded-full mr-4 group-hover:bg-purple-100 transition-colors">
                  <Scale className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-base text-gray-900 block">บันทึกน้ำหนัก</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-purple-200 group-hover:border-purple-400 group-hover:bg-purple-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
              
              <button
                onClick={() =>
                  handleQuickActionClick(
                    `/member/${memberId}/quick-add/metrics-log`
                  )
                }
                className="group w-full flex items-center p-5 bg-white rounded-2xl shadow-md border border-orange-100 text-black focus:outline-none focus:ring-4 focus:ring-orange-200/50 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300"
                aria-label="บันทึกเมตริก"
                tabIndex={0}
              >
                <div className="p-3 bg-orange-50 rounded-full mr-4 group-hover:bg-orange-100 transition-colors">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-base text-gray-900 block">บันทึกเมตริก</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-orange-200 group-hover:border-orange-400 group-hover:bg-orange-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
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

      {/* Weight Log Modal */}
      <WeightLogModal
        memberId={memberId}
        open={isWeightModalOpen}
        onOpenChange={setIsWeightModalOpen}
        onDataChange={handleDataChange}
      />

      {/* Metric Log Modal */}
      <MetricLogComp
        memberId={memberId}
        open={isMetricModalOpen}
        onOpenChange={setIsMetricModalOpen}
        onDataChange={handleDataChange}
      />
    </>
  );
};

export default MemberBottomNav;

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Activity, Apple, BarChart3, Heart, Target } from "lucide-react";

const tabs = [
  {
    name: "ภาพรวม",
    href: "/overview",
    icon: User,
    key: "overview",
  },
  {
    name: "แผนออกกำลังกาย",
    href: "/workout-plan",
    icon: Activity,
    key: "workout",
  },
  {
    name: "แผนโภชนาการ",
    href: "/macros-plan",
    icon: Apple,
    key: "macros",
  },
  {
    name: "สถิติ",
    href: "/statistics",
    icon: BarChart3,
    key: "stats",
  },
  {
    name: "ข้อมูลสุขภาพ",
    href: "/health-info",
    icon: Heart,
    key: "health",
  },
  {
    name: "เป้าหมาย",
    href: "/goals",
    icon: Target,
    key: "goals",
  },
];

export default function MemberTabs({ trainerId, memberId }) {
  const pathname = usePathname();

  // สร้าง base path
  const basePath = `/trainer/${trainerId}/members/${memberId}`;

  // หา active tab
  const getActiveTab = () => {
    if (pathname.includes("/overview")) return "overview";
    if (pathname.includes("/workout-plan")) return "workout";
    if (pathname.includes("/macros-plan")) return "macros";
    if (pathname.includes("/statistics")) return "stats";
    if (pathname.includes("/health-info")) return "health";
    if (pathname.includes("/goals")) return "goals";

    return "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={`${basePath}${tab.href}`}
              className={cn(
                "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <Icon
                className={cn(
                  "mr-2 h-5 w-5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-gray-500"
                )}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

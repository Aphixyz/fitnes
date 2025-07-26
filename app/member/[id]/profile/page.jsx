import React from "react";
import Link from "next/link";
import {
  User,
  Ruler,
  Target,
  Dumbbell,
  Apple,
  Package,
  Users,
  ChevronRight,
  Settings,
} from "lucide-react";

import { isActiveSubscription } from "@/actions/member/isActiveSubscription.js";
import { getMemberById } from "@/actions/member/getMemberData.js";

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ตรวจสอบ subscription ที่ active และดึงช่วงเวลา
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionCheck.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">คุณยังไม่มีสิทธิ์ใช้งานระบบ</p>
          </div>
        </div>
      </div>
    );
  }

  // ดึงข้อมูลสมาชิก
  const memberData = await getMemberById(memberId);

  const menuItems = [
    {
      id: "personal",
      title: "ข้อมูลส่วนตัว",
      icon: User,
      route: `/member/${id}/profile/personalprofile`,
    },
    {
      id: "metrics",
      title: "ข้อมูลร่างกาย",
      icon: Ruler,
      route: `/member/${id}/profile/measures`,
    },
    {
      id: "goal",
      title: "เป้าหมาย",
      icon: Target,
      route: `/member/${id}/profile/goal`,
    },
    {
      id: "workout",
      title: "การออกกำลังกาย",
      icon: Dumbbell,
      route: `/member/${id}/profile/workout`,
    },
    {
      id: "nutrition",
      title: "โภชนาการ",
      icon: Apple,
      route: `/member/${id}/profile/macronutrient`,
    },
    {
      id: "package",
      title: "แพ็คเกจ",
      icon: Package,
      route: `/member/${id}/profile/package`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                {/* <span className="text-white text-xl font-semibold">
                  {memberData.name.charAt(0)}
                </span> */}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {memberData.name}
              </h1>
              <p className="text-sm text-gray-600">{memberData.email}</p>
              <p className="text-xs text-gray-500">
                สมาชิกตั้งแต่{" "}
                {new Date(memberData.memberSince).toLocaleDateString("th-TH")}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Menu List Section - Stack List Style */}
      <div className="px-4">
        <div className="divide-y divide-gray-200">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={item.route}
                className="flex items-center py-4 px-0 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Icon */}
                <div className="w-10 h-10 flex items-center justify-center mr-4">
                  <IconComponent size={24} className="text-gray-700" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-base">
                    {item.title}
                  </h3>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

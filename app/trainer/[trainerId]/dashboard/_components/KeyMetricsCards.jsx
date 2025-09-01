"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import MemberListModal from "./MemberListModal";

/**
 * Key Metrics Cards - แสดงสถิติหลักของเทรนเนอร์ (3 cards เท่านั้น)
 */
export default function KeyMetricsCards({ keyMetrics, trainerId }) {
  const [selectedModal, setSelectedModal] = useState(null);

  const metricsData = [
    {
      id: "total",
      title: "ลูกค้าทั้งหมด",
      value: keyMetrics.totalMembers,
      change: "สมาชิกทั้งหมดที่ลงทะเบียน",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      activityType: "all",
      modalTitle: "รายชื่อลูกค้าทั้งหมด",
    },
    {
      id: "active",
      title: "ลูกค้าที่ใช้งานอยู่ 7 วันล่าสุด",
      value: keyMetrics.activeMembers7Days,
      change: "มีกิจกรรมใน 7 วันที่ผ่านมา",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      activityType: "active_7days",
      modalTitle: "ลูกค้าที่ใช้งานอยู่ 7 วันล่าสุด",
    },
    {
      id: "inactive",
      title: "ลูกค้าที่ไม่ได้ใช้งาน 7 วันล่าสุด",
      value: keyMetrics.inactiveMembers7Days,
      change: "ไม่มีกิจกรรมใน 7 วันที่ผ่านมา",
      icon: UserX,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      activityType: "inactive_7days",
      modalTitle: "ลูกค้าที่ไม่ได้ใช้งาน 7 วันล่าสุด",
    },
  ];

  const openModal = (metric) => {
    setSelectedModal(metric);
  };

  const closeModal = () => {
    setSelectedModal(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricsData.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card
              key={metric.id}
              className="transition-all hover:shadow-sm cursor-pointer border border-gray-200 bg-white hover:bg-gray-50"
              onClick={() => openModal(metric)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 mb-1 flex gap-1">
                      {metric.title}
                      <div className="flex items-end gap-1">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 ">
                      {metric.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Member List Modal */}
      {selectedModal && (
        <MemberListModal
          isOpen={!!selectedModal}
          onClose={closeModal}
          trainerId={trainerId}
          activityType={selectedModal.activityType}
          title={selectedModal.modalTitle}
        />
      )}
    </>
  );
}

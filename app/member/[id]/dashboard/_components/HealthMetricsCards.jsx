"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  Zap, 
  ChevronRight,
  Ruler,
  Circle,
  Target,
  Dumbbell
} from "lucide-react";
import Link from "next/link";

/**
 * HealthMetricsCards Component - แสดงข้อมูลสุขภาพต่างๆ
 * @param {Object} healthData - ข้อมูลสุขภาพจาก member_health table
 * @param {number} memberId - รหัสสมาชิก
 */
export default function HealthMetricsCards({ healthData, memberId }) {
  if (!healthData?.success || !healthData?.data) {
    return (
      <div className="space-y-3">
        <Card className="w-full min-h-[80px]">
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-500 text-sm">ยังไม่มีข้อมูลสุขภาพ</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href={`/member/${memberId}/health`}>
                  เพิ่มข้อมูลสุขภาพ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthMetrics = healthData.data;

  // ฟังก์ชันจัดรูปแบบวันที่เป็นภาษาไทยแบบย่อ
  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    
    return `${month} ${day}`;
  };

  // ข้อมูลการ์ดสุขภาพ - แต่ละ metric มีค่าและวันที่แยกกัน
  const healthCards = [
    {
      id: 'bodyweight',
      title: 'น้ำหนักตัว',
      value: healthMetrics.member_health_weight,
      unit: 'กก.',
      icon: Scale,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
      date: healthMetrics.member_health_weight_date
    },
    {
      id: 'bodyfat',
      title: 'ไขมันตัว',
      value: healthMetrics.member_health_bodyfat,
      unit: '%',
      icon: Zap,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      date: healthMetrics.member_health_bodyfat_date
    },
    {
      id: 'chest',
      title: 'รอบอก',
      value: healthMetrics.member_health_chest,
      unit: 'ซม.',
      icon: Circle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      date: healthMetrics.member_health_chest_date
    },
    {
      id: 'waist',
      title: 'รอบเอว',
      value: healthMetrics.member_health_waist,
      unit: 'ซม.',
      icon: Target,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      date: healthMetrics.member_health_waist_date
    },
    {
      id: 'hip',
      title: 'รอบสะโพก',
      value: healthMetrics.member_health_hip,
      unit: 'ซม.',
      icon: Circle,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      date: healthMetrics.member_health_hip_date
    },
    {
      id: 'arm',
      title: 'รอบแขน',
      value: healthMetrics.member_health_arm,
      unit: 'ซม.',
      icon: Dumbbell,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      date: healthMetrics.member_health_arm_date
    },
    {
      id: 'thigh',
      title: 'รอบขา',
      value: healthMetrics.member_health_thigh,
      unit: 'ซม.',
      icon: Ruler,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      date: healthMetrics.member_health_thigh_date
    }
  ];

  // แสดงการ์ดทั้งหมด ไม่กรองข้อมูล
  const allCards = healthCards;

  return (
    <div className="space-y-3">
      {allCards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <Card 
            key={card.id}
            className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                
                {/* Left Side - Icon and Content */}
                <div className="flex items-center space-x-4 flex-1">
                  {/* Health Metric Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Metric Info */}
                  <div className="flex-1 min-w-0">
                    {/* Metric Title */}
                    <h3 className="text-base md:text-lg font-medium text-gray-500 mb-1">
                      {card.title}
                    </h3>
                    
                    {/* Metric Value */}
                    <p className="text-base md:text-base font-bold text-gray-900">
                      {card.value !== null && card.value !== undefined ? 
                        `${Math.round(card.value)} ${card.unit}` : 
                        <span className="text-sm text-gray-400">ไม่มีข้อมูล</span>
                      }
                    </p>
                  </div>
                </div>

                {/* Right Side - Date and Arrow */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {/* Date */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">
                      {card.date ? formatThaiDate(card.date) : '-'}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
    </div>
  );
}
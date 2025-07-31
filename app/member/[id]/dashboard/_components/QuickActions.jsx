"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  UtensilsCrossed, 
  Dumbbell, 
  Camera, 
  TrendingUp, 
  MessageCircle,
  FileText,
  Target
} from "lucide-react";
import Link from "next/link";

/**
 * QuickActions Component - การดำเนินการด่วนสำหรับสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 */
export default function QuickActions({ memberId }) {
  const quickActions = [
    {
      id: 'progress-photo',
      title: 'ถ่ายรูปความก้าวหน้า',
      description: 'บันทึกภาพก่อน-หลัง',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      href: `/member/${memberId}/profile/measures/photos`
    },
    {
      id: 'view-progress',
      title: 'ดูความก้าวหน้า',
      description: 'ดูกราฟและสถิติต่างๆ',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-indigo-50 hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: `/member/${memberId}/progress`
    },
    {
      id: 'update-goal',
      title: 'ปรับเป้าหมาย',
      description: '',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-yellow-50 hover:bg-yellow-100',
      iconColor: 'text-yellow-600',
      href: `/member/${memberId}/profile/goal`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>การดำเนินการด่วน</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto p-4 ${action.color} border-0 flex flex-col items-center text-center space-y-2 transition-all duration-200 hover:scale-105 hover:shadow-md group`}
              asChild
            >
              <Link href={action.href}>
                <div className={`${action.iconColor} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 leading-tight">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
        
      </CardContent>
    </Card>
  );
}
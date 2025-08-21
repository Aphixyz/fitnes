"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Activity, Apple, Clock } from "lucide-react";
import Link from "next/link";

/**
 * Recent Activity Feed - กิจกรรมล่าสุด
 */
export default function RecentActivity({ recentActivity, trainerId }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'workout':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'nutrition':
        return <Apple className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-50 border-blue-200';
      case 'workout':
        return 'bg-green-50 border-green-200';
      case 'nutrition':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityBadgeVariant = (type) => {
    switch (type) {
      case 'registration':
        return 'default';
      case 'workout':
        return 'secondary';
      case 'nutrition':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatActivitySentence = (activity) => {
    switch (activity.type) {
      case 'registration':
        return `ได้สมัครแพ็คเกจ ${activity.packageName || 'ใหม่'}`;
      case 'workout':
        return `ได้บันทึกการออกกำลังกาย ${activity.workoutName || 'โปรแกรมใหม่'}`;
      case 'nutrition':
        return `ได้บันทึกข้อมูลโภชนาการ ${activity.nutritionName || 'รายการใหม่'}`;
      default:
        return activity.description || 'มีกิจกรรมใหม่';
    }
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          กิจกรรมล่าสุด
        </CardTitle>
        <CardDescription>
          กิจกรรมของสมาชิกในระยะเวลาที่ผ่านมา
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มีกิจกรรมล่าสุด</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={activity.memberName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(activity.memberName)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/trainer/${trainerId}/members/${activity.memberId}/dashboard`}
                      className="font-medium text-sm hover:underline"
                    >
                      {activity.memberName} {formatActivitySentence(activity)}
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timeAgo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
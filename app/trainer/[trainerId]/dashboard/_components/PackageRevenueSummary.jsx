"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import Link from "next/link";

/**
 * Active Members Packages - รายการสมาชิกที่ใช้แพ็คเกจอยู่ปัจจุบัน
 */
export default function PackageRevenueSummary({ trainerId, activeMembersPackages }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          สมาชิกที่ใช้แพ็คเกจ
        </CardTitle>
        <CardDescription>
          รายการสมาชิกที่ใช้แพ็คเกจอยู่ปัจจุบัน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activeMembersPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีสมาชิกที่ใช้แพ็คเกจ</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activeMembersPackages.map((member, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={member.memberName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.memberName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Member Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/trainer/${trainerId}/members/${member.memberId}/overview`}
                        className="font-medium text-sm hover:underline text-blue-700"
                      >
                        {member.memberName} กำลังใช้แพ็คเกจ {member.packageName}
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      หมดอายุ: {formatDate(member.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
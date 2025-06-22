"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/utils";
import { FileText, Activity } from "lucide-react";

export default function MemberProfileHeader({
  memberData,
  healthData,
  goalData,
  trainerId,
  memberId,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          {memberData?.member_profileimage ? (
            <AvatarImage
              src={memberData.member_profileimage}
              alt={`${memberData.member_firstname} ${memberData.member_lastname}`}
            />
          ) : (
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl">
              {memberData?.member_firstname?.charAt(0)}
              {memberData?.member_lastname?.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {`${memberData?.member_firstname} ${memberData?.member_lastname}`}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge
              className={
                memberData?.is_expired ? "bg-red-500" : "bg-green-500"
              }
            >
              {memberData?.is_expired ? "หมดอายุ" : "ใช้งาน"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              สมาชิกถึงวันที่: {formatDate(memberData?.registration_enddate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
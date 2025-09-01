"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MemberProfileHeader({
  memberData,

}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={memberData?.member_profileimage ? `/uploads/${memberData.member_profileimage}` : undefined}
            alt={`${memberData?.member_firstname || ''} ${memberData?.member_lastname || ''}`}
          />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">
            {memberData?.member_firstname?.charAt(0)?.toUpperCase() || ''}
            {memberData?.member_lastname?.charAt(0)?.toUpperCase() || ''}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {`${memberData?.member_firstname} ${memberData?.member_lastname}`}
          </h1>
        </div>
      </div>
    </div>
  );
}
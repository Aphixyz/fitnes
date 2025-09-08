"use client";

import MemberAvatar from "@/components/ui/MemberAvatar";

export default function MemberProfileHeader({ memberData }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <MemberAvatar
          firstname={memberData?.member_firstname}
          lastname={memberData?.member_lastname}
          profileImage={memberData?.member_profileimage}
          size="xl"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {`${memberData?.member_firstname} ${memberData?.member_lastname}`}
          </h1>
        </div>
      </div>
    </div>
  );
}

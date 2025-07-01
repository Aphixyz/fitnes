import React from "react";
import { fetchHealthMemberData } from "@/actions/trainer/member/fetchHealthMemberData";
import MemberHealthCard from "@/app/trainer/[trainerId]/members/[memberId]/health-info/_components/MemberHealthCard";

const HealthInfoPage = async ({ params }) => {
  // ดึงข้อมูลสุขภาพของ member
  const { memberId } = await params;
  const result = await fetchHealthMemberData(memberId);

  if (!result.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MemberHealthCard healthData={result.data} />
    </div>
  );
};

export default HealthInfoPage;

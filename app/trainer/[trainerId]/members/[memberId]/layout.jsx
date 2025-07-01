import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import {
  getMemberHealth,
  getMemberHealthHistory,
} from "@/actions/member/healthActions";
import {
  getActiveMemberGoal,
  getMemberGoalHistory,
} from "@/actions/member/goalActions";
import MemberProfileHeader from "./_components/MemberProfileHeader";
import MemberTabs from "./_components/MemberTabs";
import { notFound } from "next/navigation";

export default async function MemberLayout({
  children,
  overview,
  workout,
  nutrition,
  stats,
  health,
  params,
}) {
  const { trainerId, memberId } = await params;

  // ดึงข้อมูลสมาชิก
  const memberDetailsResult = await getMemberDetails(trainerId, memberId);

  if (!memberDetailsResult.success) {
    notFound();
  }

  const memberData = memberDetailsResult.member;

  // ดึงข้อมูลเพิ่มเติมสำหรับ header
  const [healthData, goalData] = await Promise.all([
    getMemberHealth(memberId),
    getActiveMemberGoal(memberId),
  ]);

  return (
    <div className="space-y-6">
      {/* Member Profile Header */}
      <MemberProfileHeader
        memberData={memberData}
        healthData={healthData}
        goalData={goalData}
        trainerId={trainerId}
        memberId={memberId}
      />

      {/* Navigation Tabs */}
      <MemberTabs trainerId={trainerId} memberId={memberId} />

      {/* Content Area - Parallel Routes */}
      <div className="mt-6">
        {overview}
        {workout}
        {nutrition}
        {stats}
        {health}
        {children}
      </div>
    </div>
  );
}
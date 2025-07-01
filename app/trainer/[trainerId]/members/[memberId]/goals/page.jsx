import { Suspense } from "react";
import { getMemberGoals } from "@/actions/trainer/goal/getMemberGoals";
import MemberGoalsView from "@/app/trainer/[trainerId]/members/[memberId]/goals/_components/MemberGoalsView";
import BackButton from "@/components/button/Back";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// ===== Loading Component =====
const GoalsLoading = () => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600">กำลังโหลดข้อมูลเป้าหมาย...</p>
    </CardContent>
  </Card>
);

// ===== Error Component =====
const GoalsError = ({ error }) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          เกิดข้อผิดพลาด
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    </CardContent>
  </Card>
);

// ===== Main Page Component =====
const MemberGoalsPage = async ({ params }) => {
  const { trainerId, memberId } = params;

  // ตรวจสอบ params
  if (!trainerId || !memberId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <GoalsError error="ไม่พบรหัสเทรนเนอร์หรือรหัสสมาชิก" />
      </div>
    );
  }

  try {
    // เรียกใช้ Server Action เพื่อดึงข้อมูลเป้าหมาย
    const result = await getMemberGoals(trainerId, memberId);

    return (
      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Content Section */}
        {result.success ? (
          <MemberGoalsView goalData={result.data} memberName="สมาชิก" />
        ) : (
          <GoalsError error={result.error || "เกิดข้อผิดพลาดในการดึงข้อมูล"} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in MemberGoalsPage:", error);

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              เป้าหมายการออกกำลังกาย
            </h1>
          </div>
        </div>

        <GoalsError error="เกิดข้อผิดพลาดในการโหลดหน้า" />
      </div>
    );
  }
};

// ===== Wrapped Component with Suspense =====
const MemberGoalsPageWithSuspense = (props) => (
  <Suspense
    fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              เป้าหมายการออกกำลังกาย
            </h1>
          </div>
        </div>
        <GoalsLoading />
      </div>
    }
  >
    <MemberGoalsPage {...props} />
  </Suspense>
);

export default MemberGoalsPageWithSuspense;

import React from "react";
import { fetchMemberPersonalInfo } from "@/actions/trainer/member/fetchMemberPersonalInfo";
import MemberPersonalInfoCard from "@/app/trainer/[trainerId]/members/[memberId]/personal-info/_components/MemberPersonalInfoCard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// ===== Error Component =====
const PersonalInfoError = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed">{error}</p>
          <p className="text-sm text-slate-500">
            กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ===== Main Page Component =====
const PersonalInfoPage = async ({ params }) => {
  const { trainerId, memberId } = await params;

  // ตรวจสอบ params
  if (!trainerId || !memberId) {
    return (
      <PersonalInfoError error="ไม่พบรหัสเทรนเนอร์หรือรหัสสมาชิก" />
    );
  }

  try {
    // เรียกใช้ Server Action เพื่อดึงข้อมูลส่วนตัว
    const result = await fetchMemberPersonalInfo(memberId);

    return (
      <>
        {/* Content Section */}
        {result.success ? (
          <MemberPersonalInfoCard personalData={result.data} />
        ) : (
          <PersonalInfoError error={result.error || "เกิดข้อผิดพลาดในการดึงข้อมูล"} />
        )}
      </>
    );
  } catch (error) {
    console.error("Error in PersonalInfoPage:", error);

    return (
      <PersonalInfoError error="เกิดข้อผิดพลาดในการโหลดหน้า" />
    );
  }
};

export default PersonalInfoPage;

// Export metadata for better SEO and page information
export const metadata = {
  title: "ข้อมูลส่วนตัวสมาชิก - FitTrack",
  description: "ดูข้อมูลส่วนตัว สุขภาพ และเป้าหมายของสมาชิก",
};
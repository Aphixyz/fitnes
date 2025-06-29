import React, { Suspense } from "react";
import { fetchProgress } from "@/actions/member/progression/fetchProgress";
import ProgressDashboard from "./_components/ProgressDashboard";
import ProgressSkeleton from "./_components/shared/ProgressSkeleton";
import ErrorBoundary from "./_components/shared/ErrorBoundary";

const ProgressPage = async ({ params }) => {
  const { id: memberId } = params;

  // ดึงข้อมูลเริ่มต้นด้วย period WEEK
  const defaultPeriod = "WEEK";
  const progressResult = await fetchProgress(parseInt(memberId), defaultPeriod);

  // Handle server-side errors
  if (!progressResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            ⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
          <p className="text-red-500 text-sm">
            {progressResult.message || "ไม่สามารถดึงข้อมูล Progress ได้"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            📊 ความก้าวหน้าการออกกำลังกาย
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามผลการออกกำลังกายและดูพัฒนาการของคุณ
          </p>
        </div>
      </div>

      {/* Main Progress Dashboard */}
      <ErrorBoundary>
        <Suspense fallback={<ProgressSkeleton />}>
          <ProgressDashboard
            memberId={parseInt(memberId)}
            initialData={progressResult.data}
            initialPeriod={defaultPeriod}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default ProgressPage;

import { Suspense } from "react";
import MemberActivitiesTimeline from "./_components/MemberActivitiesTimeline";
import ActiveWorkoutPlan from "./_components/ActiveWorkoutPlan";
import MemberStats from "./_components/MemberStats";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading component for the timeline
 */
function TimelineLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading component for the right column
 */
function RightColumnLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

/**
 * Member Dashboard Page - แสดง timeline กิจกรรมของสมาชิกสำหรับเทรนเนอร์
 * 
 * @param {Object} params - พารามิเตอร์จาก URL
 * @param {string} params.trainerId - รหัสเทรนเนอร์
 * @param {string} params.memberId - รหัสสมาชิก
 */
export default async function MemberDashboardPage({ params }) {
    const { trainerId, memberId } = await params;

  // ตัวเลือกการแสดงข้อมูล
  const timelineOptions = {
    days: 30, // แสดงข้อมูล 30 วันย้อนหลัง
    activityTypes: ['all'], // แสดงกิจกรรมทุกประเภท
    limit: 100 // จำกัดจำนวนรายการไม่เกิน 100
  };

  return (
    <div className="container mx-auto py-6">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Activities Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              กิจกรรมล่าสุด
            </h2>
          </div>
          
          <Suspense fallback={<TimelineLoading />}>
            <MemberActivitiesTimeline
              trainerId={trainerId}
              memberId={memberId}
              options={timelineOptions}
              useMockData={false}
            />
          </Suspense>
        </div>

        {/* Right Column - Workout Plan and Other Info */}
        <div className="space-y-6">
          {/* Active Workout Plan */}
          <Suspense fallback={<RightColumnLoading />}>
            <ActiveWorkoutPlan
              trainerId={trainerId}
              memberId={memberId}
            />
          </Suspense>
          
          {/* Member Stats */}
          <Suspense fallback={<RightColumnLoading />}>
            <MemberStats
              memberId={memberId}
            />
          </Suspense>
          
          {/* Placeholder for additional components */}
          {/* <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  พื้นที่สำหรับคอมโพเนนต์เพิ่มเติม
                </h3>
                <p className="text-sm text-gray-500">
                  คอมโพเนนต์อื่นๆ จะถูกเพิ่มที่นี่ในอนาคต
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
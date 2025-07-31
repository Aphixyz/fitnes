import {
  getDashboardData,
  getDashboardStats,
  getTodaysPlans,
  getProgressOverview,
  getTodaysNutrition,
  getWorkoutMotivationData,
} from "@/actions/member/dashboard/dashboard";
import { getOnboardingStatus } from "@/actions/member/onboarding/onboarding";
import OnboardingWizard from "../onboarding/_components/OnboardingWizard";
import QuickActions from "./_components/QuickActions";
import DailyNutritionDisplay from "./_components/DailyNutritionDisplay";
import WorkoutMotivationDisplay from "./_components/WorkoutMotivationDisplay";
import ProgressOverview from "./_components/ProgressOverview";
import TodaysFocus from "./_components/TodaysFocus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Dashboard Page สำหรับสมาชิก
 * @param {Object} params - URL parameters
 */
export default async function DashboardPage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ตรวจสอบ member ID
  if (!memberId || isNaN(memberId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            รหัสสมาชิกไม่ถูกต้อง กรุณาตรวจสอบ URL
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    // ตรวจสอบสถานะ onboarding ก่อน
    const onboardingStatus = await getOnboardingStatus(memberId);

    // ถ้ายังไม่ทำ onboarding ให้แสดง OnboardingWizard
    if (onboardingStatus.success && !onboardingStatus.completed_onboarding) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ยินดีต้อนรับสู่ FitTrack! 🎉
              </h1>
              <p className="text-gray-600">
                เริ่มต้นการเดินทางสู่สุขภาพที่ดีกับเรา
              </p>
            </div>

            <OnboardingWizard
              memberId={memberId}
              onboardingStatus={onboardingStatus}
            />
          </div>
        </div>
      );
    }

    // ดึงข้อมูล dashboard
    const [dashboardData, statsData, todaysData, progressData, nutritionData, workoutData] = await Promise.all([
      getDashboardData(memberId),
      getDashboardStats(memberId),
      getTodaysPlans(memberId),
      getProgressOverview(memberId),
      getTodaysNutrition(memberId),
      getWorkoutMotivationData(memberId),
    ]);

    // ตรวจสอบข้อผิดพลาด
    if (!dashboardData.success) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{dashboardData.message}</AlertDescription>
          </Alert>

          {/* แสดงปุ่มสำหรับการแก้ไข */}
          <Card className="mt-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">
                ต้องการความช่วยเหลือ?
              </h3>
              <div className="space-y-3">
                <div>
                  <Button asChild variant="outline">
                    <Link href={`/member/${memberId}/onboarding`}>
                      ทำ Onboarding ใหม่
                    </Link>
                  </Button>
                </div>
                <div>
                  <Button asChild variant="outline">
                    <Link href={`/member/${memberId}/profile`}>
                      อัพเดทข้อมูลส่วนตัว
                    </Link>
                  </Button>
                </div>
                <div>
                  <Button asChild variant="outline">
                    <Link href="/contact">ติดต่อเทรนเนอร์</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }


    // แสดง Dashboard
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              สวัสดี, {dashboardData.data?.member?.name || 'สมาชิก'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('th-TH', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          
          {/* Swipeable Cards Section - Only Nutrition & Workout */}
          <div className="space-y-4">
            
            {/* Horizontal Scroll Container - Only 2 Cards */}
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {/* Daily Nutrition Card */}
                <div className="w-[320px] md:w-[360px] lg:w-[380px] h-[450px] md:h-[480px] lg:h-[500px] flex-shrink-0 snap-start">
                  <DailyNutritionDisplay nutritionData={nutritionData} memberId={memberId} />
                </div>
                
                {/* Workout Motivation Card */}
                <div className="w-[320px] md:w-[360px] lg:w-[380px] h-[450px] md:h-[480px] lg:h-[500px] flex-shrink-0 snap-start">
                  <WorkoutMotivationDisplay workoutData={workoutData} memberId={memberId} />
                </div>
                
                {/* Spacer for better end scrolling */}
                <div className="min-w-[16px] flex-shrink-0"></div>
              </div>
              
              {/* Scroll Indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <QuickActions memberId={memberId} />

        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดหน้า Dashboard กรุณาลองใหม่อีกครั้ง
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">
              ลองแก้ไขปัญหาด้วยวิธีต่อไปนี้:
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• รีเฟรชหน้าเว็บ</p>
              <p>• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
              <p>• ติดต่อทีมสนับสนุนหากปัญหายังคงอยู่</p>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                รีเฟรชหน้า
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

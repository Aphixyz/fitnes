import {
  getDashboardData,
  getDashboardStats,
  getTodaysPlans,
  getProgressOverview,
  getTodaysNutrition,
  getWorkoutMotivationData,
} from "@/actions/member/dashboard/dashboard";
import { fetchWorkoutProgramsForDashboard } from "@/actions/member/dashboard/fetchWorkoutPrograms";
import { fetchLatestHealthMetrics } from "@/actions/member/dashboard/fetchHealthMetrics";
import { fetchLatestProgressPhotos } from "@/actions/member/dashboard/fetchProgressPhotos";
import { getOnboardingStatus } from "@/actions/member/onboarding/onboarding";
import OnboardingWizard from "../onboarding/_components/OnboardingWizard";
import DailyNutritionDisplay from "./_components/DailyNutritionDisplay";
import WorkoutProgramCard from "./_components/WorkoutProgramCard";
import HealthMetricsCards from "./_components/HealthMetricsCards";
import ProgressPhotoCard from "./_components/ProgressPhotoCard";
import DashboardHeaderWrapper from "./_components/DashboardHeaderWrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateToLocalString } from "@/utils/dateUtils";
import Link from "next/link";

/**
 * Dashboard Page สำหรับสมาชิก
 * @param {Object} params - URL parameters
 */
export default async function DashboardPage({ params, searchParams }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // Get date from search params or default to today
  const searchParamsResolved = await searchParams;
  const dateParam = searchParamsResolved?.date;
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

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

    // ดึงข้อมูล dashboard สำหรับวันที่ที่เลือก โดยใช้ local timezone
    const dateString = formatDateToLocalString(selectedDate);
    const [
      dashboardData,
      statsData,
      todaysData,
      progressData,
      nutritionData,
      workoutData,
      workoutProgramsData,
      healthMetricsData,
      progressPhotosData,
    ] = await Promise.all([
      getDashboardData(memberId),
      getDashboardStats(memberId),
      getTodaysPlans(memberId, dateString),
      getProgressOverview(memberId),
      getTodaysNutrition(memberId, dateString),
      getWorkoutMotivationData(memberId, dateString),
      fetchWorkoutProgramsForDashboard(memberId),
      fetchLatestHealthMetrics(memberId),
      fetchLatestProgressPhotos(memberId),
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
      <div className="min-h-full bg-gray-50">
        {/* Sticky Header with Date Navigation */}
        <DashboardHeaderWrapper
          memberData={dashboardData.data?.member}
          memberId={memberId}
          initialDate={selectedDate}
        />

        <div className="px-4 py-4 space-y-4">
          {/* Responsive Cards Grid - Mobile First */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/*โภชนาการรายวัน*/}
            <div className="pt-2 w-full">
              <div className="text-xl font-semibold text-gray-900">
                โภชนาการรายวัน
              </div>
            </div>

            {/* Daily Nutrition Card */}
            <div className="w-full">
              <DailyNutritionDisplay
                nutritionData={nutritionData}
                memberId={memberId}
              />
            </div>

            {/*โปรแกรมฝึก*/}
            <div className="pt-2 w-full">
              <div className="text-xl font-semibold text-gray-900">
                โปรแกรมฝึก
              </div>
            </div>

            {/* Workout Program Card */}
            <div className="w-full">
              <WorkoutProgramCard
                workoutProgramData={workoutProgramsData}
                memberId={memberId}
              />
            </div>

            {/*สถิติของฉัน*/}
            <div className="pt-2 w-full">
              <div className="text-xl font-semibold text-gray-900">
                สถิติของฉัน
              </div>
            </div>

            {/* Health Metrics Cards */}
            <div className="w-full">
              <HealthMetricsCards healthData={healthMetricsData} memberId={memberId} />
            </div>

            {/*ภาพความก้าวหน้า*/}
            <div className="pt-2 w-full">
              <div className="text-xl font-semibold text-gray-900">
                ภาพความก้าวหน้า
              </div>
            </div>

            {/* Progress Photo Card */}
            <div className="w-full">
              <ProgressPhotoCard photoData={progressPhotosData} memberId={memberId} />
            </div>

          </div>
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

import { getTrainerById } from "@/actions/trainer/getTrainerData";
import { getDashboardData } from "@/actions/trainer/dashboard/getDashboardData";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";
import { notFound } from "next/navigation";

// Dashboard Components
import KeyMetricsCards from "./_components/KeyMetricsCards";
import RecentActivity from "./_components/RecentActivity";
import PackageRevenueSummary from "./_components/PackageRevenueSummary";

/**
 * Enhanced Trainer Dashboard with Real Data Visualization
 */
export default async function TrainerDashboardPage({ params }) {
  const { trainerId } = await params;

  try {
    // ดึงข้อมูลเทรนเนอร์และข้อมูล dashboard พร้อมกัน
    const [trainer, dashboardResult] = await Promise.all([
      getTrainerById(parseInt(trainerId)),
      getDashboardData(parseInt(trainerId))
    ]);

    if (!trainer) {
      notFound();
    }

    // จัดการกรณีที่ไม่สามารถดึงข้อมูล dashboard ได้
    if (!dashboardResult.success) {
      return (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              สวัสดี, คุณ {trainer.firstName} {trainer.lastName}
            </h1>
          </div>

          {/* Error Alert */}
          <Alert variant="destructive">
            <AlertDescription>
              {dashboardResult.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard"}
            </AlertDescription>
          </Alert>

          {/* Fallback Content */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                ไม่สามารถแสดงข้อมูล Dashboard ได้ในขณะนี้
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const dashboardData = dashboardResult.data;

    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            สวัสดี, คุณ {trainer.firstName} {trainer.lastName}
          </h1>
        </div>

        {/* Key Metrics Cards */}
        <Suspense fallback={<div className="animate-pulse">Loading metrics...</div>}>
          <KeyMetricsCards keyMetrics={dashboardData.keyMetrics} trainerId={trainerId} />
        </Suspense>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Suspense fallback={<div className="animate-pulse">Loading activity...</div>}>
            <RecentActivity 
              recentActivity={dashboardData.recentActivity} 
              trainerId={trainerId} 
            />
          </Suspense>

          {/* Package Revenue Summary */}
          <Suspense fallback={<div className="animate-pulse">Loading members...</div>}>
            <PackageRevenueSummary 
              trainerId={trainerId}
              activeMembersPackages={dashboardData.activeMembersPackages}
            />
          </Suspense>
        </div>
      </div>
    );

  } catch (error) {
    console.error("Error loading trainer dashboard:", error);
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">เกิดข้อผิดพลาดในการโหลด</p>
        </div>

        {/* Error Card */}
        <Alert variant="destructive">
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard กรุณาลองใหม่อีกครั้ง
          </AlertDescription>
        </Alert>

        {/* Error Details for Development */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground space-y-2">
              <p>ข้อผิดพลาด: {error.message}</p>
              <p className="text-xs">กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลและลองใหม่</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

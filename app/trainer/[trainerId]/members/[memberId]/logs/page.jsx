import React from "react";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import CaloriesCard from "./_cards/CaloriesCard";
import MacroCard from "./_cards/MacroCard";
import ClientTimePeriodSelector from "./_components/ClientTimePeriodSelector";
import EditMacroButton from "./_components/EditMacroButton";
import { getMemberMacroData } from "@/actions/trainer/macro/getMemberMacroData";
import { getMemberIntake } from "@/actions/member/intakes/intakes";

/**
 * Error State Component
 */
function ErrorState({ message }) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * No Data State Component
 */
function NoDataState({ message }) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>ไม่พบข้อมูล</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Dashboard Header Component
 */
function DashboardHeader({ memberName, period, dateString, targets, planId, trainerId }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Macro Plan Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <EditMacroButton
          memberName={memberName}
          currentTargets={targets}
          period={period}
          planId={planId}
          trainerId={trainerId}
          variant="outline"
          size="sm"
        />
      </div>
    </div>
  );
}

/**
 * Macros Plan Page - Dashboard Style Layout
 */
export default async function MacrosPlanPage({ params, searchParams }) {
  const { trainerId, memberId } = await params;

  // ตรวจสอบ params
  if (!trainerId || !memberId) {
    return <ErrorState message="ไม่พบข้อมูล Trainer หรือ Member ID" />;
  }

  // ดึงพารามิเตอร์จาก searchParams (สำหรับ period และ date)
  const searchParamsData = await searchParams;
  const period = searchParamsData?.period || "daily";
  const selectedDate = searchParamsData?.date
    ? new Date(searchParamsData.date)
    : new Date();
  const dateString = selectedDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    // 🚀 ใช้ Promise.all เพื่อ fetch ข้อมูลพร้อมกัน
    const [macroResult, intakeData] = await Promise.all([
      getMemberMacroData(parseInt(memberId)),
      getMemberIntake(
        parseInt(memberId),
        selectedDate.toISOString().split("T")[0]
      ),
    ]);

    // จัดการ error cases สำหรับ macro data
    if (!macroResult.success) {
      if (macroResult.message.includes("ไม่พบข้อมูลสุขภาพ")) {
        return (
          <NoDataState message="ไม่พบข้อมูลสุขภาพของสมาชิก กรุณาเพิ่มข้อมูลสุขภาพก่อนเพื่อคำนวณ Macro Plan" />
        );
      }

      if (macroResult.message.includes("ไม่พบแผนโภชนาการที่ active")) {
        return (
          <NoDataState message="ไม่พบแผนโภชนาการที่ active กรุณาสร้างแผนโภชนาการสำหรับสมาชิกก่อน" />
        );
      }

      if (macroResult.message.includes("ไม่พบข้อมูลสมาชิก")) {
        notFound();
      }

      return <ErrorState message={macroResult.message} />;
    }

    const { data } = macroResult;

    // ข้อมูลการบริโภค (จาก intakes.js)
    const consumedData = {
      calories: intakeData?.calories || 0,
      protein: intakeData?.protein || 0,
      carb: intakeData?.carb || 0,
      fat: intakeData?.fat || 0,
    };

    // เลือก targets ตาม period
    const targets = data.targets[period] || data.targets.daily;

    // คำนวณสถิติ
    const totalConsumed =
      consumedData.protein + consumedData.carb + consumedData.fat;
    const totalTarget = targets.protein_g + targets.carb_g + targets.fat_g;
    const calorieProgress =
      targets.kcal > 0
        ? Math.round((consumedData.calories / targets.kcal) * 100)
        : 0;
    const macroProgress =
      totalTarget > 0 ? Math.round((totalConsumed / totalTarget) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader
          memberName={data.member.name}
          period={period}
          dateString={dateString}
          targets={targets}
          planId={data.macroPlan.id}
          trainerId={parseInt(trainerId)}
        />

        {/* Time Period Selector */}
        <ClientTimePeriodSelector trainerId={trainerId} memberId={memberId} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calories Card - Left 1/3 */}
          <div className="lg:col-span-1">
            <CaloriesCard
              targetCalories={Math.round(targets.kcal)}
              consumedCalories={consumedData.calories}
              exerciseBurned={0} // TODO: ดึงจาก workout logs
              isLoading={false}
            />
          </div>

          {/* Macronutrients Card - Right 2/3 */}
          <div className="lg:col-span-2">
            <MacroCard
              consumed={consumedData}
              targets={targets}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in MacrosPlanPage:", error);
    return <ErrorState message="เกิดข้อผิดพลาดในการโหลดข้อมูล" />;
  }
}

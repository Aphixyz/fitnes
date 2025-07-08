"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Apple,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMemberById } from "@/actions/member/getMemberData";
import { getMemberMacroPlans } from "@/actions/trainer/macro/getMemberMacroPlans";
import { getMemberMacroData } from "@/actions/trainer/macro/getMemberMacroData";
import MacroPlanList from "./_components/MacroPlanList";
import CreateMacroPlanModal from "./_components/CreateMacroPlanModal";
import EditMacroTargetsModal from "../logs/_components/EditMacroTargetsModal";
import ActiveMacroPlanCard from "./_components/ActiveMacroPlanCard";

// ===== Main Page Component =====

const MacroPlanManagementPage = () => {
  const params = useParams();
  const router = useRouter();
  const { trainerId, memberId } = params;

  // States
  const [memberData, setMemberData] = useState(null);
  const [macroPlanData, setMacroPlanData] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [macroTargets, setMacroTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ===== Load Member Data =====
  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      // โหลดข้อมูลสมาชิก, แผนโภชนาการ และ macro targets พร้อมกัน
      const [memberResult, macroPlansResult, macroDataResult] =
        await Promise.all([
          getMemberById(memberId),
          getMemberMacroPlans(memberId, trainerId),
          getMemberMacroData(parseInt(memberId)),
        ]);

      // ตรวจสอบข้อมูลสมาชิก
      if (!memberResult) {
        setError("ไม่พบข้อมูลสมาชิก");
        return;
      }
      setMemberData(memberResult);

      // ตรวจสอบข้อมูลแผนโภชนาการ
      if (macroPlansResult.success) {
        setMacroPlanData(macroPlansResult.data);

        // หา active plan
        const currentActivePlan =
          macroPlansResult.data.categorized?.active?.find(
            (plan) => plan.actualStatus === "active" && plan.isActive
          );
        setActivePlan(currentActivePlan || null);
      }

      // ตรวจสอบข้อมูล macro targets ที่คำนวณจาก macro-engine
      if (macroDataResult.success) {
        setMacroTargets(macroDataResult.data.targets);
      } else {
        // ถ้าไม่สามารถคำนวณได้ (เช่น ไม่มี active plan) ให้ใช้ค่า default
        console.warn(
          "Cannot calculate macro targets:",
          macroDataResult.message
        );
        setMacroTargets({
          daily: { kcal: 2000, protein_g: 125, carb_g: 225, fat_g: 67 },
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ===== คำนวณ targets สำหรับ plan เฉพาะ =====
  const calculateTargetsForPlan = async (plan) => {
    try {
      // ใช้ BMR/TDEE ที่คำนวณไว้แล้วจาก macroTargets (ถ้ามี)
      let baseCalories = 2000; // default fallback

      if (macroTargets?.daily?.kcal) {
        // ใช้ TDEE จาก active plan ที่คำนวณแล้ว
        baseCalories = macroTargets.daily.kcal;
      } else if (memberData) {
        // ถ้าไม่มี active plan แต่มีข้อมูลสมาชิก ให้ดึงข้อมูลใหม่
        const macroDataResult = await getMemberMacroData(parseInt(memberId));
        if (macroDataResult.success) {
          baseCalories = macroDataResult.data.calculations.tdee || 2000;
        }
      }

      // คำนวณ grams จาก ratio ของ plan ที่เลือก
      const proteinGrams = Math.round(
        (baseCalories * plan.macroSummary.protein) / 100 / 4
      );
      const carbGrams = Math.round(
        (baseCalories * plan.macroSummary.carb) / 100 / 4
      );
      const fatGrams = Math.round(
        (baseCalories * plan.macroSummary.fat) / 100 / 9
      );

      return {
        kcal: baseCalories,
        protein_g: proteinGrams,
        carb_g: carbGrams,
        fat_g: fatGrams,
      };
    } catch (error) {
      console.error("Error calculating targets for plan:", error);
      // fallback ใช้ค่า default ที่คำนวณจาก ratio
      const baseCalories = 2000;
      return {
        kcal: baseCalories,
        protein_g: Math.round(
          (baseCalories * plan.macroSummary.protein) / 100 / 4
        ),
        carb_g: Math.round((baseCalories * plan.macroSummary.carb) / 100 / 4),
        fat_g: Math.round((baseCalories * plan.macroSummary.fat) / 100 / 9),
      };
    }
  };

  // ===== Event Handlers =====
  const handleCreatePlan = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditPlan = async (plan) => {
    // คำนวณ targets สำหรับ plan ที่เลือก
    const planTargets = await calculateTargetsForPlan(plan);

    // เพิ่ม targets ลงใน selectedPlan
    setSelectedPlan({
      ...plan,
      calculatedTargets: planTargets,
    });
    setIsEditModalOpen(true);
  };

  const handlePlanCreated = () => {
    setIsCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
    loadMemberData(); // รีโหลดข้อมูล macro plans ด้วย
    toast({
      title: "สำเร็จ",
      description: "สร้างแผนโภชนาการใหม่เรียบร้อยแล้ว",
    });
  };

  const handlePlanUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedPlan(null);
    setRefreshKey((prev) => prev + 1);
    loadMemberData(); // รีโหลดข้อมูล macro plans ด้วย
    toast({
      title: "สำเร็จ",
      description: "อัปเดตแผนโภชนาการเรียบร้อยแล้ว",
    });
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPlan(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    loadMemberData();
  };

  // ===== Effects =====
  useEffect(() => {
    if (memberId && trainerId) {
      loadMemberData();
    }
  }, [memberId, trainerId]);

  // ===== Loading State =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // ===== Error State =====
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ===== Main Render =====
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Apple className="h-6 w-6 text-green-600" />
              จัดการแผนโภชนาการ
            </h1>
            <p className="text-muted-foreground">
              {memberData?.firstName} {memberData?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            รีเฟรช
          </Button>
          <Button
            onClick={handleCreatePlan}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            สร้างแผนใหม่
          </Button>
        </div>
      </div> */}

      {/* Active Macro Plan Card */}
      {activePlan && (
        <div className="mb-6">
          <ActiveMacroPlanCard
            plan={activePlan}
            trainerId={trainerId}
            memberId={memberId}
            onCreateClick={handleCreatePlan}
          />
        </div>
      )}

      {/* Macro Plans List */}
      <MacroPlanList
        key={refreshKey}
        memberId={memberId}
        trainerId={trainerId}
        onEditClick={handleEditPlan}
      />

      {/* Create Modal */}
      <CreateMacroPlanModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handlePlanCreated}
        memberId={memberId}
        trainerId={trainerId}
        memberData={memberData}
      />

      {/* Edit Modal - ใช้ข้อมูลที่คำนวณจริงจาก macro-engine */}
      {selectedPlan && (
        <EditMacroTargetsModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          memberName={
            memberData ? `${memberData.firstName} ${memberData.lastName}` : ""
          }
          currentTargets={selectedPlan.calculatedTargets || currentTargets}
          period="daily"
          planId={selectedPlan.macro_plan_id}
          trainerId={parseInt(trainerId)}
          onSave={handlePlanUpdated}
        />
      )}
    </div>
  );
};

export default MacroPlanManagementPage;

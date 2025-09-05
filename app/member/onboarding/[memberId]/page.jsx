"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import OnboardingWizard from "./_components/OnboardingWizard";
import { getOnboardingStatus } from "@/actions/member/onboarding/onboarding";

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.memberId; // เปลี่ยนจาก params.id เป็น params.memberId
  

  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!memberId) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const result = await getOnboardingStatus(memberId);

        if (result.success) {
          setOnboardingStatus(result);

          // ถ้าทำ onboarding เสร็จแล้ว redirect ไป dashboard
          if (result.completed_onboarding) {
            router.push(`/member/${memberId}/dashboard`);
            return;
          }
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setError("เกิดข้อผิดพลาดในการตรวจสอบสถานะ");
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [memberId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-center">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription className="text-center">{error}</AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile-first design - ไม่ต้องมี container wrapper */}
      <div className="w-full">
        {/* Onboarding Wizard - ให้ component จัดการ responsive เอง */}
        <OnboardingWizard
          memberId={memberId}
          onboardingStatus={onboardingStatus}
        />
      </div>
    </div>
  );
}
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
  const memberId = params.id;

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
            router.push(`/member/${memberId}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Onboarding Wizard */}
          <OnboardingWizard
            memberId={memberId}
            onboardingStatus={onboardingStatus}
          />
        </div>
      </div>
    </div>
  );
}

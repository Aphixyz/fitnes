// app/member/[id]/signup/packageplan/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Loader2,
  Package,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { getTrainerPackages } from "@/actions/member/package/getPackages";
import { selectPackage } from "@/actions/member/package/packageSelection";

export default function PackagePlanPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id;

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [trainerId, setTrainerId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // ดึง trainerId จาก URL params หรือ localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const trainerIdFromUrl = urlParams.get("trainer");

        if (!trainerIdFromUrl) {
          setError("ไม่พบข้อมูลเทรนเนอร์");
          return;
        }

        setTrainerId(trainerIdFromUrl);

        const result = await getTrainerPackages(trainerIdFromUrl);

        if (result.success) {
          setPackages(result.packages);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการโหลดแพ็คเกจ");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPackage = async () => {
    if (!selectedPackage || !trainerId) return;

    setSubmitting(true);
    try {
      const result = await selectPackage(
        memberId,
        trainerId,
        selectedPackage.packages_id
      );

      if (result.success) {
        router.push(`/member/${memberId}/signup/payment`);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเลือกแพ็คเกจ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">กำลังโหลดแพ็คเกจ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">เลือกแพ็คเกจ</h1>
            <div className="text-sm text-gray-500">ขั้นตอนสุดท้าย</div>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Package Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.packages_id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage?.packages_id === pkg.packages_id
                  ? "border-blue-500 border-2 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-blue-600" />
                {selectedPackage?.packages_id === pkg.packages_id && (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{pkg.packages_name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{pkg.packages_duration_months} เดือน</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-2xl font-bold text-blue-600">
                    ฿{pkg.packages_price?.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                {pkg.packages_description}
              </p>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSelectPackage}
            disabled={!selectedPackage || submitting}
            className="px-8 py-3 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                เลือกแพ็คเกจนี้
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Loader2,
  Package,
  Clock,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Zap,
  Award,
} from "lucide-react";
import { getTrainerPackages } from "@/actions/member/package/getPackages";
import { updateRegistrationPackage } from "@/actions/member/package/updateRegistrationPackage";

export default function PackageSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const registrationId = params.registrationId;
  const trainerId = searchParams.get("trainer");
  const memberId = searchParams.get("member");

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [price, setPrice] = useState(0);

  // โหลดแพ็คเกจเมื่อหน้าเริ่มต้น
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        if (!trainerId) {
          setError("ไม่พบข้อมูลเทรนเนอร์");
          return;
        }

        const result = await getTrainerPackages(trainerId);

        if (result.success) {
          setPackages(result.packages);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError("เกิดข้อผิดพลาดในการโหลดแพ็คเกจ");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [trainerId]);

  // จัดการการเลือกแพ็คเกจ
  const handleSelectPackage = async () => {
    if (!selectedPackage || !registrationId) return;

    setSubmitting(true);
    try {
      const result = await updateRegistrationPackage(
        registrationId,
        selectedPackage.packages_id
      );

      if (result.success) {
        // Redirect ไปหน้าชำระเงิน
        router.push(
          `/payment/${registrationId}/payment/${price}?name=${encodeURIComponent(
            selectedPackage.packages_name
          )}`
        );
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error selecting package:", error);
      setError("เกิดข้อผิดพลาดในการเลือกแพ็คเกจ");
    } finally {
      setSubmitting(false);
    }
  };

  const selectThod = async (p) => {
    console.log("params ", Number(p.packages_price));
    const p_ = Number(p.packages_price);
    setPrice(p_);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            กำลังโหลดแพ็คเกจ
          </h3>
          <p className="text-gray-600">รอสักครู่นะครับ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12"> 
          <h1 className="md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            เลือกเอาเองดิ รอไร
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            เปรียบเทียบแพ็คเกจและเลือกที่เหมาะสมกับเป้าหมายของคุณ
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-6xl mx-auto mb-8">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Package Cards - 4 per row */}
        <div className="max-w-7xl mx-auto">
          {packages.length > 0 ? (
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 mb-12">
              {packages.map((pkg, index) => {
                const isSelected =
                  selectedPackage?.packages_id === pkg.packages_id;

                return (
                  <Card
                    key={pkg.packages_id}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-blue-500 shadow-xl shadow-blue-200 scale-105"
                        : "hover:shadow-lg hover:scale-102 border-gray-200"
                    }`}
                    // thod
                    // onClick={() => setSelectedPackage(pkg)}
                    onClick={(e) => {
                      selectThod(pkg);
                      setSelectedPackage(pkg);
                    }}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Package Header */}
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                          <Package className="w-7 h-7 text-blue-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {pkg.packages_name}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed">
                          {pkg.packages_description ||
                            "แพ็คเกจเทรนเนอร์ส่วนตัวแบบครบครัน"}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="text-center mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold text-gray-900">
                            ฿{pkg.packages_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            ระยะเวลา {pkg.packages_duration_months} เดือน
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            เทรนเนอร์ส่วนตัว
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            แผนการฝึกแบบเฉพาะบุคคล
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            ติดตามผลความคืบหน้า
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="lg"
                        className={`w-full h-11 text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectThod(pkg);
                          setSelectedPackage(pkg);
                        }}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            เลือกแพ็คเกจนี้แล้ว
                          </>
                        ) : (
                          "เลือกแพ็คเกจนี้"
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่พบแพ็คเกจ
              </h3>
              <p className="text-gray-600">
                เทรนเนอร์ยังไม่ได้สร้างแพ็คเกจสำหรับการฝึก
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับ</span>
          </Button>

          <Button
            onClick={handleSelectPackage}
            disabled={!selectedPackage || submitting}
            size="lg"
            className={`flex items-center space-x-2 px-8 py-3 text-lg font-semibold ${
              selectedPackage && !submitting
                ? "flex items-center space-x-2 px-6 py-3 bg-slate-50 text-gray-700 hover:bg-gray-50"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                <span>ดำเนินการต่อ</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

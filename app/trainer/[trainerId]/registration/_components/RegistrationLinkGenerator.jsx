"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Link,
  Package,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useJWTRegistrationLink } from "@/hooks/useJWTRegistrationLink";

const RegistrationLinkGenerator = ({
  trainerId,
  selectedPackage,
  onSuccess,
  onClose,
}) => {
  const expiryHours = 24; // ค่าคงที่ 24 ชั่วโมง
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { generateLink } = useJWTRegistrationLink();

  // ฟังก์ชันสร้างลิงก์
  const handleGenerateLink = async () => {
    if (!selectedPackage) {
      return;
    }

    try {
      setIsGenerating(true);

      const result = await generateLink(
        trainerId,
        selectedPackage.packages_id.toString(),
        expiryHours
      );

      if (result.success) {
        setGeneratedLink(result);

        // เรียก callback หลังสำเร็จ
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      console.error("Error generating link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // คัดลอกลิงก์
  const handleCopyLink = async () => {
    if (generatedLink?.url) {
      try {
        await navigator.clipboard.writeText(generatedLink.url);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  // Format ราคา
  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format วันที่หมดอายุ
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "ไม่ระบุ";
    }
  };

  if (!selectedPackage) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>กรุณาเลือกแพ็คเกจก่อนสร้างลิงก์</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ข้อมูลแพ็คเกจที่เลือก */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>แพ็คเกจที่เลือก</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {selectedPackage.packages_name}
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(selectedPackage.packages_price)}
            </div>
            {selectedPackage.packages_description && (
              <p className="text-sm text-gray-600">
                {selectedPackage.packages_description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ปุ่มสร้างลิงก์ */}
      {!generatedLink && (
        <Button
          onClick={handleGenerateLink}
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังสร้างลิงก์...
            </>
          ) : (
            <>
              <Link className="h-4 w-4 mr-2" />
              สร้างลิงก์ลงทะเบียน
            </>
          )}
        </Button>
      )}

      {/* ผลลัพธ์ลิงก์ที่สร้างแล้ว */}
      {generatedLink && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>ลิงก์สร้างเสร็จสิ้น! 🎉</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ข้อมูลลิงก์ */}
            <div className="space-y-2">
              <Label>ลิงก์ลงทะเบียน</Label>
              <div className="flex space-x-1 items-center ">
                <Input
                  value={generatedLink.url}
                  readOnly
                  className="flex-1 font-mono text-sm bg-white"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>คัดลอก</span>
                </Button>
                <Button
                  onClick={() => window.open(generatedLink.url, "_blank")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>เปิด</span>
                </Button>
              </div>
            </div>

            {/* สร้างลิงก์ใหม่ */}
            <div className="pt-2 border-t">
              <Button
                onClick={() => setGeneratedLink(null)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                สร้างลิงก์ใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegistrationLinkGenerator;

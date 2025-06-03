"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, CheckCircle } from "lucide-react";
import {
  confirmRegistration,
  getPackageDuration,
} from "@/actions/trainer/registration/manageMemberRegistration";

export default function ConfirmRegistrationModal({
  isOpen,
  onClose,
  registration,
  trainerId,
  onSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [packageDuration, setPackageDuration] = useState(null);

  // ปิด scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ดึง package duration เมื่อโหลด modal
  useEffect(() => {
    const fetchPackageDuration = async () => {
      if (isOpen && registration?.packages_id && trainerId) {
        try {
          const duration = await getPackageDuration(
            registration.packages_id,
            trainerId
          );
          setPackageDuration(duration);
        } catch (error) {
          console.error("Error fetching package duration:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถดึงระยะเวลาแพ็คเกจได้",
            variant: "destructive",
          });
        }
      }
    };
    fetchPackageDuration();
  }, [isOpen, registration?.packages_id, trainerId]);

  // คำนวณ endDate เมื่อ startDate หรือ packageDuration เปลี่ยน
  useEffect(() => {
    if (startDate && packageDuration !== null) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + packageDuration);
      setEndDate(end.toISOString().split("T")[0]);
    } else if (!packageDuration) {
      setEndDate(""); // ไม่แสดง endDate ถ้าไม่มี packageDuration
    }
  }, [startDate, packageDuration]);

  if (!isOpen || !registration) return null;

  const handleConfirm = async () => {
    if (!startDate) {
      toast({
        title: "กรุณากรอกข้อมูล",
        description: "กรุณาระบุวันเริ่มต้นการลงทะเบียน",
        variant: "destructive",
      });
      return;
    }

    if (!packageDuration) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลระยะเวลาแพ็คเกจได้",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending to confirmRegistration:", {
        registrationId: registration.registration_id,
        trainerId,
        startDate,
        packages_id: registration.packages_id,
      });

      const result = await confirmRegistration({
        registrationId: registration.registration_id,
        trainerId,
        startDate,
        packages_id: registration.packages_id,
      });

      console.log("Result from confirmRegistration:", result); // ดีบักผลลัพธ์

      if (result.success) {
        toast({
          title: "ยืนยันการลงทะเบียนสำเร็จ",
          description: "ลงทะเบียนสมาชิกเรียบร้อยแล้ว",
        });
        if (onSuccess) onSuccess(); // เรียกฟังก์ชันเพื่อรีเฟรชข้อมูล
        onClose();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "การยืนยันการลงทะเบียนล้มเหลว",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in confirmRegistration:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error.message ||
          "เกิดข้อผิดพลาดในการยืนยันการลงทะเบียน กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSlip = () => {
    if (registration.slip_image) {
      window.open(registration.slip_image, "_blank");
    } else {
      toast({
        title: "ไม่พบข้อมูล",
        description: "ไม่มีภาพใบสลิปสำหรับการลงทะเบียนนี้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>ยืนยันการลงทะเบียน</CardTitle>
            <CardDescription>
              กรุณาระบุวันเริ่มต้น วันสิ้นสุดจะคำนวณจากแพ็คเกจ
            </CardDescription>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">{registration.member_name}</div>
                <div className="text-sm text-gray-500">
                  {registration.member_email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">วันเริ่มต้น</Label>
                <div className="relative">
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">วันสิ้นสุด</Label>
                <div className="relative">
                  <Input
                    id="end-date"
                    type="text"
                    value={endDate || ""}
                    readOnly
                    className="cursor-not-allowed bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-200">
              <p>
                <strong>หมายเหตุ:</strong>{" "}
                วันสิ้นสุดจะคำนวณจากระยะเวลาแพ็คเกจที่เลือก
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleViewSlip}
              disabled={!registration.slip_image || isLoading}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              ดูใบสลิป
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังยืนยัน...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  ยืนยัน
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
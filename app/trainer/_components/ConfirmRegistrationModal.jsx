"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, CheckCircle, XCircle } from "lucide-react";
import { confirmRegistration, rejectRegistration } from "@/actions/trainer/manageMemberRegistration";

export default function ConfirmRegistrationModal({ isOpen, onClose, registration, trainerId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  );

  // ปิด scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !registration) return null;

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "กรุณากรอกข้อมูล",
        description: "กรุณาระบุวันเริ่มต้นและวันสิ้นสุดการลงทะเบียน",
        variant: "destructive",
      });
      return;
    }

    // ตรวจสอบว่าวันสิ้นสุดต้องมากกว่าวันเริ่มต้น
    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "วันสิ้นสุดต้องมากกว่าวันเริ่มต้น",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmRegistration({
        registrationId: registration.registration_id,
        trainerId,
        startDate,
        endDate
      });

      if (result.success) {
        toast({
          title: "ยืนยันการลงทะเบียนสำเร็จ",
          description: "ลงทะเบียนสมาชิกเรียบร้อยแล้ว",
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืนยันการลงทะเบียนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("คุณต้องการปฏิเสธการลงทะเบียนนี้ใช่หรือไม่?")) return;

    setIsLoading(true);
    try {
      const result = await rejectRegistration(
        registration.registration_id,
        trainerId
      );

      if (result.success) {
        toast({
          title: "ปฏิเสธการลงทะเบียนสำเร็จ",
          description: "ปฏิเสธการลงทะเบียนเรียบร้อยแล้ว",
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถปฏิเสธการลงทะเบียนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>ยืนยันการลงทะเบียน</CardTitle>
            <CardDescription>
              กรุณากำหนดวันเริ่มต้นและวันสิ้นสุดการลงทะเบียนสำหรับสมาชิกใหม่
            </CardDescription>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
                <div className="text-sm text-gray-500">{registration.member_email}</div>
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
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-200">
              <p>
                <strong>หมายเหตุ:</strong> การยืนยันการลงทะเบียนจะทำให้สมาชิกสามารถเข้าใช้งานระบบได้ตามระยะเวลาที่กำหนด
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReject}
              disabled={isLoading}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              ปฏิเสธ
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
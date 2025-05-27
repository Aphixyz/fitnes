"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStatus } from "react-dom";

// ปุ่มบันทึกที่แสดงสถานะ loading
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Save className="mr-2 h-4 w-4" />
      {pending ? "กำลังบันทึก..." : "บันทึกและเพิ่มท่าออกกำลังกาย"}
    </Button>
  );
}

export default function WorkoutPlanForm({
  trainerId,
  memberId,
  memberName,
  title,
}) {
  const router = useRouter();
  const [planData, setPlanData] = useState({
    plan_name: "",
    plan_duration: 0,
    plan_startdate: new Date().toISOString().split("T")[0],
    plan_enddate: "",
    plan_note: "",
  });
  const [validationError, setValidationError] = useState(null);

  const durationOptions = [
    { value: 0, label: "ไม่กำหนด" },
    { value: 1, label: "1 สัปดาห์" },
    { value: 2, label: "2 สัปดาห์" },
    { value: 3, label: "3 สัปดาห์" },
    { value: 4, label: "4 สัปดาห์" },
    { value: 5, label: "5 สัปดาห์" },
    { value: 6, label: "6 สัปดาห์" },
    { value: 8, label: "8 สัปดาห์" },
    { value: 12, label: "12 สัปดาห์" },
  ];

  // คำนวณวันที่สิ้นสุดอัตโนมัติเมื่อเปลี่ยนระยะเวลาหรือวันเริ่มต้น
  useEffect(() => {
    if (planData.plan_duration === 0) {
      setPlanData((prev) => ({ ...prev, plan_enddate: "" }));
      return;
    }

    if (planData.plan_startdate && planData.plan_duration > 0) {
      const startDate = new Date(planData.plan_startdate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + planData.plan_duration * 7);

      setPlanData((prev) => ({
        ...prev,
        plan_enddate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [planData.plan_duration, planData.plan_startdate]);

  // จัดการการเปลี่ยนแปลงข้อมูล
  const handleChange = (field, value) => {
    setPlanData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null); // รีเซ็ตข้อผิดพลาดเมื่อมีการเปลี่ยนแปลง
  };

  // ตรวจสอบข้อมูลก่อนส่งฟอร์ม
  const handleClientValidation = (e) => {
    if (!planData.plan_name) {
      e.preventDefault();
      setValidationError("กรุณาระบุชื่อโปรแกรม");
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุชื่อโปรแกรม",
        variant: "destructive",
      });
      return false;
    }

    if (!planData.plan_startdate) {
      e.preventDefault();
      setValidationError("กรุณาเลือกวันเริ่มต้น");
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกวันเริ่มต้น",
        variant: "destructive",
      });
      return false;
    }

    // ผ่าน validation แล้ว ทำการบันทึก log
    console.log("Form validated, submitting...");
  };

  // จัดการการกดปุ่มกลับ
  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* ส่วนหัว */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
        {memberName && (
          <p className="text-muted-foreground">สำหรับ {memberName}</p>
        )}
      </div>

      {validationError && (
        <div className="p-4 border border-red-400 bg-red-50 rounded text-red-800">
          {validationError}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan_name">ชื่อโปรแกรม</Label>
              <Input
                id="plan_name"
                name="plan_name"
                placeholder="ระบุชื่อโปรแกรมออกกำลังกาย"
                value={planData.plan_name}
                onChange={(e) => handleChange("plan_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_duration">ระยะเวลา</Label>
              <Select
                value={planData.plan_duration.toString()}
                onValueChange={(value) =>
                  handleChange("plan_duration", parseInt(value))
                }
              >
                <SelectTrigger id="plan_duration">
                  <SelectValue placeholder="เลือกระยะเวลา" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* ซ่อนค่าที่เลือกไว้ใน form data */}
              <input
                type="hidden"
                name="plan_duration"
                value={planData.plan_duration}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_startdate">วันเริ่มต้น</Label>
              <Input
                id="plan_startdate"
                name="plan_startdate"
                type="date"
                value={planData.plan_startdate}
                onChange={(e) => handleChange("plan_startdate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_enddate">วันสิ้นสุด</Label>
              <Input
                id="plan_enddate"
                name="plan_enddate"
                type="date"
                value={planData.plan_enddate}
                disabled={planData.plan_duration > 0}
                onChange={(e) => handleChange("plan_enddate", e.target.value)}
              />
              {planData.plan_duration > 0 && (
                <p className="text-xs text-muted-foreground">
                  วันสิ้นสุดจะถูกคำนวณอัตโนมัติตามระยะเวลาที่เลือก
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="plan_note">หมายเหตุโปรแกรม</Label>
              <Textarea
                id="plan_note"
                name="plan_note"
                placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมการออกกำลังกาย (ไม่บังคับ)"
                value={planData.plan_note}
                onChange={(e) => handleChange("plan_note", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4 mt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          ยกเลิก
        </Button>

        {/* ใช้ Component ที่มีการจัดการ pending state */}
        <SubmitButton />
      </div>
    </>
  );
}

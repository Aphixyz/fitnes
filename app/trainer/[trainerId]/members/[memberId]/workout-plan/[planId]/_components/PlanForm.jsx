"use client";

import { useState, useEffect } from "react";
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

export default function PlanForm({ initialData, onDataChange, memberName }) {
  const [planData, setPlanData] = useState({
    plan_name: "",
    plan_duration: 0, // 0 = ไม่กำหนด
    plan_startdate: new Date().toISOString().split("T")[0],
    plan_enddate: "",
    plan_note: "",
    plan_status: "active"
  });

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
  
  const statusOptions = [
    { value: "active", label: "ใช้งาน" },
    { value: "inactive", label: "ไม่ใช้งาน" },
    { value: "completed", label: "เสร็จสิ้น" },
  ];

  // เมื่อมีการโหลดข้อมูล initialData
  useEffect(() => {
    if (initialData) {
      setPlanData({
        ...initialData
      });
    }
  }, [initialData]);

  // คำนวณวันที่สิ้นสุดอัตโนมัติเมื่อเปลี่ยนระยะเวลาหรือวันเริ่มต้น
  useEffect(() => {
    // ถ้าเลือก "ไม่กำหนด" ให้วันสิ้นสุดเป็นค่าว่าง
    if (planData.plan_duration === 0) {
      setPlanData(prev => ({ ...prev, plan_enddate: "" }));
      return;
    }
    
    // คำนวณวันสิ้นสุด
    if (planData.plan_startdate && planData.plan_duration > 0) {
      const startDate = new Date(planData.plan_startdate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (planData.plan_duration * 7)); // duration เป็นสัปดาห์
      
      setPlanData(prev => ({
        ...prev,
        plan_enddate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [planData.plan_duration, planData.plan_startdate]);

  // ส่งข้อมูลกลับไปที่ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onDataChange) {
      onDataChange(planData);
    }
  }, [planData, onDataChange]);

  // จัดการการเปลี่ยนแปลงข้อมูล
  const handleChange = (field, value) => {
    setPlanData(prev => ({ 
      ...prev, 
      [field]: field === "plan_duration" ? Number(value) : value 
    }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-muted-foreground">สำหรับ {memberName}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="plan_name">ชื่อโปรแกรม</Label>
            <Input
              id="plan_name"
              placeholder="ระบุชื่อโปรแกรมออกกำลังกาย"
              value={planData.plan_name || ""}
              onChange={(e) => handleChange("plan_name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan_status">สถานะโปรแกรม</Label>
            <Select 
              value={planData.plan_status || "active"} 
              onValueChange={(value) => handleChange("plan_status", value)}
            >
              <SelectTrigger id="plan_status">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan_duration">ระยะเวลา</Label>
            <Select 
              value={String(planData.plan_duration || "0")} 
              onValueChange={(value) => handleChange("plan_duration", value)}
            >
              <SelectTrigger id="plan_duration">
                <SelectValue placeholder="เลือกระยะเวลา" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan_startdate">วันเริ่มต้น</Label>
            <Input
              id="plan_startdate"
              type="date"
              value={planData.plan_startdate || ""}
              onChange={(e) => handleChange("plan_startdate", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan_enddate">วันสิ้นสุด</Label>
            <Input
              id="plan_enddate"
              type="date"
              value={planData.plan_enddate || ""}
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
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมการออกกำลังกาย (ไม่บังคับ)"
              value={planData.plan_note || ""}
              onChange={(e) => handleChange("plan_note", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import Link from "next/link";
import { formatDate } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronRight,
  Clock,
  Apple,
  Target,
  Activity,
  PlusCircle,
} from "lucide-react";

export default function ActiveMacroPlanCard({ plan, trainerId, memberId ,onCreateClick}) {
  if (!plan) return null;

  // คำนวณวันที่คงเหลือ
  const calculateRemainingDays = () => {
    if (!plan.end_date) return null;

    const today = new Date();
    const endDate = new Date(plan.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // คำนวณระยะเวลาทั้งหมด
  const calculateTotalDays = () => {
    if (!plan.start_date || !plan.end_date) return null;

    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // สร้างชื่อแผนจากอัตราส่วน macro
  const getPlanName = () => {
    const protein = Math.round(plan.protein_ratio || 0);
    const carb = Math.round(plan.carb_ratio || 0);
    const fat = Math.round(plan.fat_ratio || 0);
    return `แผน ${protein}:${carb}:${fat}`;
  };

  // คำนวณ progress percentage
  const calculateProgress = () => {
    const remaining = calculateRemainingDays();
    const total = calculateTotalDays();

    if (remaining === null || total === null || total === 0) return 0;

    const progress = ((total - remaining) / total) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const remainingDays = calculateRemainingDays();
  const totalDays = calculateTotalDays();
  const progressPercent = calculateProgress();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">แผนโภชนาการปัจจุบัน</CardTitle>
            <CardDescription>แผนที่กำลังใช้งานอยู่</CardDescription>
          </div>
          <Button
          onClick={onCreateClick}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          สร้างแผนใหม่
        </Button>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="text-xl font-bold mb-3">{getPlanName()}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">วันเริ่มต้น - สิ้นสุด</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(plan.start_date)} -{" "}
                {plan.end_date ? formatDate(plan.end_date) : "ไม่กำหนด"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">อัตราส่วน Macro</p>
              <div className="flex gap-2 text-sm">
                <span className="text-red-600 font-medium">
                  P: {Math.round(plan.protein_ratio || 0)}%
                </span>
                <span className="text-green-600 font-medium">
                  C: {Math.round(plan.carb_ratio || 0)}%
                </span>
                <span className="text-yellow-600 font-medium">
                  F: {Math.round(plan.fat_ratio || 0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">สถานะแผน</p>
              <p className="text-sm text-muted-foreground">
                {plan.plan_status === "active" ? "ใช้งานอยู่" : "ไม่ได้ใช้งาน"}
              </p>
            </div>
          </div>
        </div>

        {remainingDays !== null && totalDays !== null && (
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-muted-foreground">
                ความคืบหน้า {Math.round(progressPercent)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {remainingDays} วันที่เหลือ
              </p>
            </div>
          </div>
        )}
      </CardContent>

    </Card>
  );
}

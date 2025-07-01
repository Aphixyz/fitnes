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
import { Calendar, ChevronRight, Clock, FileText } from "lucide-react";

export default function ActiveWorkoutPlanCard({ plan, trainerId, memberId }) {
  if (!plan) return null;

  // คำนวณวันที่คงเหลือ
  const calculateRemainingDays = () => {
    if (!plan.plan_enddate) return null;

    const today = new Date();
    const endDate = new Date(plan.plan_enddate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = calculateRemainingDays();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">แผนการออกกำลังกายปัจจุบัน</CardTitle>
            <CardDescription>แผนที่กำลังใช้งานอยู่</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800">กำลังใช้งาน</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="text-xl font-bold mb-3">{plan.plan_name}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">วันเริ่มต้น - สิ้นสุด</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(plan.plan_startdate)} -{" "}
                {plan.plan_enddate ? formatDate(plan.plan_enddate) : "ไม่กำหนด"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">ระยะเวลาโปรแกรม</p>
              <p className="text-sm text-muted-foreground">
                {plan.plan_duration || "-"} สัปดาห์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">จำนวนโปรแกรม</p>
              <p className="text-sm text-muted-foreground">
                {plan.program_count || 0} โปรแกรม
              </p>
            </div>
          </div>
        </div>

        {remainingDays !== null && (
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(remainingDays / (plan.plan_duration * 7)) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-right mt-1 text-muted-foreground">
              {remainingDays} วันที่เหลือ
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-sm text-muted-foreground">
          สร้างเมื่อ {formatDate(plan.created_at)}
        </p>
        <Link
          href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${plan.workout_plan_id}`}
        >
          <Button variant="ghost" className="gap-1">
            ดูรายละเอียด
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

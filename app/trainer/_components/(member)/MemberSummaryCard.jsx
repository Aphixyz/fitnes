"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateBMI } from "@/utils/utils";

/**
 * คอมโพเนนต์แสดงสรุปข้อมูลสำคัญของสมาชิก
 * 
 * @param {Object} props
 * @param {Object} props.healthData - ข้อมูลสุขภาพของสมาชิก
 * @param {Object} props.goalData - ข้อมูลเป้าหมายของสมาชิก
 * @param {boolean} props.loading - สถานะการโหลดข้อมูล
 */
export default function MemberSummaryCard({ healthData, goalData, loading }) {
  // คำนวณ BMI จากส่วนสูงและน้ำหนัก
  const bmi = healthData ? calculateBMI(
    healthData.member_health_weight,
    healthData.member_health_height
  ) : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">น้ำหนักปัจจุบัน</p>
            <p className="text-2xl font-bold">{healthData?.member_health_weight || "-"} กก.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ส่วนสูง</p>
            <p className="text-2xl font-bold">{healthData?.member_health_height || "-"} ซม.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">BMI</p>
            <p className="text-2xl font-bold">{bmi || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">เป้าหมายปัจจุบัน</p>
            <p className="text-2xl font-bold">{goalData?.fitness_goal_type || "ไม่มี"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
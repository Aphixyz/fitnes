"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBmiStatus, formatDate, calculateBMI } from "@/utils/utils";
import { ProgressCircle } from "@/components/ui/progress-circle";

/**
 * Dashboard Card สำหรับแสดงข้อมูลสรุปสุขภาพและเป้าหมายของสมาชิก
 * @param {Object} healthData - ข้อมูลสุขภาพล่าสุด
 * @param {Object} goalData - ข้อมูลเป้าหมายที่กำลังใช้งาน
 * @param {string} memberId - รหัสสมาชิก (สำหรับสร้าง URL)
 */
export default function MemberDashboardCard({ healthData, goalData, memberId }) {
  // คำนวณ BMI ด้วย utility function
  const bmi = healthData ? calculateBMI(healthData.member_health_weight, healthData.member_health_height) : null;
  
  // คำนวณสถานะ BMI
  const bmiStatus = bmi ? getBmiStatus(bmi) : null;
  
  // คำนวณความคืบหน้าของเป้าหมาย
  const calculateGoalProgress = () => {
    if (!goalData || !healthData) return { percentage: 0, remaining: 0 };
    
    // เฉพาะกรณีเป้าหมายเกี่ยวกับน้ำหนัก
    if (
      !goalData.target_weight || 
      !healthData.member_health_weight || 
      !["ลดน้ำหนัก", "เพิ่มน้ำหนัก", "คงที่น้ำหนัก"].includes(goalData.goal_type)
    ) {
      return { percentage: 0, remaining: 0 };
    }

    const targetWeight = parseFloat(goalData.target_weight);
    const initialWeight = parseFloat(goalData.initial_weight || healthData.member_health_initial_weight);
    const currentWeight = parseFloat(healthData.member_health_weight);
    
    // คำนวณความแตกต่างทั้งหมดที่ต้องการ
    const totalDifference = Math.abs(targetWeight - initialWeight);
    
    // ไม่มีความแตกต่าง
    if (totalDifference === 0) {
      return { percentage: 100, remaining: 0 };
    }
    
    // คำนวณความแตกต่างที่ทำได้แล้ว
    const achievedDifference = Math.abs(currentWeight - initialWeight);
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    let percentage = (achievedDifference / totalDifference) * 100;
    
    // ตรวจสอบทิศทาง
    if ((goalData.goal_type === "ลดน้ำหนัก" && currentWeight > targetWeight) ||
        (goalData.goal_type === "เพิ่มน้ำหนัก" && currentWeight < targetWeight)) {
      percentage = Math.min(percentage, 100);
    } else {
      percentage = 100;
    }
    
    // คำนวณน้ำหนักที่ต้องเปลี่ยนแปลงอีก
    const remaining = Math.abs(targetWeight - currentWeight);
    
    return { 
      percentage: Math.round(percentage), 
      remaining: remaining.toFixed(2)
    };
  };

  const goalProgress = calculateGoalProgress();

  // คำนวณวันที่เหลือของเป้าหมาย
  const calculateRemainingDays = () => {
    if (!goalData?.fitness_goal_enddate) return 0;
    
    const endDate = new Date(goalData.fitness_goal_enddate);
    const today = new Date();
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ข้อมูลสุขภาพของคุณ</span>
          {healthData?.member_health_measurementdate && (
            <span className="text-sm font-normal text-muted-foreground">
              อัพเดตเมื่อ: {formatDate(healthData.member_health_measurementdate)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ข้อมูลสุขภาพ */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">ข้อมูลสุขภาพล่าสุด</h3>
            
            {healthData ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">น้ำหนัก</p>
                  <p className="text-lg font-medium">{healthData.member_health_weight ? `${healthData.member_health_weight} กก.` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ส่วนสูง</p>
                  <p className="text-lg font-medium">{healthData.member_health_height ? `${healthData.member_health_height} ซม.` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-lg font-medium">{bmi || "-"}</p>
                    {bmiStatus && (
                      <span className={`text-xs ${bmiStatus.color}`}>
                        ({bmiStatus.label})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ไขมัน</p>
                  <p className="text-lg font-medium">{healthData.member_health_bodyfat ? `${healthData.member_health_bodyfat}%` : "-"}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-muted-foreground">ยังไม่มีข้อมูลสุขภาพ</p>
                <Link href={`/member/${memberId}/health`}>
                  <Button variant="link" className="mt-2 p-0 h-auto">
                    บันทึกข้อมูลสุขภาพ
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ข้อมูลเป้าหมาย */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">เป้าหมายปัจจุบัน</h3>
            
            {goalData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">ประเภท</p>
                    <p className="text-lg font-medium">{goalData.goal_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">วันที่เหลือ</p>
                    <p className="text-lg font-medium">{remainingDays} วัน</p>
                  </div>
                  {goalData.target_weight && (
                    <div>
                      <p className="text-sm text-muted-foreground">น้ำหนักเป้าหมาย</p>
                      <p className="text-lg font-medium">{goalData.target_weight} กก.</p>
                    </div>
                  )}
                </div>
                
                {/* แสดงความคืบหน้า */}
                {goalProgress.percentage > 0 && healthData && (
                  <div className="flex items-center justify-center space-x-4">
                    <ProgressCircle value={goalProgress.percentage} size="small" />
                    <div className="text-sm">
                      <p>ความคืบหน้า: <span className="font-medium">{goalProgress.percentage}%</span></p>
                      {goalProgress.remaining > 0 && (
                        <p className="text-muted-foreground">
                          {goalData.goal_type === "ลดน้ำหนัก" ? "ต้องลด" : goalData.goal_type === "เพิ่มน้ำหนัก" ? "ต้องเพิ่ม" : "ต้องรักษา"} 
                          อีก {goalProgress.remaining} กก.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-muted-foreground">ยังไม่มีเป้าหมายการออกกำลังกาย</p>
                <Link href={`/member/${memberId}/goal`}>
                  <Button variant="link" className="mt-2 p-0 h-auto">
                    ตั้งเป้าหมาย
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0 space-x-2">
        <Link href={`/member/${memberId}/health`}>
          <Button variant="outline" size="sm">
            จัดการข้อมูลสุขภาพ
          </Button>
        </Link>
        <Link href={`/member/${memberId}/goal`}>
          <Button size="sm">
            จัดการเป้าหมาย
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
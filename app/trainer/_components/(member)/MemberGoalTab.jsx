"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/utils/utils";
import { AlertCircle } from "lucide-react";

/**
 * คอมโพเนนต์แสดงเป้าหมายการออกกำลังกายของสมาชิก
 * 
 * @param {Object} props
 * @param {string} props.memberId - รหัสสมาชิก
 * @param {Object} props.goalData - ข้อมูลเป้าหมายปัจจุบัน
 * @param {Array} props.goalHistory - ประวัติเป้าหมาย
 * @param {number} props.currentWeight - น้ำหนักปัจจุบัน
 */
export default function MemberGoalTab({ memberId, goalData, goalHistory, currentWeight }) {
  const [activeGoalData, setActiveGoalData] = useState(goalData);

  // เมื่อคลิกดูรายละเอียดจากประวัติ
  const handleViewGoalDetails = (record) => {
    setActiveGoalData(record);
  };

  // กลับไปดูข้อมูลล่าสุด
  const handleResetToLatest = () => {
    setActiveGoalData(goalData);
  };

  // ถ้าไม่มีเป้าหมาย
  if (!goalData && !goalHistory?.length) {
    return (
      <div className="space-y-6">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ไม่พบเป้าหมายการออกกำลังกาย</AlertTitle>
          <AlertDescription>
            สมาชิกยังไม่มีเป้าหมายการออกกำลังกายที่บันทึกในระบบ การมีเป้าหมายจะช่วยให้สมาชิกมีแรงจูงใจและวัดผลความสำเร็จได้ชัดเจนยิ่งขึ้น
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>สร้างเป้าหมายการออกกำลังกาย</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>สร้างเป้าหมายใหม่</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // คำนวณความคืบหน้า
  const calculateProgress = () => {
    // ถ้าไม่มีน้ำหนักเป้าหมายหรือน้ำหนักปัจจุบัน ไม่สามารถคำนวณได้
    if (!activeGoalData.fitness_goal_targetweight || !currentWeight) {
      return { percentage: 0, remaining: 0 };
    }

    const targetWeight = parseFloat(activeGoalData.fitness_goal_targetweight);
    // เพราะไม่มี initial_weight จึงสมมติค่าเริ่มต้นให้เป็นค่าปัจจุบัน
    const initialWeight = parseFloat(currentWeight);
    const currentWeightValue = parseFloat(currentWeight);
    
    // คำนวณความแตกต่างทั้งหมดที่ต้องการ
    const totalDifference = Math.abs(targetWeight - initialWeight);
    
    // ไม่มีความแตกต่าง (เป้าหมายเท่ากับน้ำหนักเริ่มต้น)
    if (totalDifference === 0) {
      return { percentage: 100, remaining: 0 };
    }
    
    // คำนวณความแตกต่างที่ทำได้แล้ว
    const achievedDifference = Math.abs(currentWeightValue - initialWeight);
    
    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    let percentage = (achievedDifference / totalDifference) * 100;
    
    // ตรวจสอบทิศทาง (ลดหรือเพิ่ม)
    if ((activeGoalData.fitness_goal_type === "ลดน้ำหนัก" && currentWeightValue > targetWeight) ||
        (activeGoalData.fitness_goal_type === "เพิ่มน้ำหนัก" && currentWeightValue < targetWeight)) {
      percentage = Math.min(percentage, 100);
    } else {
      // ถ้าเลยเป้าหมายไปแล้ว
      percentage = 100;
    }
    
    // คำนวณน้ำหนักที่ต้องเปลี่ยนแปลงอีก
    const remaining = Math.abs(targetWeight - currentWeightValue);
    
    return { 
      percentage: Math.round(percentage), 
      remaining: remaining.toFixed(2)
    };
  };

  const progress = calculateProgress();

  // คำนวณวันที่เหลือ
  const calculateRemainingDays = () => {
    const endDate = new Date(activeGoalData.fitness_goal_enddate);
    const today = new Date();
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();

  // คำนวณวันทั้งหมดและวันที่ผ่านไป
  const calculateTotalDays = () => {
    const startDate = new Date(activeGoalData.fitness_goal_startdate);
    const endDate = new Date(activeGoalData.fitness_goal_enddate);
    
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays);
  };

  const totalDays = calculateTotalDays();
  const passedDays = totalDays - remainingDays;
  const timeProgress = Math.min(100, Math.round((passedDays / totalDays) * 100));

  // สถานะเป้าหมาย
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">กำลังดำเนินการ</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">สำเร็จแล้ว</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ยกเลิก</Badge>;
      default:
        return <Badge className="bg-gray-500">ไม่ทราบสถานะ</Badge>;
    }
  };

  // คำนวณระยะเวลาเป้าหมายเป็นเดือน
  const calculateGoalDurationMonths = () => {
    const startDate = new Date(activeGoalData.fitness_goal_startdate);
    const endDate = new Date(activeGoalData.fitness_goal_enddate);
    
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    return Math.max(1, diffMonths); // อย่างน้อย 1 เดือน
  };

  const goalDurationMonths = calculateGoalDurationMonths();

  return (
    <div className="space-y-6">
      {activeGoalData !== goalData && (
        <div className="flex justify-between items-center mb-4">
          <Alert variant="info" className="flex-1 mr-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>กำลังดูเป้าหมายย้อนหลัง</AlertTitle>
            <AlertDescription>
              ท่านกำลังดูเป้าหมายที่บันทึกระหว่าง {formatDate(activeGoalData.fitness_goal_startdate)} ถึง {formatDate(activeGoalData.fitness_goal_enddate)}
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleResetToLatest}>
            กลับไปดูเป้าหมายปัจจุบัน
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>เป้าหมายการออกกำลังกาย</CardTitle>
            {getStatusBadge(activeGoalData.fitness_goal_status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ข้อมูลเป้าหมาย</h3>
                <div className="mt-1">
                  <div className="flex justify-between py-1">
                    <span className="font-medium">ประเภทเป้าหมาย:</span>
                    <span>{activeGoalData.fitness_goal_type}</span>
                  </div>
                  
                  {activeGoalData.fitness_goal_targetweight && (
                    <div className="flex justify-between py-1">
                      <span className="font-medium">น้ำหนักเป้าหมาย:</span>
                      <span>{activeGoalData.fitness_goal_targetweight} กก.</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-1">
                    <span className="font-medium">ระยะเวลา:</span>
                    <span>{goalDurationMonths} เดือน</span>
                  </div>
                  
                  <div className="flex justify-between py-1">
                    <span className="font-medium">วันที่เริ่มต้น:</span>
                    <span>{formatDate(activeGoalData.fitness_goal_startdate)}</span>
                  </div>
                  
                  <div className="flex justify-between py-1">
                    <span className="font-medium">วันที่สิ้นสุด:</span>
                    <span>{formatDate(activeGoalData.fitness_goal_enddate)}</span>
                  </div>
                  
                  <div className="flex justify-between py-1">
                    <span className="font-medium">วันที่เหลือ:</span>
                    <span>{remainingDays} วัน</span>
                  </div>
                </div>
              </div>

              {activeGoalData.fitness_goal_targetmuscle && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">เป้าหมายกล้ามเนื้อ</h3>
                  <p className="mt-1">{activeGoalData.fitness_goal_targetmuscle}</p>
                </div>
              )}
              
              {activeGoalData.fitness_goal_note && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">บันทึกเพิ่มเติม</h3>
                  <p className="mt-1">{activeGoalData.fitness_goal_note}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* แสดงความคืบหน้าน้ำหนัก */}
              {(activeGoalData.fitness_goal_type === "ลดน้ำหนัก" || activeGoalData.fitness_goal_type === "เพิ่มน้ำหนัก" || activeGoalData.fitness_goal_type === "คงที่น้ำหนัก") && (
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">ความคืบหน้า</h3>
                  <div className="flex justify-center">
                    <div className="relative h-32 w-32">
                      <svg viewBox="0 0 100 100" className="h-full w-full">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={progress.percentage >= 66 ? "#22c55e" : progress.percentage >= 33 ? "#eab308" : "#ef4444"}
                          strokeWidth="10"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * progress.percentage) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{progress.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  {currentWeight && (
                    <div className="text-center mt-2">
                      <p className="text-sm">น้ำหนักปัจจุบัน: <span className="font-medium">{currentWeight} กก.</span></p>
                      <p className="text-sm">
                        {progress.remaining > 0 
                          ? `ต้อง${activeGoalData.fitness_goal_type === "ลดน้ำหนัก" ? "ลด" : "เพิ่ม"}อีก ${progress.remaining} กก.` 
                          : "บรรลุเป้าหมายแล้ว!"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* แสดงความคืบหน้าด้านเวลา */}
              <div className="text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">ความคืบหน้าด้านเวลา</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${timeProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm">
                  {passedDays} วัน จาก {totalDays} วัน ({timeProgress}%)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {goalHistory && goalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติเป้าหมายการออกกำลังกาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">วันที่เริ่ม</th>
                    <th className="text-left p-2">วันที่สิ้นสุด</th>
                    <th className="text-left p-2">ประเภทเป้าหมาย</th>
                    <th className="text-left p-2">น้ำหนักเป้าหมาย</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-right p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {goalHistory.map((goal) => (
                    <tr key={goal.fitness_goal_id} className="border-b">
                      <td className="p-2">{formatDate(goal.fitness_goal_startdate)}</td>
                      <td className="p-2">{formatDate(goal.fitness_goal_enddate)}</td>
                      <td className="p-2">{goal.fitness_goal_type}</td>
                      <td className="p-2">{goal.fitness_goal_targetweight ? `${goal.fitness_goal_targetweight} กก.` : "-"}</td>
                      <td className="p-2">{getStatusBadge(goal.fitness_goal_status)}</td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewGoalDetails(goal)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline">ดูประวัติทั้งหมด</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button>สร้างเป้าหมายใหม่</Button>
      </div>
    </div>
  );
}
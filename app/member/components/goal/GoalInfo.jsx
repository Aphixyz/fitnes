"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { changeMemberGoalStatus, deleteMemberGoal } from "@/actions/member/goalActions";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";

export default function GoalInfo({ goalData, currentWeight, onEdit, refreshData }) {
  const [loading, setLoading] = useState(false);

  if (!goalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>เป้าหมายการออกกำลังกาย</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ยังไม่มีเป้าหมายการออกกำลังกาย กรุณาตั้งเป้าหมายของคุณ</p>
        </CardContent>
      </Card>
    );
  }

  // คำนวณความคืบหน้า
  const calculateProgress = () => {
    // ถ้าไม่มีน้ำหนักเป้าหมายหรือน้ำหนักปัจจุบัน ไม่สามารถคำนวณได้
    if (!goalData.target_weight || !currentWeight) {
      return { percentage: 0, remaining: 0 };
    }

    const targetWeight = parseFloat(goalData.fitness_goal_targetweight);
    const initialWeight = parseFloat(goalData.initial_weight || currentWeight);
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
    if ((goalData.goal_type === "ลดน้ำหนัก" && currentWeightValue > targetWeight) ||
        (goalData.goal_type === "เพิ่มน้ำหนัก" && currentWeightValue < targetWeight)) {
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
    const endDate = new Date(goalData.fitness_goal_enddate);
    const today = new Date();
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();

  // คำนวณวันที่ผ่านไป
  const calculatePassedDays = () => {
    const startDate = new Date(goalData.fitness_goal_startdate);
    const today = new Date();
    
    const diffTime = today - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const passedDays = calculatePassedDays();

  // คำนวณวันทั้งหมด
  const calculateTotalDays = () => {
    const startDate = new Date(goalData.fitness_goal_startdate);
    const endDate = new Date(goalData.fitness_goal_enddate);
    
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays);
  };

  const totalDays = calculateTotalDays();
  const timeProgress = Math.min(100, Math.round((passedDays / totalDays) * 100));

  const handleStatusChange = async (status) => {
    if (!confirm(`คุณต้องการเปลี่ยนสถานะเป้าหมายเป็น ${status} ใช่หรือไม่?`)) return;
    
    setLoading(true);
    try {
      const result = await changeMemberGoalStatus(goalData.fitness_goal_id, status, goalData.member_id);
      toast({
        title: "สำเร็จ",
        description: result.message,
        variant: "success",
      });
      if (refreshData) refreshData();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนสถานะเป้าหมายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบเป้าหมายนี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      const result = await deleteMemberGoal(goalData.fitness_goal_id, goalData.member_id);
      toast({
        title: "สำเร็จ",
        description: result.message,
        variant: "success",
      });
      if (refreshData) refreshData();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบเป้าหมายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>เป้าหมายการออกกำลังกาย</CardTitle>
          {getStatusBadge(goalData.fitness_goal_status)}
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
                  <span>{goalData.fitness_goal_type}</span>
                </div>
                
                {goalData.fitness_goal_targetweight && (
                  <div className="flex justify-between py-1">
                    <span className="font-medium">น้ำหนักเป้าหมาย:</span>
                    <span>{goalData.fitness_goal_targetweight} กก.</span>
                  </div>
                )}
                
                {goalData.weight_difference && (
                  <div className="flex justify-between py-1">
                    <span className="font-medium">ต้องการเปลี่ยนแปลง:</span>
                    <span>
                      {goalData.weight_difference > 0 
                        ? `+${goalData.weight_difference} กก.` 
                        : `${goalData.weight_difference} กก.`}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between py-1">
                  <span className="font-medium">ระยะเวลา:</span>
                  <span>{goalData.goal_duration_months} เดือน</span>
                </div>
                
                <div className="flex justify-between py-1">
                  <span className="font-medium">วันที่เริ่มต้น:</span>
                  <span>{formatDate(goalData.fitness_goal_startdate)}</span>
                </div>
                
                <div className="flex justify-between py-1">
                  <span className="font-medium">วันที่สิ้นสุด:</span>
                  <span>{formatDate(goalData.fitness_goal_enddate)}</span>
                </div>
                
                <div className="flex justify-between py-1">
                  <span className="font-medium">วันที่เหลือ:</span>
                  <span>{remainingDays} วัน</span>
                </div>
              </div>
            </div>

            {goalData.fitness_goal_targetmuscle && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">เป้าหมายกล้ามเนื้อ</h3>
                <p className="mt-1">{goalData.fitness_goal_targetmuscle}</p>
              </div>
            )}
            
            {goalData.note && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">บันทึกเพิ่มเติม</h3>
                <p className="mt-1">{goalData.note}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* แสดงความคืบหน้าน้ำหนัก */}
            {(goalData.fitness_goal_type === "ลดน้ำหนัก" || goalData.fitness_goal_type === "เพิ่มน้ำหนัก" || goalData.fitness_goal_type === "คงที่น้ำหนัก") && (
              <div className="text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">ความคืบหน้า</h3>
                <div className="flex justify-center">
                  <ProgressCircle value={progress.percentage} size="large" />
                </div>
                {currentWeight && (
                  <div className="text-center mt-2">
                    <p className="text-sm">น้ำหนักปัจจุบัน: <span className="font-medium">{currentWeight} กก.</span></p>
                    <p className="text-sm">
                      {progress.remaining > 0 
                        ? `ต้อง${goalData.goal_type === "ลดน้ำหนัก" ? "ลด" : "เพิ่ม"}อีก ${progress.remaining} กก.` 
                        : "บรรลุเป้าหมายแล้ว!"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* แสดงความคืบหน้าด้านเวลา */}
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">ความคืบหน้าด้านเวลา</h3>
              <div className="flex justify-center">
                <ProgressCircle value={timeProgress} size="medium" />
              </div>
              <p className="text-sm">
                {passedDays} วัน จาก {totalDays} วัน ({timeProgress}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {goalData.fitness_goal_status === 'active' && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange('completed')} 
              disabled={loading}
            >
              ทำเสร็จแล้ว
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange('cancelled')} 
              disabled={loading}
            >
              ยกเลิก
            </Button>
          </>
        )}
        
        {goalData.fitness_goal_status !== 'active' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleStatusChange('active')} 
            disabled={loading}
          >
            ทำต่อ
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete} 
          disabled={loading}
        >
          ลบ
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => onEdit(goalData)} 
          disabled={loading}
        >
          แก้ไข
        </Button>
      </CardFooter>
    </Card>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Target, Hourglass } from "lucide-react";
import { getFitnessGoalHistory } from "@/actions/member/goal/getFitnessGoal";

// แปลงวันที่เป็นรูปแบบไทย
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// แปลง goal type เป็นภาษาไทย
const getGoalTypeLabel = (goalType) => {
  switch (goalType) {
    case "ลดน้ำหนัก":
      return "Loss";
    case "เพิ่มกล้ามเนื้อ":
      return "Gain";
    case "รักษาหุ่น":
      return "Maintain";
    default:
      return goalType;
  }
};

// แปลง status เป็นภาษาไทย
const getStatusLabel = (status) => {
  switch (status) {
    case "active":
      return "กำลังดำเนินการ";
    case "completed":
      return "สำเร็จแล้ว";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
};

// แสดง icon ตาม status
const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return <Hourglass className="h-4 w-4 text-orange-500" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-black" />;
    default:
      return <Target className="h-4 w-4 text-gray-500" />;
  }
};

export default function GoalHistory({ memberId }) {
  const [goalHistory, setGoalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoalHistory = async () => {
      try {
        setLoading(true);
        const result = await getFitnessGoalHistory(memberId);

        if (result.success) {
          setGoalHistory(result.data || []);
        } else {
          setError("ไม่สามารถโหลดประวัติเป้าหมายได้");
        }
      } catch (err) {
        console.error("Error fetching goal history:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchGoalHistory();
    }
  }, [memberId]);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Goal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">กำลังโหลดประวัติเป้าหมาย...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Goal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!goalHistory || goalHistory.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Goal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">ยังไม่มีประวัติเป้าหมาย</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Goal History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goalHistory.map((goal, index) => {
            // สร้างช่วงวันที่
            const startDate = formatDate(goal.startDate);
            const endDate = goal.endDate ? formatDate(goal.endDate) : "Now";
            const dateRange = goal.endDate
              ? `${startDate} – ${endDate}`
              : `${startDate} – Now`;

            // สร้างข้อมูลน้ำหนัก
            let weightInfo = "ไม่ระบุ";
            if (goal.targetWeight) {
              if (goal.status === "active") {
                // สำหรับ goal ปัจจุบัน แสดงน้ำหนักเป้าหมาย
                weightInfo = `${goal.targetWeight} kg`;
              } else {
                // สำหรับ goal ที่เสร็จแล้ว แสดงเป็น range
                // ใช้ targetWeight เป็นน้ำหนักสุดท้าย และประมาณน้ำหนักเริ่มต้น
                let estimatedStartWeight;
                if (goal.goalType === "ลดน้ำหนัก") {
                  estimatedStartWeight = goal.targetWeight + 5; // เริ่มจากน้ำหนักที่มากกว่า
                } else if (goal.goalType === "เพิ่มกล้ามเนื้อ") {
                  estimatedStartWeight = goal.targetWeight - 3; // เริ่มจากน้ำหนักที่น้อยกว่า
                } else {
                  estimatedStartWeight = goal.targetWeight; // รักษาหุ่น = น้ำหนักเท่าเดิม
                }

                if (estimatedStartWeight === goal.targetWeight) {
                  weightInfo = `${goal.targetWeight} kg`;
                } else {
                  weightInfo = `${estimatedStartWeight} kg to ${goal.targetWeight} kg`;
                }
              }
            }

            const goalTypeLabel = getGoalTypeLabel(goal.goalType);
            const statusIcon = getStatusIcon(goal.status);

            return (
              <div
                key={goal.id || index}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* ช่วงวันที่ */}
                    <p className="text-sm text-gray-500 mb-1">{dateRange}</p>

                    {/* น้ำหนัก */}
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {weightInfo}
                    </p>

                    {/* ประเภทเป้าหมาย */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {goalTypeLabel}
                      </span>
                      {statusIcon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

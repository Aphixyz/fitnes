"use client";

import { useState, useEffect } from "react";
import { getCurrentFitnessGoal } from "@/actions/member/goal/getFitnessGoal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, TrendingUp } from "lucide-react";
import GoalHistory from "./GoalHistory";
import NewGoalButton from "./NewGoalButton";

// Experience Levels
const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "เริ่มต้น",
    description: "เพิ่งออกกำลังกายเป็นประจำ < 6 เดือน",
  },
  {
    value: "intermediate",
    label: "กลาง",
    description: "ออกกำลังกาย 6–24 เดือน",
  },
  {
    value: "advanced",
    label: "ขั้นสูง",
    description: "ออกกำลังกาย > 2 ปี",
  },
];

// Training Frequencies
const TRAINING_FREQUENCIES = [
  {
    value: 0,
    label: "0 วัน/สัปดาห์",
    description: "ไม่ได้ออกกำลังกาย",
  },
  {
    value: 1,
    label: "1-3 วัน/สัปดาห์",
    description: "น้อย",
  },
  {
    value: 2,
    label: "4-6 วัน/สัปดาห์",
    description: "ปานกลาง",
  },
  {
    value: 3,
    label: "7+ วัน/สัปดาห์",
    description: "ทุกวัน",
  },
];

// Activity Levels
const ACTIVITY_LEVELS = [
  {
    value: 0,
    label: "เคลื่อนไหวน้อยมาก",
    description: "นั่งทำงาน ไม่ค่อยออกกำลังกาย",
  },
  {
    value: 1,
    label: "เคลื่อนไหวเล็กน้อย",
    description: "ออกกำลังกายเบา ๆ สัปดาห์ละ 1–3 วัน",
  },
  {
    value: 2,
    label: "ออกกำลังกายปานกลาง",
    description: "ออกกำลังกายหนักปานกลาง 3–5 วันต่อสัปดาห์",
  },
  {
    value: 3,
    label: "ออกกำลังกายหนัก",
    description: "ออกกำลังกายหนักหรือมีกิจกรรมทางกายต่อเนื่องทุกวัน",
  },
];

// Training Times
const TRAINING_TIMES = [
  {
    value: "morning",
    label: "เช้า",
    description: "06:00 – 09:00",
  },
  {
    value: "afternoon",
    label: "กลางวัน",
    description: "10:00 – 14:00",
  },
  {
    value: "evening",
    label: "บ่าย",
    description: "15:00 – 18:00",
  },
  {
    value: "night",
    label: "เย็น",
    description: "18:00 – 21:00",
  },
];

// Goal Types
const GOAL_TYPES = [
  {
    value: "ลดน้ำหนัก",
    label: "ลดน้ำหนัก",
    description: "ลดไขมันและน้ำหนักตัว",
  },
  {
    value: "เพิ่มกล้ามเนื้อ",
    label: "เพิ่มกล้ามเนื้อ",
    description: "เพิ่มมวลกล้ามเนื้อและความแข็งแรง",
  },
  {
    value: "รักษาหุ่น",
    label: "รักษาหุ่น",
    description: "รักษาน้ำหนักและรูปร่างปัจจุบัน",
  },
];

// Desired Timeline
const DESIRED_TIMELINE = [
  {
    value: 0,
    label: "4 สัปดาห์",
    description: "เป้าหมายระยะสั้น",
  },
  {
    value: 1,
    label: "8 สัปดาห์",
    description: "เป้าหมายระยะกลาง",
  },
  {
    value: 2,
    label: "12 สัปดาห์",
    description: "เป้าหมายระยะยาว",
  },
  {
    value: 3,
    label: "16 สัปดาห์",
    description: "เป้าหมายระยะยาวมาก",
  },
];

// Helper functions
const getDaysSinceStart = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function GoalPageClient({ memberId }) {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // โหลดข้อมูลเป้าหมายปัจจุบัน
  const fetchCurrentGoal = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCurrentFitnessGoal(memberId);

      if (result.success) {
        setCurrentGoal(result.data);
      } else {
        setError("ไม่สามารถโหลดข้อมูลเป้าหมายได้");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetchCurrentGoal();
  }, [memberId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">กำลังโหลดข้อมูลเป้าหมาย...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-gray-500 mt-2">กรุณาลองใหม่อีกครั้ง</p>
          </CardContent>
        </Card>

        {/* Goal History Component - แสดงแม้ในกรณี error */}
        <GoalHistory memberId={memberId} />
      </div>
    );
  }

  // ถ้าไม่มี goal ที่ active
  if (!currentGoal) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              เป้าหมายการออกกำลังกาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">
                ยังไม่มีเป้าหมายที่กำลังดำเนินการ
              </p>
              <p className="text-sm text-gray-400 mb-6">
                สร้างเป้าหมายใหม่เพื่อเริ่มต้นการเดินทางสู่สุขภาพที่ดี
              </p>
              <NewGoalButton memberId={memberId} />
            </div>
          </CardContent>
        </Card>

        {/* Goal History Component */}
        <GoalHistory memberId={memberId} />
      </div>
    );
  }

  const daysSinceStart = getDaysSinceStart(currentGoal.startDate);

  // หา goal type label จาก constants
  const goalType = GOAL_TYPES.find((gt) => gt.value === currentGoal.goalType);
  const goalTypeLabel = goalType ? goalType.label : currentGoal.goalType;

  // หา experience level label
  const experienceLevel = EXPERIENCE_LEVELS.find(
    (el) => el.value === currentGoal.experienceLevel
  );
  const experienceLabel = experienceLevel
    ? experienceLevel.label
    : currentGoal.experienceLevel;

  // หา training frequency label
  const trainingFreq = TRAINING_FREQUENCIES.find(
    (tf) => tf.value === currentGoal.trainingFrequency
  );
  const trainingFreqLabel = trainingFreq
    ? trainingFreq.label
    : `${currentGoal.trainingFrequency} ครั้ง/สัปดาห์`;

  // หา training time label
  const trainingTime = TRAINING_TIMES.find(
    (tt) => tt.value === currentGoal.trainingTime
  );
  const trainingTimeLabel = trainingTime
    ? trainingTime.label
    : currentGoal.trainingTime;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              เป้าหมายการออกกำลังกาย
            </CardTitle>
            <NewGoalButton memberId={memberId} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ชื่อเป้าหมาย */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {goalTypeLabel}
              </h3>
              <Badge
                variant={
                  currentGoal.status === "active" ? "default" : "secondary"
                }
              >
                {currentGoal.status === "active"
                  ? "กำลังดำเนินการ"
                  : "เสร็จสิ้น"}
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>

          {/* ระยะเวลา */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">เริ่มต้นเมื่อ</p>
              <p className="font-medium">{formatDate(currentGoal.startDate)}</p>
              <p className="text-xs text-gray-500">
                ผ่านมาแล้ว {daysSinceStart} วัน
              </p>
            </div>
          </div>

          {/* เป้าหมายน้ำหนัก */}
          {currentGoal.targetWeight && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">เป้าหมายน้ำหนัก</p>
                <p className="font-medium text-blue-900">
                  {currentGoal.targetWeight} กิโลกรัม
                </p>
              </div>
            </div>
          )}

          {/* ข้อมูลเพิ่มเติม */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">ความถี่ในการฝึก</p>
              <p className="font-medium">{trainingFreqLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ระดับประสบการณ์</p>
              <p className="font-medium">{experienceLabel}</p>
            </div>
            {currentGoal.trainingTime && (
              <div>
                <p className="text-sm text-gray-600">เวลาฝึก</p>
                <p className="font-medium">{trainingTimeLabel}</p>
              </div>
            )}
            {currentGoal.desiredTime && (
              <div>
                <p className="text-sm text-gray-600">ระยะเวลาที่ต้องการ</p>
                <p className="font-medium">
                  {(() => {
                    const timeline = DESIRED_TIMELINE.find(
                      (dt) => dt.value === currentGoal.desiredTime
                    );
                    return timeline
                      ? timeline.label
                      : `${currentGoal.desiredTime} สัปดาห์`;
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* วันที่สิ้นสุด (ถ้ามี) */}
          {currentGoal.endDate && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">วันที่สิ้นสุดเป้าหมาย</p>
              <p className="font-medium">{formatDate(currentGoal.endDate)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal History Component */}
      <GoalHistory memberId={memberId} />
    </div>
  );
}

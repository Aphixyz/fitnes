"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Target,
  Clock,
  Dumbbell,
  TrendingUp,
} from "lucide-react";

const MemberGoalsView = ({ goalData, memberName = "สมาชิก" }) => {
  // ถ้าไม่มีข้อมูล goals
  if (!goalData) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            ไม่พบเป้าหมายที่กำลังใช้งาน
          </h3>
          <p className="text-gray-500 text-center">
            สมาชิกนี้ยังไม่ได้ตั้งเป้าหมายการออกกำลังกาย
            หรือเป้าหมายทั้งหมดได้สิ้นสุดลงแล้ว
          </p>
        </CardContent>
      </Card>
    );
  }

  // ฟังก์ชันแปลงประเภทเป้าหมาย
  const getGoalTypeDisplay = (type) => {
    const goalTypes = {
      weight_loss: "ลดน้ำหนัก",
      weight_gain: "เพิ่มน้ำหนัก",
      muscle_building: "สร้างกล้ามเนื้อ",
      endurance: "เพิ่มความแข็งแกร่ง",
      general_fitness: "สุขภาพทั่วไป",
    };
    return goalTypes[type] || type;
  };

  // ฟังก์ชันแปลงระดับประสบการณ์
  const getExperienceDisplay = (level) => {
    const levels = {
      beginner: "ผู้เริ่มต้น",
      intermediate: "ระดับกลาง",
      advanced: "ระดับสูง",
    };
    return levels[level] || level;
  };

  // ฟังก์ชันแปลงความถี่การฝึก
  const getFrequencyDisplay = (frequency) => {
    const frequencies = {
      "1-2": "1-2 ครั้ง/สัปดาห์",
      "3-4": "3-4 ครั้ง/สัปดาห์",
      "5-6": "5-6 ครั้ง/สัปดาห์",
      7: "ทุกวัน",
    };
    return frequencies[frequency] || `${frequency} ครั้ง/สัปดาห์`;
  };

  // ฟังก์ชันคำนวณระยะเวลาคงเหลือ
  const calculateDaysRemaining = () => {
    if (!goalData.fitness_goal_enddate) return null;

    const endDate = new Date(goalData.fitness_goal_enddate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              เป้าหมายการออกกำลังกายปัจจุบัน
            </CardTitle>
            <Badge variant="success" className="bg-green-100 text-green-800">
              {goalData.fitness_goal_status === "active"
                ? "กำลังดำเนินการ"
                : goalData.fitness_goal_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ประเภทเป้าหมาย */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">ประเภทเป้าหมาย</p>
                <p className="font-semibold text-gray-900">
                  {getGoalTypeDisplay(goalData.fitness_goal_type)}
                </p>
              </div>
            </div>

            {/* น้ำหนักเป้าหมาย */}
            {goalData.fitness_goal_targetweight && (
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">น้ำหนักเป้าหมาย</p>
                  <p className="font-semibold text-gray-900">
                    {goalData.fitness_goal_targetweight} กก.
                  </p>
                </div>
              </div>
            )}

            {/* ระดับประสบการณ์ */}
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Dumbbell className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">ระดับประสบการณ์</p>
                <p className="font-semibold text-gray-900">
                  {getExperienceDisplay(goalData.fitness_experience_level)}
                </p>
              </div>
            </div>

            {/* ความถี่การฝึก */}
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">ความถี่การฝึก</p>
                <p className="font-semibold text-gray-900">
                  {getFrequencyDisplay(goalData.fitness_training_frequency)}
                </p>
              </div>
            </div>

            {/* เวลาฝึกต่อครั้ง */}
            {goalData.fitness_training_time && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                <Clock className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">เวลาฝึกต่อครั้ง</p>
                  <p className="font-semibold text-gray-900">
                    {goalData.fitness_training_time} นาที
                  </p>
                </div>
              </div>
            )}

            {/* ระยะเวลาที่ต้องการ */}
            {goalData.fitness_desired_time && (
              <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                <CalendarDays className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">ระยะเวลาที่ต้องการ</p>
                  <p className="font-semibold text-gray-900">
                    {goalData.fitness_desired_time} เดือน
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-green-600" />
            ระยะเวลาดำเนินการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* วันที่เริ่มต้น */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">วันที่เริ่มต้น</p>
              <p className="font-semibold text-gray-900">
                {goalData.fitness_goal_startdate
                  ? new Date(
                      goalData.fitness_goal_startdate
                    ).toLocaleDateString("th-TH")
                  : "ไม่ระบุ"}
              </p>
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">วันที่สิ้นสุด</p>
              <p className="font-semibold text-gray-900">
                {goalData.fitness_goal_enddate
                  ? new Date(goalData.fitness_goal_enddate).toLocaleDateString(
                      "th-TH"
                    )
                  : "ไม่ระบุ"}
              </p>
            </div>

            {/* วันคงเหลือ */}
            {daysRemaining !== null && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">วันคงเหลือ</p>
                <p
                  className={`font-semibold ${
                    daysRemaining > 30
                      ? "text-green-600"
                      : daysRemaining > 7
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {daysRemaining > 0 ? `${daysRemaining} วัน` : "หมดเวลาแล้ว"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberGoalsView;

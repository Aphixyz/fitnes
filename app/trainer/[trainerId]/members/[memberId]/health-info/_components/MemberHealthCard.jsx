"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Heart, CalendarDays, User } from "lucide-react";

const MemberHealthCard = ({ healthData }) => {
  if (!healthData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">ไม่พบข้อมูลสุขภาพ</p>
        </CardContent>
      </Card>
    );
  }

  // คำนวณ BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // แปลง activity level
  const getActivityLevel = (level) => {
    const levels = {
      sedentary: "นั่งทำงาน",
      lightly_active: "เคลื่อนไหวเล็กน้อย",
      moderately_active: "เคลื่อนไหวปานกลาง",
      very_active: "เคลื่อนไหวมาก",
      extremely_active: "เคลื่อนไหวหนัก",
    };
    return levels[level] || level;
  };

  // แปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const bmi = calculateBMI(
    healthData.member_health_weight,
    healthData.member_health_height
  );

  return (
    <div className="space-y-6">
      

      {/* Main Health Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Body Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลร่างกาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  น้ำหนัก
                </p>
                <p className="text-2xl font-bold">
                  {healthData.member_health_weight || "-"}{" "}
                  <span className="text-sm font-normal">กก.</span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ส่วนสูง
                </p>
                <p className="text-2xl font-bold">
                  {healthData.member_health_height || "-"}{" "}
                  <span className="text-sm font-normal">ซม.</span>
                </p>
              </div>
            </div>

            {bmi && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">BMI</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{bmi}</p>
                  <Badge
                    variant={
                      parseFloat(bmi) < 18.5
                        ? "secondary"
                        : parseFloat(bmi) < 25
                        ? "default"
                        : parseFloat(bmi) < 30
                        ? "destructive"
                        : "destructive"
                    }
                  >
                    {parseFloat(bmi) < 18.5
                      ? "น้ำหนักน้อย"
                      : parseFloat(bmi) < 25
                      ? "ปกติ"
                      : parseFloat(bmi) < 30
                      ? "น้ำหนักเกิน"
                      : "อ้วน"}
                  </Badge>
                </div>
              </div>
            )}

            {healthData.member_health_bodyfat && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  เปอร์เซ็นต์ไขมัน
                </p>
                <p className="text-xl font-bold">
                  {healthData.member_health_bodyfat}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body Measurements Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รอบวัด (ซม.)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">รอบอก</p>
                <p className="font-semibold">
                  {healthData.member_health_chest || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">รอบเอว</p>
                <p className="font-semibold">
                  {healthData.member_health_waist || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">รอบสะโพก</p>
                <p className="font-semibold">
                  {healthData.member_health_hip || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">รอบแขน</p>
                <p className="font-semibold">
                  {healthData.member_health_arm || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">รอบต้นขา</p>
                <p className="font-semibold">
                  {healthData.member_health_thigh || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Health Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              ข้อมูลเพิ่มเติม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ระดับกิจกรรม
              </p>
              <Badge variant="outline" className="mt-1">
                {getActivityLevel(healthData.member_activity_level)}
              </Badge>
            </div>

            {healthData.member_health_condition && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    <Heart className="h-4 w-4 inline mr-1" />
                    ประวัติสุขภาพ
                  </p>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {healthData.member_health_condition}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberHealthCard;

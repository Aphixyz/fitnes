"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteMemberHealth } from "@/actions/member/health/healthActions";
import { toast } from "@/components/ui/use-toast";
import { formatDate, calculateBMI, getBmiStatus } from "@/utils/utils";

export default function HealthInfo({ healthData, onEdit, refreshData }) {
  const [loading, setLoading] = useState(false);

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสุขภาพ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ยังไม่มีข้อมูลสุขภาพ กรุณาบันทึกข้อมูลสุขภาพของคุณ
          </p>
        </CardContent>
      </Card>
    );
  }

  // คำนวณ BMI จาก utility function แทนการใช้ฟิลด์ในฐานข้อมูล
  const bmi = calculateBMI(
    healthData.member_health_weight,
    healthData.member_health_height
  );
  const bmiStatus = getBmiStatus(bmi);

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบข้อมูลสุขภาพนี้ใช่หรือไม่?")) return;

    setLoading(true);
    try {
      const result = await deleteMemberHealth(
        healthData.member_health_id,
        healthData.member_id
      );
      toast({
        title: "สำเร็จ",
        description: result.message,
        variant: "success",
      });
      if (refreshData) refreshData();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ข้อมูลสุขภาพ</span>
          <span className="text-sm font-normal text-muted-foreground">
            บันทึกเมื่อ: {formatDate(healthData.member_health_measurementdate)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                ข้อมูลพื้นฐาน
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="font-medium">ส่วนสูง:</span>{" "}
                  {healthData.member_health_height
                    ? `${healthData.member_health_height} ซม.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">น้ำหนัก:</span>{" "}
                  {healthData.member_health_weight
                    ? `${healthData.member_health_weight} กก.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">น้ำหนักเริ่มต้น:</span>{" "}
                  {healthData.member_health_initial_weight
                    ? `${healthData.member_health_initial_weight} กก.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">เปอร์เซ็นต์ไขมัน:</span>{" "}
                  {healthData.member_health_bodyfat
                    ? `${healthData.member_health_bodyfat}%`
                    : "-"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                ค่า BMI
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-medium">BMI:</span>
                <span>{bmi || "-"}</span>
                {bmi && (
                  <span className={`text-sm font-medium ${bmiStatus.color}`}>
                    ({bmiStatus.label})
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                ระดับความฟิต
              </h3>
              <div className="mt-1">
                <span>
                  {healthData.member_health_fitness_level === "beginner" &&
                    "เริ่มต้น"}
                  {healthData.member_health_fitness_level === "intermediate" &&
                    "ปานกลาง"}
                  {healthData.member_health_fitness_level === "advanced" &&
                    "ขั้นสูง"}
                  {!healthData.member_health_fitness_level && "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                สัดส่วนร่างกาย
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="font-medium">รอบอก:</span>{" "}
                  {healthData.member_health_chest
                    ? `${healthData.member_health_chest} ซม.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">รอบเอว:</span>{" "}
                  {healthData.member_health_waist
                    ? `${healthData.member_health_waist} ซม.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">รอบสะโพก:</span>{" "}
                  {healthData.member_health_hip
                    ? `${healthData.member_health_hip} ซม.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">รอบแขน:</span>{" "}
                  {healthData.member_health_arm
                    ? `${healthData.member_health_arm} ซม.`
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">รอบต้นขา:</span>{" "}
                  {healthData.member_health_thigh
                    ? `${healthData.member_health_thigh} ซม.`
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(healthData.member_health_condition ||
          healthData.member_health_allergy) && (
          <div className="space-y-2 pt-2 border-t">
            {healthData.member_health_condition && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  โรคประจำตัว/ข้อจำกัดทางสุขภาพ
                </h3>
                <p className="mt-1 text-sm">
                  {healthData.member_health_condition}
                </p>
              </div>
            )}

            {healthData.member_health_allergy && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  การแพ้อาหาร/ยา
                </h3>
                <p className="mt-1 text-sm">
                  {healthData.member_health_allergy}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          ลบ
        </Button>
        <Button size="sm" onClick={() => onEdit(healthData)} disabled={loading}>
          แก้ไข
        </Button>
      </CardFooter>
    </Card>
  );
}

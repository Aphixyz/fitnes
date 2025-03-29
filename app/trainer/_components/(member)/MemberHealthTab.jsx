"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate, calculateBMI, getBmiStatus } from "@/utils/utils";
import { AlertCircle } from "lucide-react";

/**
 * คอมโพเนนต์แสดงข้อมูลสุขภาพของสมาชิก
 * 
 * @param {Object} props
 * @param {string} props.memberId - รหัสสมาชิก
 * @param {Object} props.healthData - ข้อมูลสุขภาพล่าสุด
 * @param {Array} props.healthHistory - ประวัติข้อมูลสุขภาพ
 * @param {Object} props.memberData - ข้อมูลสมาชิก (สำหรับใช้ในการคำนวณ BMI)
 */
export default function MemberHealthTab({ memberId, healthData, healthHistory, memberData }) {
  const [activeHealthData, setActiveHealthData] = useState(healthData);

  // เมื่อคลิกดูรายละเอียดจากประวัติ
  const handleViewHealthDetails = (record) => {
    setActiveHealthData(record);
  };

  // กลับไปดูข้อมูลล่าสุด
  const handleResetToLatest = () => {
    setActiveHealthData(healthData);
  };

  // ถ้าไม่มีข้อมูลสุขภาพ
  if (!healthData && !healthHistory?.length) {
    return (
      <div className="space-y-6">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ไม่พบข้อมูลสุขภาพ</AlertTitle>
          <AlertDescription>
            สมาชิกยังไม่มีข้อมูลสุขภาพที่บันทึกในระบบ การมีข้อมูลสุขภาพจะช่วยให้ท่านออกแบบโปรแกรมการฝึกได้เหมาะสมยิ่งขึ้น
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>บันทึกข้อมูลสุขภาพ</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>บันทึกข้อมูลสุขภาพใหม่</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // คำนวณ BMI จากส่วนสูงและน้ำหนัก
  const bmi = calculateBMI(
    activeHealthData.member_health_weight,
    activeHealthData.member_health_height
  );
  
  // คำนวณ BMI Status
  const bmiStatus = bmi ? getBmiStatus(bmi) : null;

  return (
    <div className="space-y-6">
      {activeHealthData !== healthData && (
        <div className="flex justify-between items-center mb-4">
          <Alert variant="info" className="flex-1 mr-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>กำลังดูข้อมูลย้อนหลัง</AlertTitle>
            <AlertDescription>
              ท่านกำลังดูข้อมูลสุขภาพที่บันทึกเมื่อ {formatDate(activeHealthData.member_health_measurementdate)}
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleResetToLatest}>
            กลับไปดูข้อมูลล่าสุด
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ข้อมูลสุขภาพ</CardTitle>
            <span className="text-sm text-muted-foreground">
              บันทึกเมื่อ: {formatDate(activeHealthData.member_health_measurementdate)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ข้อมูลพื้นฐาน</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="font-medium">ส่วนสูง:</span> {activeHealthData.member_health_height ? `${activeHealthData.member_health_height} ซม.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">น้ำหนัก:</span> {activeHealthData.member_health_weight ? `${activeHealthData.member_health_weight} กก.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">เปอร์เซ็นต์ไขมัน:</span> {activeHealthData.member_health_bodyfat ? `${activeHealthData.member_health_bodyfat}%` : "-"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ค่า BMI</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-medium">BMI:</span>
                  <span>{bmi || "-"}</span>
                  {bmi && bmiStatus && (
                    <span className={`text-sm font-medium ${bmiStatus.color}`}>
                      ({bmiStatus.label})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ระดับความฟิต</h3>
                <div className="mt-1">
                  <span>
                    {activeHealthData.member_health_fitness_level === "beginner" && "เริ่มต้น"}
                    {activeHealthData.member_health_fitness_level === "intermediate" && "ปานกลาง"}
                    {activeHealthData.member_health_fitness_level === "advanced" && "ขั้นสูง"}
                    {!activeHealthData.member_health_fitness_level && "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">สัดส่วนร่างกาย</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="font-medium">รอบอก:</span> {activeHealthData.member_health_chest ? `${activeHealthData.member_health_chest} ซม.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">รอบเอว:</span> {activeHealthData.member_health_waist ? `${activeHealthData.member_health_waist} ซม.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">รอบสะโพก:</span> {activeHealthData.member_health_hip ? `${activeHealthData.member_health_hip} ซม.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">รอบแขน:</span> {activeHealthData.member_health_arm ? `${activeHealthData.member_health_arm} ซม.` : "-"}
                  </div>
                  <div>
                    <span className="font-medium">รอบต้นขา:</span> {activeHealthData.member_health_thigh ? `${activeHealthData.member_health_thigh} ซม.` : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(activeHealthData.member_health_condition || activeHealthData.member_health_allergy) && (
            <div className="space-y-2 pt-2 border-t">
              {activeHealthData.member_health_condition && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">โรคประจำตัว/ข้อจำกัดทางสุขภาพ</h3>
                  <p className="mt-1 text-sm">{activeHealthData.member_health_condition}</p>
                </div>
              )}
              
              {activeHealthData.member_health_allergy && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">การแพ้อาหาร/ยา</h3>
                  <p className="mt-1 text-sm">{activeHealthData.member_health_allergy}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {healthHistory && healthHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติข้อมูลสุขภาพ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">วันที่</th>
                    <th className="text-left p-2">น้ำหนัก (กก.)</th>
                    <th className="text-left p-2">BMI</th>
                    <th className="text-left p-2">ไขมัน (%)</th>
                    <th className="text-right p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {healthHistory.map((record) => {
                    // คำนวณ BMI สำหรับแต่ละรายการในประวัติ
                    const recordBmi = calculateBMI(
                      record.member_health_weight,
                      record.member_health_height
                    );
                    
                    return (
                      <tr key={record.member_health_id} className="border-b">
                        <td className="p-2">{formatDate(record.member_health_measurementdate)}</td>
                        <td className="p-2">{record.member_health_weight || "-"}</td>
                        <td className="p-2">{recordBmi || "-"}</td>
                        <td className="p-2">{record.member_health_bodyfat || "-"}</td>
                        <td className="p-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHealthDetails(record)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
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
        <Button>บันทึกข้อมูลสุขภาพใหม่</Button>
      </div>
    </div>
  );
}
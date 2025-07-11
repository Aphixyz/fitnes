import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";

export default function MetricsLogPage({ params }) {
  const memberId = params.id;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/member/${memberId}/dashboard`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">บันทึกเมตริก</h1>
          <p className="text-gray-600">บันทึกการวัดสัดส่วนร่างกาย</p>
        </div>
      </div>

      {/* Current Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            สัดส่วนปัจจุบัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">22.5%</p>
              <p className="text-xs text-gray-600">ไขมันในร่างกาย</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">75.5%</p>
              <p className="text-xs text-gray-600">มวลกล้ามเนื้อ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Measurements Form */}
      <Card>
        <CardHeader>
          <CardTitle>การวัดสัดส่วน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chest">รอบอก (cm)</Label>
              <Input id="chest" type="number" placeholder="95" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">รอบเอว (cm)</Label>
              <Input id="waist" type="number" placeholder="80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hips">รอบสะโพก (cm)</Label>
              <Input id="hips" type="number" placeholder="95" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thighs">รอบต้นขา (cm)</Label>
              <Input id="thighs" type="number" placeholder="55" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arms">รอบแขน (cm)</Label>
              <Input id="arms" type="number" placeholder="32" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calves">รอบน่อง (cm)</Label>
              <Input id="calves" type="number" placeholder="35" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Composition */}
      <Card>
        <CardHeader>
          <CardTitle>องค์ประกอบร่างกาย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyFat">ไขมันในร่างกาย (%)</Label>
              <Input id="bodyFat" type="number" step="0.1" placeholder="22.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muscleMass">มวลกล้ามเนื้อ (%)</Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                placeholder="75.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">น้ำในร่างกาย (%)</Label>
              <Input id="water" type="number" step="0.1" placeholder="60.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boneMass">มวลกระดูก (kg)</Label>
              <Input id="boneMass" type="number" step="0.1" placeholder="2.8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>เมตริกประสิทธิภาพ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bmi">BMI</Label>
              <Input id="bmi" type="number" step="0.1" placeholder="22.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bmi">BMR (แคลอรี่/วัน)</Label>
              <Input id="bmr" type="number" placeholder="1650" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">ระดับกิจกรรม</Label>
            <select
              id="activityLevel"
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">เลือกระดับกิจกรรม</option>
              <option value="sedentary">นั่งทำงาน (1.2)</option>
              <option value="light">ออกกำลังกายเบา (1.375)</option>
              <option value="moderate">ออกกำลังกายปานกลาง (1.55)</option>
              <option value="active">ออกกำลังกายหนัก (1.725)</option>
              <option value="very_active">ออกกำลังกายหนักมาก (1.9)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Date */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการวัด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="measurementDate">วันที่วัด</Label>
            <Input
              id="measurementDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurementTime">เวลาที่วัด</Label>
            <Input id="measurementTime" type="time" defaultValue="08:00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <textarea
              id="notes"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              placeholder="เช่น หลังตื่นนอน, หลังออกกำลังกาย, ใช้เครื่องวัดแบบไหน..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          บันทึกเป็นร่าง
        </Button>
        <Button className="flex-1">บันทึกเมตริก</Button>
      </div>
    </div>
  );
}

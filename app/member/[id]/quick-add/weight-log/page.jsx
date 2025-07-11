import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default function WeightLogPage({ params }) {
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
          <h1 className="text-2xl font-bold text-gray-900">บันทึกน้ำหนัก</h1>
          <p className="text-gray-600">บันทึกน้ำหนักและสัดส่วนร่างกาย</p>
        </div>
      </div>

      {/* Current Weight Display */}
      <Card>
        <CardHeader>
          <CardTitle>น้ำหนักปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-emerald-600">68.5</span>
              <span className="text-lg text-gray-600">kg</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-green-600">-0.3 kg จากสัปดาห์ที่แล้ว</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>บันทึกน้ำหนักใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">น้ำหนัก (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="68.5"
              className="text-center text-2xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">วันที่วัด</Label>
            <Input
              id="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <textarea
              id="notes"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              placeholder="เช่น หลังอาหารเช้า, หลังออกกำลังกาย..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Body Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>การวัดสัดส่วน (ไม่บังคับ)</CardTitle>
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
              <Label htmlFor="arms">รอบแขน (cm)</Label>
              <Input id="arms" type="number" placeholder="32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">68.5 kg</p>
              <p className="text-sm text-gray-600">เมื่อ 3 วันที่แล้ว</p>
            </div>
            <Badge variant="outline">ปกติ</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">68.8 kg</p>
              <p className="text-sm text-gray-600">เมื่อ 1 สัปดาห์ที่แล้ว</p>
            </div>
            <Badge variant="outline">ปกติ</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">69.2 kg</p>
              <p className="text-sm text-gray-600">เมื่อ 2 สัปดาห์ที่แล้ว</p>
            </div>
            <Badge variant="outline">ปกติ</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          บันทึกเป็นร่าง
        </Button>
        <Button className="flex-1">บันทึกน้ำหนัก</Button>
      </div>
    </div>
  );
}

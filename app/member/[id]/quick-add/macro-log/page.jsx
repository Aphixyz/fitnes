import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MacroLogPage({ params }) {
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
          <h1 className="text-2xl font-bold text-gray-900">บันทึกโภชนาการ</h1>
          <p className="text-gray-600">บันทึกแคลอรี่และสารอาหารวันนี้</p>
        </div>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปวันนี้</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">แคลอรี่ทั้งหมด</span>
            <span className="text-sm text-gray-600">1,200 / 2,000</span>
          </div>
          <Progress value={60} className="h-2" />

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">120g</p>
              <p className="text-xs text-gray-600">โปรตีน</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">150g</p>
              <p className="text-xs text-gray-600">คาร์โบไฮเดรต</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">45g</p>
              <p className="text-xs text-gray-600">ไขมัน</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macro Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มการบันทึก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal">มื้ออาหาร</Label>
            <select
              id="meal"
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">เลือกมื้ออาหาร</option>
              <option value="breakfast">อาหารเช้า</option>
              <option value="lunch">อาหารกลางวัน</option>
              <option value="dinner">อาหารเย็น</option>
              <option value="snack">ของว่าง</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">แคลอรี่</Label>
            <Input id="calories" type="number" placeholder="300" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein">โปรตีน (g)</Label>
              <Input id="protein" type="number" placeholder="25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">คาร์บ (g)</Label>
              <Input id="carbs" type="number" placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">ไขมัน (g)</Label>
              <Input id="fat" type="number" placeholder="10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <textarea
              id="description"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={2}
              placeholder="เช่น ข้าวกล้อง อกไก่ ผัดผัก..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Options */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มแบบรวดเร็ว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-sm font-medium">อาหารเช้า</span>
              <span className="text-xs text-gray-600">~400 แคลอรี่</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-sm font-medium">อาหารกลางวัน</span>
              <span className="text-xs text-gray-600">~600 แคลอรี่</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-sm font-medium">อาหารเย็น</span>
              <span className="text-xs text-gray-600">~500 แคลอรี่</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span className="text-sm font-medium">ของว่าง</span>
              <span className="text-xs text-gray-600">~200 แคลอรี่</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          บันทึกเป็นร่าง
        </Button>
        <Button className="flex-1">บันทึกการกิน</Button>
      </div>
    </div>
  );
}

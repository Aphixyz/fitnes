import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkoutLogPage({ params }) {
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
          <h1 className="text-2xl font-bold text-gray-900">
            บันทึกการออกกำลังกาย
          </h1>
          <p className="text-gray-600">บันทึกเซสชันการฝึกวันนี้</p>
        </div>
      </div>

      {/* Workout Session Selection */}
      <Card>
        <CardHeader>
          <CardTitle>เลือกเซสชันการฝึก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Upper Body Strength</h3>
                <p className="text-sm text-gray-600">ประมาณ 45 นาที</p>
              </div>
              <Badge variant="outline">แนะนำ</Badge>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Lower Body Power</h3>
                <p className="text-sm text-gray-600">ประมาณ 40 นาที</p>
              </div>
              <Badge variant="secondary">เลือกได้</Badge>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Cardio HIIT</h3>
                <p className="text-sm text-gray-600">ประมาณ 30 นาที</p>
              </div>
              <Badge variant="secondary">เลือกได้</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Logging Form */}
      <Card>
        <CardHeader>
          <CardTitle>บันทึกการฝึก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">ระยะเวลา (นาที)</Label>
            <Input id="duration" type="number" placeholder="45" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity">ความเข้มข้น</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                ต่ำ
              </Button>
              <Button variant="outline" size="sm">
                ปานกลาง
              </Button>
              <Button variant="outline" size="sm">
                สูง
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <textarea
              id="notes"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              placeholder="บันทึกความรู้สึกหรือข้อสังเกต..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          บันทึกเป็นร่าง
        </Button>
        <Button className="flex-1">บันทึกเซสชัน</Button>
      </div>
    </div>
  );
}

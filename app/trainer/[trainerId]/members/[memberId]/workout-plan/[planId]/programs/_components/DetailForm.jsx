"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function DetailForm({ program, onProgramChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลโปรแกรมย่อย</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="program_name" className="block text-sm font-medium">
            ชื่อโปรแกรม
          </label>
          <Input
            id="program_name"
            name="program_name"
            value={program.program_name}
            onChange={onProgramChange}
            placeholder="ชื่อโปรแกรมย่อย เช่น วันจันทร์ - อก/ไหล่"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="program_note" className="block text-sm font-medium">
            บันทึกเพิ่มเติม
          </label>
          <Textarea
            id="program_note"
            name="program_note"
            value={program.program_note}
            onChange={onProgramChange}
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมนี้"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import {
  createMemberGoal,
  updateMemberGoal,
} from "@/actions/member/goalActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const goalTypes = [
  { value: "ลดน้ำหนัก", label: "ลดน้ำหนัก" },
  { value: "เพิ่มน้ำหนัก", label: "เพิ่มน้ำหนัก" },
  { value: "เพิ่มกล้ามเนื้อ", label: "เพิ่มกล้ามเนื้อ" },
  { value: "รักษาสุขภาพ", label: "รักษาสุขภาพ" },
  { value: "คงที่น้ำหนัก", label: "คงที่น้ำหนัก" },
];

export default function GoalForm({
  memberId,
  initialData = null,
  currentWeight = null,
}) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: memberId,
    fitness_goal_type:
      initialData?.fitness_goal_type || initialData?.goal_type || "ลดน้ำหนัก",
    fitness_goal_targetweight:
      initialData?.fitness_goal_targetweight ||
      initialData?.target_weight ||
      "",
    weight_difference: initialData?.weight_difference || "",
    fitness_goal_startdate: initialData?.fitness_goal_startdate
      ? new Date(initialData.fitness_goal_startdate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    fitness_goal_enddate: initialData?.fitness_goal_enddate
      ? new Date(initialData.fitness_goal_enddate).toISOString().split("T")[0]
      : new Date(new Date().setMonth(new Date().getMonth() + 3))
          .toISOString()
          .split("T")[0],
    fitness_goal_status:
      initialData?.fitness_goal_status || initialData?.goal_status || "active",
    fitness_goal_note:
      initialData?.fitness_goal_note || initialData?.note || "",
    // ส่วนของเป้าหมายกล้ามเนื้อ จะเก็บเป็นข้อความในฟอร์มก่อน
    muscle_target: initialData?.muscle_target || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // คำนวณความแตกต่างของน้ำหนักอัตโนมัติเมื่อมีการเปลี่ยนน้ำหนักเป้าหมาย
    if (name === "fitness_goal_targetweight" && currentWeight && value) {
      const targetWeight = parseFloat(value);
      const currentWeightValue = parseFloat(currentWeight);
      const difference = targetWeight - currentWeightValue;
      setFormData((prev) => ({
        ...prev,
        weight_difference: difference.toFixed(2),
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // สร้างข้อมูลที่จะส่งไปยังเซิร์ฟเวอร์
      const dataToSubmit = {
        member_id: formData.member_id,
        fitness_goal_type: formData.fitness_goal_type,
        fitness_goal_startdate: formData.fitness_goal_startdate,
        fitness_goal_enddate: formData.fitness_goal_enddate,
        fitness_goal_status: formData.fitness_goal_status,
      };

      // เพิ่มข้อมูลน้ำหนักเป้าหมาย (ถ้ามี)
      if (formData.fitness_goal_targetweight) {
        dataToSubmit.fitness_goal_targetweight = parseFloat(
          formData.fitness_goal_targetweight
        );
      }

      // จัดการกับเป้าหมายกล้ามเนื้อ - เก็บในฟิลด์ note แทน
      if (
        formData.muscle_target &&
        formData.fitness_goal_type === "เพิ่มกล้ามเนื้อ"
      ) {
        dataToSubmit.fitness_goal_targetmuscle =
          "เป้าหมายกล้ามเนื้อ: " + formData.muscle_target;

        if (formData.fitness_goal_note) {
          dataToSubmit.fitness_goal_note += "\n\n" + formData.fitness_goal_note;
        }
      } else if (formData.fitness_goal_note) {
        dataToSubmit.fitness_goal_note = formData.fitness_goal_note;
      }

      let result;
      if (isEditing) {
        result = await updateMemberGoal(
          initialData.fitness_goal_id || initialData.goal_id,
          dataToSubmit
        );
      } else {
        result = await createMemberGoal(dataToSubmit);
      }

      toast({
        title: "สำเร็จ",
        description: result.message,
        variant: "success",
      });

      // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ (สำหรับการสร้างใหม่)
      if (!isEditing) {
        setFormData({
          ...formData,
          fitness_goal_targetweight: "",
          weight_difference: "",
          muscle_target: "",
          fitness_goal_note: "",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing
            ? "แก้ไขเป้าหมายการออกกำลังกาย"
            : "ตั้งเป้าหมายการออกกำลังกาย"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ประเภทเป้าหมาย */}
            <div className="space-y-2">
              <Label htmlFor="fitness_goal_type">ประเภทเป้าหมาย</Label>
              <Select
                value={formData.fitness_goal_type}
                onValueChange={(value) =>
                  handleSelectChange("fitness_goal_type", value)
                }
              >
                <SelectTrigger id="fitness_goal_type">
                  <SelectValue placeholder="เลือกประเภทเป้าหมาย" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md z-50">
                  {goalTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="hover:bg-gray-100"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* น้ำหนักเป้าหมาย */}
            {(formData.fitness_goal_type === "ลดน้ำหนัก" ||
              formData.fitness_goal_type === "เพิ่มน้ำหนัก" ||
              formData.fitness_goal_type === "คงที่น้ำหนัก") && (
              <div className="space-y-2">
                <Label htmlFor="fitness_goal_targetweight">
                  น้ำหนักเป้าหมาย (กก.)
                </Label>
                <Input
                  id="fitness_goal_targetweight"
                  name="fitness_goal_targetweight"
                  type="number"
                  step="0.01"
                  value={formData.fitness_goal_targetweight}
                  onChange={handleChange}
                  placeholder="ระบุน้ำหนักเป้าหมายในหน่วยกิโลกรัม"
                  required
                />
              </div>
            )}

            {/* ความแตกต่างของน้ำหนัก */}
            {(formData.fitness_goal_type === "ลดน้ำหนัก" ||
              formData.fitness_goal_type === "เพิ่มน้ำหนัก") &&
              currentWeight && (
                <div className="space-y-2">
                  <Label htmlFor="weight_difference">
                    ความแตกต่างของน้ำหนัก (กก.)
                  </Label>
                  <Input
                    id="weight_difference"
                    name="weight_difference"
                    type="number"
                    step="0.01"
                    value={formData.weight_difference}
                    onChange={handleChange}
                    placeholder="ความแตกต่างจากน้ำหนักปัจจุบัน"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.weight_difference > 0
                      ? "เพิ่มขึ้น " +
                        Math.abs(formData.weight_difference) +
                        " กก."
                      : formData.weight_difference < 0
                      ? "ลดลง " + Math.abs(formData.weight_difference) + " กก."
                      : ""}
                  </p>
                </div>
              )}

            {/* วันที่เริ่มต้น */}
            <div className="space-y-2">
              <Label htmlFor="fitness_goal_startdate">วันที่เริ่มต้น</Label>
              <Input
                id="fitness_goal_startdate"
                name="fitness_goal_startdate"
                type="date"
                value={formData.fitness_goal_startdate}
                onChange={handleChange}
                required
              />
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="space-y-2">
              <Label htmlFor="fitness_goal_enddate">วันที่สิ้นสุด</Label>
              <Input
                id="fitness_goal_enddate"
                name="fitness_goal_enddate"
                type="date"
                value={formData.fitness_goal_enddate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* เป้าหมายกล้ามเนื้อ */}
          {formData.fitness_goal_type === "เพิ่มกล้ามเนื้อ" && (
            <div className="space-y-2">
              <Label htmlFor="muscle_target">เป้าหมายกล้ามเนื้อ</Label>
              <Textarea
                id="muscle_target"
                name="muscle_target"
                value={formData.muscle_target}
                onChange={handleChange}
                placeholder="ระบุส่วนของร่างกายที่ต้องการเพิ่มกล้ามเนื้อ (เช่น แขน, ขา, หน้าอก)"
                rows={3}
                required
              />
            </div>
          )}

          {/* บันทึกเพิ่มเติม */}
          <div className="space-y-2">
            <Label htmlFor="fitness_goal_note">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="fitness_goal_note"
              name="fitness_goal_note"
              value={formData.fitness_goal_note}
              onChange={handleChange}
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับเป้าหมายของคุณ"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" disabled={loading}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEditing ? "อัพเดต" : "บันทึก"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

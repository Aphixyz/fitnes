"use client";

import { useState } from "react";
import {
  addMemberHealth,
  updateMemberHealth,
} from "@/actions/member/health/healthActions";
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

const fitnessLevels = [
  { value: "beginner", label: "เริ่มต้น" },
  { value: "intermediate", label: "ปานกลาง" },
  { value: "advanced", label: "ขั้นสูง" },
];

export default function HealthForm({ memberId, initialData = null }) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: memberId,
    member_health_weight: initialData?.member_health_weight || "",
    member_health_height: initialData?.member_health_height || "",
    member_health_bodyfat: initialData?.member_health_bodyfat || "",
    member_health_chest: initialData?.member_health_chest || "",
    member_health_waist: initialData?.member_health_waist || "",
    member_health_hip: initialData?.member_health_hip || "",
    member_health_arm: initialData?.member_health_arm || "",
    member_health_thigh: initialData?.member_health_thigh || "",
    member_health_condition: initialData?.member_health_condition || "",
    member_health_allergy: initialData?.member_health_allergy || "",
    member_health_fitness_level:
      initialData?.member_health_fitness_level || "beginner",
    member_health_measurementdate: initialData?.member_health_measurementdate
      ? new Date(initialData.member_health_measurementdate)
          .toISOString()
          .split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numericFields = [
        "member_health_weight",
        "member_health_height",
        "member_health_bodyfat",
        "member_health_chest",
        "member_health_waist",
        "member_health_hip",
        "member_health_arm",
        "member_health_thigh",
      ];

      const dataToSubmit = { ...formData };

      // แปลงข้อมูลให้เป็นตัวเลข
      numericFields.forEach((field) => {
        if (dataToSubmit[field]) {
          dataToSubmit[field] = parseFloat(dataToSubmit[field]);
        }
      });

      // แปลงวันที่ให้เป็นรูปแบบที่ MySQL รองรับ (YYYY-MM-DD)
      if (dataToSubmit.member_health_measurementdate) {
        if (typeof dataToSubmit.member_health_measurementdate === "string") {
          // Do nothing, already in correct format
        } else {
          dataToSubmit.member_health_measurementdate = new Date(
            dataToSubmit.member_health_measurementdate
          )
            .toISOString()
            .split("T")[0];
        }
      }

      let result;
      if (isEditing) {
        result = await updateMemberHealth(
          initialData.member_health_id,
          dataToSubmit
        );
      } else {
        result = await addMemberHealth(dataToSubmit);
      }

      toast({
        title: "สำเร็จ",
        description: result.message,
        variant: "success",
      });

      if (!isEditing) {
        setFormData({
          ...formData,
          member_health_weight: "",
          member_health_bodyfat: "",
          member_health_chest: "",
          member_health_waist: "",
          member_health_hip: "",
          member_health_arm: "",
          member_health_thigh: "",
          member_health_measurementdate: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error saving health data:", error);
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
          {isEditing ? "แก้ไขข้อมูลสุขภาพ" : "บันทึกข้อมูลสุขภาพใหม่"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ส่วนสูง */}
            <div className="space-y-2">
              <Label htmlFor="member_health_height">ส่วนสูง (ซม.)</Label>
              <Input
                id="member_health_height"
                name="member_health_height"
                type="number"
                step="0.01"
                value={formData.member_health_height}
                onChange={handleChange}
                placeholder="ระบุส่วนสูงในหน่วยเซนติเมตร"
                required={!isEditing}
              />
            </div>

            {/* น้ำหนัก */}
            <div className="space-y-2">
              <Label htmlFor="member_health_weight">น้ำหนัก (กก.)</Label>
              <Input
                id="member_health_weight"
                name="member_health_weight"
                type="number"
                step="0.01"
                value={formData.member_health_weight}
                onChange={handleChange}
                placeholder="ระบุน้ำหนักในหน่วยกิโลกรัม"
                required
              />
            </div>

            {/* เปอร์เซ็นต์ไขมัน */}
            <div className="space-y-2">
              <Label htmlFor="member_health_bodyfat">
                เปอร์เซ็นต์ไขมัน (%)
              </Label>
              <Input
                id="member_health_bodyfat"
                name="member_health_bodyfat"
                type="number"
                step="0.01"
                value={formData.member_health_bodyfat}
                onChange={handleChange}
                placeholder="ระบุเปอร์เซ็นต์ไขมัน"
              />
            </div>

            {/* รอบอก */}
            <div className="space-y-2">
              <Label htmlFor="member_health_chest">รอบอก (ซม.)</Label>
              <Input
                id="member_health_chest"
                name="member_health_chest"
                type="number"
                step="0.01"
                value={formData.member_health_chest}
                onChange={handleChange}
                placeholder="ระบุรอบอกในหน่วยเซนติเมตร"
              />
            </div>

            {/* รอบเอว */}
            <div className="space-y-2">
              <Label htmlFor="member_health_waist">รอบเอว (ซม.)</Label>
              <Input
                id="member_health_waist"
                name="member_health_waist"
                type="number"
                step="0.01"
                value={formData.member_health_waist}
                onChange={handleChange}
                placeholder="ระบุรอบเอวในหน่วยเซนติเมตร"
              />
            </div>

            {/* รอบสะโพก */}
            <div className="space-y-2">
              <Label htmlFor="member_health_hip">รอบสะโพก (ซม.)</Label>
              <Input
                id="member_health_hip"
                name="member_health_hip"
                type="number"
                step="0.01"
                value={formData.member_health_hip}
                onChange={handleChange}
                placeholder="ระบุรอบสะโพกในหน่วยเซนติเมตร"
              />
            </div>

            {/* รอบแขน */}
            <div className="space-y-2">
              <Label htmlFor="member_health_arm">รอบแขน (ซม.)</Label>
              <Input
                id="member_health_arm"
                name="member_health_arm"
                type="number"
                step="0.01"
                value={formData.member_health_arm}
                onChange={handleChange}
                placeholder="ระบุรอบแขนในหน่วยเซนติเมตร"
              />
            </div>

            {/* รอบต้นขา */}
            <div className="space-y-2">
              <Label htmlFor="member_health_thigh">รอบต้นขา (ซม.)</Label>
              <Input
                id="member_health_thigh"
                name="member_health_thigh"
                type="number"
                step="0.01"
                value={formData.member_health_thigh}
                onChange={handleChange}
                placeholder="ระบุรอบต้นขาในหน่วยเซนติเมตร"
              />
            </div>

            {/* ระดับความฟิต */}
            <div className="space-y-2">
              <Label htmlFor="member_health_fitness_level">ระดับความฟิต</Label>
              <Select
                value={formData.member_health_fitness_level}
                onValueChange={(value) =>
                  handleSelectChange("member_health_fitness_level", value)
                }
              >
                <SelectTrigger id="member_health_fitness_level">
                  <SelectValue placeholder="เลือกระดับความฟิต" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md z-50">
                  {fitnessLevels.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value}
                      className="hover:bg-gray-100"
                    >
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* วันที่วัด */}
            <div className="space-y-2">
              <Label htmlFor="member_health_measurementdate">วันที่วัด</Label>
              <Input
                id="member_health_measurementdate"
                name="member_health_measurementdate"
                type="date"
                value={formData.member_health_measurementdate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ข้อมูลสุขภาพและการแพ้ */}
          <div className="space-y-2">
            <Label htmlFor="member_health_condition">
              โรคประจำตัว/ข้อจำกัดทางสุขภาพ
            </Label>
            <Textarea
              id="member_health_condition"
              name="member_health_condition"
              value={formData.member_health_condition}
              onChange={handleChange}
              placeholder="ระบุโรคประจำตัวหรือข้อจำกัดทางสุขภาพ (ถ้ามี)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member_health_allergy">การแพ้อาหาร/ยา</Label>
            <Textarea
              id="member_health_allergy"
              name="member_health_allergy"
              value={formData.member_health_allergy}
              onChange={handleChange}
              placeholder="ระบุการแพ้อาหารหรือยา (ถ้ามี)"
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

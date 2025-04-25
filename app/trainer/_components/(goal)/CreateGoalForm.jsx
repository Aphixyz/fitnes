"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  createGoalByTrainer,
  updateGoalByTrainer,
} from "@/actions/trainer/goal/goalManagementAction";
import { AlertCircle } from "lucide-react";

const goalTypes = [
  { value: "ลดน้ำหนัก", label: "ลดน้ำหนัก" },
  { value: "เพิ่มน้ำหนัก", label: "เพิ่มน้ำหนัก" },
  { value: "เพิ่มกล้ามเนื้อ", label: "เพิ่มกล้ามเนื้อ" },
  { value: "รักษาสุขภาพ", label: "รักษาสุขภาพ" },
  { value: "คงที่น้ำหนัก", label: "คงที่น้ำหนัก" },
];

const goalStatuses = [
  { value: "active", label: "กำลังดำเนินการ" },
  { value: "completed", label: "เสร็จสิ้นแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

/**
 * คอมโพเนนต์แบบฟอร์มสร้าง/แก้ไขเป้าหมายการออกกำลังกาย
 *
 * @param {Object} props
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 * @param {string} props.memberId - รหัสสมาชิก
 * @param {Object} props.initialData - ข้อมูลเป้าหมายเดิม (กรณีแก้ไข)
 * @param {number} props.currentWeight - น้ำหนักปัจจุบันของสมาชิก
 * @param {Function} props.onSuccess - ฟังก์ชันเมื่อดำเนินการสำเร็จ
 * @param {Function} props.onCancel - ฟังก์ชันเมื่อยกเลิก
 */
export default function CreateGoalForm({
  trainerId,
  memberId,
  initialData = null,
  currentWeight = null,
  onSuccess,
  onCancel,
}) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    goalType: "",
    startDate: "",
    endDate: "",
    status: "active",
    targetWeight: "",
    targetMuscle: "",
    note: "",
  });

  // โหลดข้อมูลเดิมกรณีแก้ไข
  useEffect(() => {
    if (initialData) {
      setFormData({
        goalType: initialData.fitness_goal_type || "",
        startDate: initialData.fitness_goal_startdate
          ? new Date(initialData.fitness_goal_startdate)
              .toISOString()
              .split("T")[0]
          : "",
        endDate: initialData.fitness_goal_enddate
          ? new Date(initialData.fitness_goal_enddate)
              .toISOString()
              .split("T")[0]
          : "",
        status: initialData.fitness_goal_status || "active",
        targetWeight: initialData.fitness_goal_targetweight || "",
        targetMuscle: initialData.fitness_goal_targetmuscle || "",
        note: initialData.fitness_goal_note || "",
      });
    } else {
      // กรณีสร้างใหม่ ตั้งค่าเริ่มต้น
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(today.getMonth() + 3);

      setFormData({
        goalType: "ลดน้ำหนัก",
        startDate: today.toISOString().split("T")[0],
        endDate: threeMonthsLater.toISOString().split("T")[0],
        status: "active",
        targetWeight: "",
        targetMuscle: "",
        note: "",
      });
    }
  }, [initialData]);

  // จัดการการเปลี่ยนแปลงฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลง Select
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // เตรียมข้อมูลสำหรับส่ง
      const dataToSubmit = {
        trainerId,
        memberId,
        goalType: formData.goalType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        targetWeight: formData.targetWeight
          ? parseFloat(formData.targetWeight)
          : null,
        targetMuscle: formData.targetMuscle,
        note: formData.note,
      };

      let result;
      if (isEditing) {
        // กรณีแก้ไขเป้าหมาย
        result = await updateGoalByTrainer({
          ...dataToSubmit,
          goalId: initialData.fitness_goal_id,
        });
      } else {
        // กรณีสร้างเป้าหมายใหม่
        result = await createGoalByTrainer(dataToSubmit);
      }

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
          variant: "success",
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || "เกิดข้อผิดพลาดในการดำเนินการ");
      console.error("Error submitting goal form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditing
            ? "แก้ไขเป้าหมายการออกกำลังกาย"
            : "สร้างเป้าหมายการออกกำลังกายใหม่"}
        </CardTitle>
      </CardHeader>

      {error && (
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ประเภทเป้าหมาย */}
            <div className="space-y-2">
              <Label htmlFor="goalType">
                ประเภทเป้าหมาย <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.goalType}
                onValueChange={(value) => handleSelectChange("goalType", value)}
                required
              >
                <SelectTrigger id="goalType">
                  <SelectValue placeholder="เลือกประเภทเป้าหมาย" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* สถานะเป้าหมาย (แสดงเฉพาะกรณีแก้ไข) */}
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">
                  สถานะเป้าหมาย <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="เลือกสถานะเป้าหมาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* น้ำหนักเป้าหมาย (แสดงเฉพาะเป้าหมายที่เกี่ยวกับน้ำหนัก) */}
            {(formData.goalType === "ลดน้ำหนัก" ||
              formData.goalType === "เพิ่มน้ำหนัก" ||
              formData.goalType === "คงที่น้ำหนัก") && (
              <div className="space-y-2">
                <Label htmlFor="targetWeight">
                  น้ำหนักเป้าหมาย (กก.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="targetWeight"
                  name="targetWeight"
                  type="number"
                  step="0.01"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  placeholder="ระบุน้ำหนักเป้าหมายในหน่วยกิโลกรัม"
                  required
                />
                {currentWeight && (
                  <p className="text-xs text-muted-foreground">
                    น้ำหนักปัจจุบัน: {currentWeight} กก.
                  </p>
                )}
              </div>
            )}

            {/* เป้าหมายกล้ามเนื้อ (แสดงเฉพาะเป้าหมายเพิ่มกล้ามเนื้อ) */}
            {formData.goalType === "เพิ่มกล้ามเนื้อ" && (
              <div className="space-y-2">
                <Label htmlFor="targetMuscle">
                  เป้าหมายกล้ามเนื้อ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="targetMuscle"
                  name="targetMuscle"
                  value={formData.targetMuscle}
                  onChange={handleChange}
                  placeholder="ระบุส่วนของร่างกายที่ต้องการเพิ่มกล้ามเนื้อ (เช่น แขน, ขา, หน้าอก)"
                  required
                />
              </div>
            )}

            {/* วันที่เริ่มต้น */}
            <div className="space-y-2">
              <Label htmlFor="startDate">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="space-y-2">
              <Label htmlFor="endDate">
                วันที่สิ้นสุด <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* บันทึกเพิ่มเติม */}
          <div className="space-y-2">
            <Label htmlFor="note">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note || ""}
              onChange={handleChange}
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับเป้าหมาย"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "กำลังดำเนินการ..."
              : isEditing
              ? "บันทึกการแก้ไข"
              : "สร้างเป้าหมาย"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

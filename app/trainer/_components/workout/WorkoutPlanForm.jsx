"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createWorkoutPlan,
  updateWorkoutPlan,
} from "@/actions/trainer/workout/workoutPlanActions";
import { getTrainerMembers } from "@/actions/trainer/getTrainerMembers";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const difficultyLevels = [
  { value: "beginner", label: "เริ่มต้น" },
  { value: "intermediate", label: "ปานกลาง" },
  { value: "advanced", label: "ขั้นสูง" },
];

const frequencyOptions = [
  { value: 1, label: "1 วันต่อสัปดาห์" },
  { value: 2, label: "2 วันต่อสัปดาห์" },
  { value: 3, label: "3 วันต่อสัปดาห์" },
  { value: 4, label: "4 วันต่อสัปดาห์" },
  { value: 5, label: "5 วันต่อสัปดาห์" },
  { value: 6, label: "6 วันต่อสัปดาห์" },
  { value: 7, label: "7 วันต่อสัปดาห์" },
];

const weekDays = [
  { id: "1", label: "จันทร์" },
  { id: "2", label: "อังคาร" },
  { id: "3", label: "พุธ" },
  { id: "4", label: "พฤหัสบดี" },
  { id: "5", label: "ศุกร์" },
  { id: "6", label: "เสาร์" },
  { id: "7", label: "อาทิตย์" },
];

export default function WorkoutPlanForm({ trainerId, initialData, memberId }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    trainer_id: trainerId,
    member_id: memberId || "",
    plan_name: initialData?.plan_name || "",
    plan_description: initialData?.plan_description || "",
    plan_startdate: initialData?.plan_startdate
      ? new Date(initialData.plan_startdate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    plan_enddate: initialData?.plan_enddate
      ? new Date(initialData.plan_enddate).toISOString().split("T")[0]
      : "",
    workout_days: initialData?.workout_days || "",
    difficulty_level: initialData?.difficulty_level || "beginner",
    workout_frequency: initialData?.workout_frequency || 3,
    plan_status: initialData?.plan_status || "active",
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);

  // ดึงข้อมูลสมาชิก (ในกรณีที่ไม่ได้ระบุ memberId มา)
  useEffect(() => {
    const fetchMembers = async () => {
      if (memberId) return; // ถ้ามี memberId มาแล้ว ไม่ต้องดึงข้อมูลสมาชิก

      setLoading(true);
      try {
        const result = await getTrainerMembers({
          trainerId,
          status: "active",
          pageSize: 100,
        });

        if (result.success) {
          setMembers(result.members);
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message || "ไม่สามารถดึงข้อมูลสมาชิกได้",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสมาชิกได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [trainerId, memberId]);

  // ตั้งค่าวันออกกำลังกายจากข้อมูลเริ่มต้น
  useEffect(() => {
    if (initialData?.workout_days) {
      const days = initialData.workout_days.split(",").map((day) => day.trim());
      setSelectedDays(days);
    }
  }, [initialData]);

  // จัดการการเปลี่ยนแปลงของฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลงของ Select
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // จัดการการเปลี่ยนแปลงของวันที่ออกกำลังกาย
  const handleDayToggle = (dayId) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((id) => id !== dayId);
      } else {
        return [...prev, dayId].sort();
      }
    });
  };

  // ตรวจสอบข้อมูลฟอร์ม
  const validateForm = () => {
    const newErrors = {};

    if (!formData.plan_name.trim()) {
      newErrors.plan_name = "กรุณาระบุชื่อโปรแกรม";
    }

    if (!formData.member_id) {
      newErrors.member_id = "กรุณาเลือกสมาชิก";
    }

    if (!formData.plan_startdate) {
      newErrors.plan_startdate = "กรุณาระบุวันที่เริ่มต้น";
    }

    if (selectedDays.length === 0) {
      newErrors.workout_days = "กรุณาเลือกวันที่ออกกำลังกายอย่างน้อย 1 วัน";
    }

    // ตรวจสอบว่าวันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น
    if (formData.plan_enddate) {
      const startDate = new Date(formData.plan_startdate);
      const endDate = new Date(formData.plan_enddate);

      if (endDate <= startDate) {
        newErrors.plan_enddate = "วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    // อัพเดต workout_days ในฟอร์มด้วยวันที่เลือก
    const updatedFormData = {
      ...formData,
      workout_days: selectedDays.join(","),
    };

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let result;

      if (isEditing) {
        result = await updateWorkoutPlan(
          initialData.workout_plan_id,
          updatedFormData,
          trainerId
        );
      } else {
        result = await createWorkoutPlan(updatedFormData);
      }

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: isEditing
            ? "อัพเดตโปรแกรมการฝึกสำเร็จ"
            : "สร้างโปรแกรมการฝึกสำเร็จ",
        });

        // นำทางไปหน้าจัดการท่าออกกำลังกายหรือรายการโปรแกรม
        if (isEditing) {
          router.back();
        } else {
          router.push(
            `/trainer/${trainerId}/workout/${result.plan_id}/exercises`
          );
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "แก้ไขโปรแกรมการฝึก" : "สร้างโปรแกรมการฝึกใหม่"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ชื่อโปรแกรม */}
            <div className="space-y-2">
              <Label htmlFor="plan_name">
                ชื่อโปรแกรม <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plan_name"
                name="plan_name"
                value={formData.plan_name}
                onChange={handleChange}
                placeholder="ระบุชื่อโปรแกรม"
                className={errors.plan_name ? "border-red-500" : ""}
              />
              {errors.plan_name && (
                <p className="text-xs text-red-500">{errors.plan_name}</p>
              )}
            </div>

            {/* เลือกสมาชิก */}
            {!memberId && (
              <div className="space-y-2">
                <Label htmlFor="member_id">
                  สมาชิก <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) =>
                    handleSelectChange("member_id", value)
                  }
                  disabled={loading || !!memberId}
                >
                  <SelectTrigger
                    id="member_id"
                    className={errors.member_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="เลือกสมาชิก" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-white shadow-md">
                    {loading ? (
                      <div className="p-2 text-center">กำลังโหลด...</div>
                    ) : members.length === 0 ? (
                      <div className="p-2 text-center">ไม่มีข้อมูลสมาชิก</div>
                    ) : (
                      members.map((member) => (
                        <SelectItem
                          key={member.member_id}
                          value={member.member_id.toString()}
                        >
                          {member.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.member_id && (
                  <p className="text-xs text-red-500">{errors.member_id}</p>
                )}
              </div>
            )}

            {/* ระดับความยาก */}
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">ระดับความยาก</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  handleSelectChange("difficulty_level", value)
                }
              >
                <SelectTrigger id="difficulty_level">
                  <SelectValue placeholder="เลือกระดับความยาก" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white shadow-md">
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ความถี่ในการออกกำลังกาย */}
            <div className="space-y-2">
              <Label htmlFor="workout_frequency">ความถี่ในการออกกำลังกาย</Label>
              <Select
                value={formData.workout_frequency.toString()}
                onValueChange={(value) =>
                  handleSelectChange("workout_frequency", parseInt(value))
                }
              >
                <SelectTrigger id="workout_frequency">
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white shadow-md">
                  {frequencyOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* วันที่เริ่มต้น */}
            <div className="space-y-2">
              <Label htmlFor="plan_startdate">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plan_startdate"
                name="plan_startdate"
                type="date"
                value={formData.plan_startdate}
                onChange={handleChange}
                className={errors.plan_startdate ? "border-red-500" : ""}
              />
              {errors.plan_startdate && (
                <p className="text-xs text-red-500">{errors.plan_startdate}</p>
              )}
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="space-y-2">
              <Label htmlFor="plan_enddate">วันที่สิ้นสุด</Label>
              <Input
                id="plan_enddate"
                name="plan_enddate"
                type="date"
                value={formData.plan_enddate}
                onChange={handleChange}
                className={errors.plan_enddate ? "border-red-500" : ""}
              />
              {errors.plan_enddate && (
                <p className="text-xs text-red-500">{errors.plan_enddate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                หากไม่ระบุ จะถือว่าไม่มีวันสิ้นสุด
              </p>
            </div>
          </div>

          {/* วันที่ออกกำลังกาย */}
          <div className="space-y-4">
            <div>
              <Label>
                วันที่ออกกำลังกาย <span className="text-red-500">*</span>
              </Label>
              {errors.workout_days && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.workout_days}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day.id}
                  className="flex items-center space-x-2 border rounded p-3"
                >
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label
                    htmlFor={`day-${day.id}`}
                    className="cursor-pointer flex-grow text-center"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="space-y-2">
            <Label htmlFor="plan_description">รายละเอียด</Label>
            <Textarea
              id="plan_description"
              name="plan_description"
              value={formData.plan_description}
              onChange={handleChange}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมการฝึก"
              rows={4}
            />
          </div>

          {/* สถานะ */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="plan_status">สถานะ</Label>
              <Select
                value={formData.plan_status}
                onValueChange={(value) =>
                  handleSelectChange("plan_status", value)
                }
              >
                <SelectTrigger id="plan_status">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white shadow-md">
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* คำแนะนำ */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              หลังจากสร้างโปรแกรมการฝึก
              คุณจะสามารถเพิ่มท่าออกกำลังกายได้ในขั้นตอนถัดไป
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "กำลังบันทึก..."
              : isEditing
              ? "อัพเดต"
              : "สร้างโปรแกรม"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { getWorkoutPlanById } from "@/actions/trainer/workout/workoutPlanActions";
import {
  getPlanExercises,
  updatePlanExercise,
  getAllExercises,
} from "@/actions/trainer/workout/workoutExerciseActions";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, DumbbellIcon } from "lucide-react";

export default function EditExercisePage({ params }) {
  const { id: trainerId, planId, exerciseId } = React.use(params);
  const router = useRouter();

  const [plan, setPlan] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const [exerciseInfo, setExerciseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    exercise_day: "",
    sets: 3,
    repetitions: "12",
    rest_seconds: 60,
    weight_kg: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลโปรแกรมการฝึก
        const planResult = await getWorkoutPlanById(planId, trainerId);

        if (!planResult.success) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description:
              planResult.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
            variant: "destructive",
          });
          router.back();
          return;
        }

        setPlan(planResult.plan);

        // ดึงข้อมูลท่าออกกำลังกาย
        const exercisesResult = await getPlanExercises(planId);

        if (!exercisesResult.success) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description:
              exercisesResult.message || "ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้",
            variant: "destructive",
          });
          router.back();
          return;
        }

        // หาข้อมูลท่าออกกำลังกายที่ต้องการแก้ไข
        const exercise = exercisesResult.exercises.find(
          (ex) => ex.workout_exercise_id.toString() === exerciseId
        );

        if (!exercise) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่พบข้อมูลท่าออกกำลังกาย",
            variant: "destructive",
          });
          router.back();
          return;
        }

        setExerciseDetails(exercise);

        // ตั้งค่า formData จากข้อมูลที่มี
        setFormData({
          exercise_day: exercise.exercise_day || "none",
          sets: exercise.sets || 3,
          repetitions: exercise.repetitions || "12",
          rest_seconds: exercise.rest_seconds || 60,
          weight_kg: exercise.weight_kg || "",
          notes: exercise.notes || "",
        });

        // ดึงข้อมูลท่าออกกำลังกายทั้งหมด
        const allExercisesResult = await getAllExercises();

        if (allExercisesResult.success) {
          // หาข้อมูลท่าออกกำลังกายจากรายการทั้งหมด
          const exerciseData = allExercisesResult.exercises.find(
            (ex) => ex.id === exercise.exercise_id
          );

          if (exerciseData) {
            setExerciseInfo(exerciseData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลได้",
          variant: "destructive",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, planId, exerciseId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getDayName = (dayId) => {
    const dayNames = {
      1: "จันทร์",
      2: "อังคาร",
      3: "พุธ",
      4: "พฤหัสบดี",
      5: "ศุกร์",
      6: "เสาร์",
      7: "อาทิตย์",
      none: "ไม่ระบุวัน",
    };
    return dayNames[dayId] || dayId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const result = await updatePlanExercise(exerciseId, formData);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "อัพเดตท่าออกกำลังกายสำเร็จ",
        });
        router.push(`/trainer/${trainerId}/members/[memberId]/workout-plan/${planId}`);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดตท่าออกกำลังกายได้",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            กำลังโหลดข้อมูล...
          </h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan || !exerciseDetails) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            แก้ไขท่าออกกำลังกาย
          </h1>
          <p className="text-muted-foreground">
            สำหรับโปรแกรม: {plan.plan_name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> ย้อนกลับ
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DumbbellIcon className="h-5 w-5 mr-2" />
              {exerciseDetails.exercise_name}
            </CardTitle>
            {exerciseDetails.exercise_description && (
              <CardDescription>
                {exerciseDetails.exercise_description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* เลือกวัน */}
              <div className="space-y-2">
                <Label htmlFor="exercise_day">วัน</Label>
                <Select
                  value={formData.exercise_day}
                  onValueChange={(value) =>
                    handleSelectChange("exercise_day", value)
                  }
                >
                  <SelectTrigger id="exercise_day">
                    <SelectValue placeholder="เลือกวัน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุวัน</SelectItem>
                    {plan.workout_days &&
                      plan.workout_days.split(",").map((day) => (
                        <SelectItem key={day} value={day}>
                          {getDayName(day)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* จำนวนเซต */}
              <div className="space-y-2">
                <Label htmlFor="sets">จำนวนเซต</Label>
                <Input
                  id="sets"
                  name="sets"
                  type="number"
                  min="1"
                  value={formData.sets}
                  onChange={handleChange}
                />
              </div>

              {/* จำนวนครั้ง */}
              <div className="space-y-2">
                <Label htmlFor="repetitions">
                  จำนวนครั้ง/เซต
                  <span className="text-xs text-muted-foreground ml-2">
                    (ตัวอย่าง: "12" หรือ "12-15" หรือ "10,8,6")
                  </span>
                </Label>
                <Input
                  id="repetitions"
                  name="repetitions"
                  value={formData.repetitions}
                  onChange={handleChange}
                  placeholder="เช่น 12 หรือ 12-15"
                />
              </div>

              {/* พักระหว่างเซต */}
              <div className="space-y-2">
                <Label htmlFor="rest_seconds">พักระหว่างเซต (วินาที)</Label>
                <Input
                  id="rest_seconds"
                  name="rest_seconds"
                  type="number"
                  value={formData.rest_seconds}
                  onChange={handleChange}
                />
              </div>

              {/* น้ำหนัก */}
              <div className="space-y-2">
                <Label htmlFor="weight_kg">
                  น้ำหนัก (กก.)
                  <span className="text-xs text-muted-foreground ml-2">
                    (ตัวอย่าง: "15" หรือ "20,18,15")
                  </span>
                </Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  placeholder="เช่น 15 หรือ 20,18,15"
                />
              </div>
            </div>

            {/* บันทึกเพิ่มเติม */}
            <div className="space-y-2">
              <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="รายละเอียดเพิ่มเติมหรือคำแนะนำในการออกกำลังกาย"
                rows={3}
              />
            </div>

            {/* แสดงข้อมูลเพิ่มเติมของท่าออกกำลังกาย */}
            {exerciseInfo && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-medium mb-2">
                  ข้อมูลท่าออกกำลังกาย
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">กลุ่มกล้ามเนื้อ:</span>{" "}
                    <span className="text-muted-foreground">
                      {exerciseInfo.muscle_groups?.join(", ") || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">อุปกรณ์:</span>{" "}
                    <span className="text-muted-foreground">
                      {exerciseInfo.equipment?.join(", ") || "ไม่ใช้อุปกรณ์"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ระดับความยาก:</span>{" "}
                    <span className="text-muted-foreground">
                      {exerciseInfo.difficulty === "beginner"
                        ? "เริ่มต้น"
                        : exerciseInfo.difficulty === "intermediate"
                        ? "ปานกลาง"
                        : exerciseInfo.difficulty === "advanced"
                        ? "ขั้นสูง"
                        : exerciseInfo.difficulty || "เริ่มต้น"}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
              {submitting ? "กำลังบันทึก..." : "อัพเดทท่าออกกำลังกาย"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

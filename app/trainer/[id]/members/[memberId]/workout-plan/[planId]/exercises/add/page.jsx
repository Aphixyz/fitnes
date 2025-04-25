"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkoutPlanById } from "@/actions/trainer/workout/workoutv1/workoutPlanActions";
import { addExerciseToPlan } from "@/actions/trainer/workout/workoutv1/workoutExerciseActions";
import { toast } from "@/components/ui/use-toast";
import ExercisePicker from "@/app/trainer/_components/workout/ExercisePicker";
import { DumbbellIcon, ChevronLeft } from "lucide-react";

export default function AddExercisePage({ params }) {
  const { id: trainerId, planId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const day = searchParams.get("day") || "none";

  const [plan, setPlan] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    workout_plan_id: planId,
    exercise_id: "",
    exercise_day: day,
    sets: 3,
    repetitions: "12",
    rest_seconds: 60,
    weight_kg: "",
    notes: "",
  });

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const result = await getWorkoutPlanById(planId, trainerId);

        if (result.success) {
          setPlan(result.plan);
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
            variant: "destructive",
          });
          router.back();
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
          variant: "destructive",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, trainerId, router]);

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setFormData((prev) => ({
      ...prev,
      exercise_id: exercise.id,
    }));
  };

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

    if (!formData.exercise_id) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกท่าออกกำลังกาย",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await addExerciseToPlan(formData);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "เพิ่มท่าออกกำลังกายสำเร็จ",
        });
        router.push(
          `/trainer/${trainerId}/members/[memberId]/workout-plan/${planId}`
        );
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มท่าออกกำลังกายได้",
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

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            เพิ่มท่าออกกำลังกาย
          </h1>
          <p className="text-muted-foreground">
            สำหรับโปรแกรม: {plan.plan_name} - {getDayName(day)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" /> ย้อนกลับ
        </Button>
      </div>

      <Tabs defaultValue="select">
        <TabsList>
          <TabsTrigger value="select">เลือกท่าออกกำลังกาย</TabsTrigger>
          {selectedExercise && (
            <TabsTrigger value="details">ตั้งค่าการออกกำลังกาย</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="select" className="space-y-4 mt-4">
          <ExercisePicker onSelect={handleExerciseSelect} />
        </TabsContent>

        {selectedExercise && (
          <TabsContent value="details" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DumbbellIcon className="h-5 w-5 mr-2" />
                    {selectedExercise.thai_name || selectedExercise.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedExercise.description}
                  </CardDescription>
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
                      <Label htmlFor="rest_seconds">
                        พักระหว่างเซต (วินาที)
                      </Label>
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
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <h3 className="text-sm font-medium mb-2">
                      ข้อมูลท่าออกกำลังกาย
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">กลุ่มกล้ามเนื้อ:</span>{" "}
                        <span className="text-muted-foreground">
                          {selectedExercise.muscle_groups?.join(", ") || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">อุปกรณ์:</span>{" "}
                        <span className="text-muted-foreground">
                          {selectedExercise.equipment?.join(", ") ||
                            "ไม่ใช้อุปกรณ์"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">ระดับความยาก:</span>{" "}
                        <span className="text-muted-foreground">
                          {selectedExercise.difficulty === "beginner"
                            ? "เริ่มต้น"
                            : selectedExercise.difficulty === "intermediate"
                            ? "ปานกลาง"
                            : selectedExercise.difficulty === "advanced"
                            ? "ขั้นสูง"
                            : selectedExercise.difficulty || "เริ่มต้น"}
                        </span>
                      </div>
                    </div>
                  </div>
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
                    {submitting ? "กำลังบันทึก..." : "เพิ่มท่าออกกำลังกาย"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

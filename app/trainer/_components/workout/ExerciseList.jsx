"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  deletePlanExercise,
  moveExerciseToDay,
} from "@/actions/trainer/workout/workoutv1/workoutExerciseActions";

export default function ExerciseList({
  exercises,
  groupedByDay,
  planId,
  trainerId,
  workoutDays,
  onRefresh,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    Object.keys(groupedByDay)[0] || "none"
  );

  // แปลงรหัสวันเป็นชื่อวัน
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

  // จัดเรียงวันตามลำดับ
  const sortedDays = () => {
    const days = Object.keys(groupedByDay);
    return days.sort((a, b) => {
      if (a === "none") return -1;
      if (b === "none") return 1;
      return parseInt(a) - parseInt(b);
    });
  };

  // ลบท่าออกกำลังกาย
  const handleDeleteExercise = async (exerciseId) => {
    if (!confirm("คุณต้องการลบท่าออกกำลังกายนี้ใช่หรือไม่?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deletePlanExercise(exerciseId, planId);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบท่าออกกำลังกายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขท่าออกกำลังกาย
  const handleEditExercise = (exerciseId) => {
    router.push(
      `/trainer/${trainerId}/workouts/${planId}/exercises/${exerciseId}`
    );
  };

  // ย้ายท่าออกกำลังกายไปวันอื่น
  const handleMoveToDay = async (exerciseId, newDay) => {
    setLoading(true);
    try {
      const result = await moveExerciseToDay(exerciseId, newDay, planId);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error moving exercise:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถย้ายท่าออกกำลังกายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // แสดงเมนูย้ายท่าออกกำลังกาย
  const renderMoveMenu = (exercise) => {
    // กรองวันที่มีในโปรแกรม แต่ไม่ใช่วันปัจจุบัน
    const availableDays = workoutDays?.split(",") || [];
    const currentDay = exercise.exercise_day || "none";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoveVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled
            className="text-xs text-muted-foreground py-2"
          >
            ย้ายไปวัน:
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {availableDays.map((day) => (
            <DropdownMenuItem
              key={day}
              disabled={day === currentDay || loading}
              onClick={() => handleMoveToDay(exercise.workout_exercise_id, day)}
              className="cursor-pointer"
            >
              {getDayName(day)}
            </DropdownMenuItem>
          ))}
          {currentDay !== "none" && (
            <DropdownMenuItem
              onClick={() =>
                handleMoveToDay(exercise.workout_exercise_id, "none")
              }
              disabled={loading}
              className="cursor-pointer"
            >
              ไม่ระบุวัน
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      {exercises && exercises.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:flex">
            {sortedDays().map((day) => (
              <TabsTrigger
                key={day}
                value={day}
                className="text-center whitespace-nowrap"
              >
                {getDayName(day)}
              </TabsTrigger>
            ))}
          </TabsList>

          {sortedDays().map((day) => (
            <TabsContent key={day} value={day} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>ท่าออกกำลังกาย - {getDayName(day)}</span>
                    <Button
                      onClick={() =>
                        router.push(
                          `/trainer/${trainerId}/members/[memberId]/workout-plan/${planId}/exercises/add?day=${day}`
                        )
                      }
                    >
                      เพิ่มท่าออกกำลังกาย
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {groupedByDay[day]?.length || 0} ท่า
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupedByDay[day]?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ลำดับ</TableHead>
                          <TableHead>ท่าออกกำลังกาย</TableHead>
                          <TableHead>จำนวนเซต</TableHead>
                          <TableHead>จำนวนครั้ง/เซต</TableHead>
                          <TableHead>น้ำหนัก</TableHead>
                          <TableHead>พัก</TableHead>
                          <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByDay[day].map((exercise, index) => (
                          <TableRow key={exercise.workout_exercise_id}>
                            <TableCell>
                              {exercise.exercise_order || index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{exercise.exercise_name}</span>
                                {exercise.equipment &&
                                  exercise.equipment.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      อุปกรณ์: {exercise.equipment.join(", ")}
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>{exercise.sets || "-"}</TableCell>
                            <TableCell>{exercise.repetitions || "-"}</TableCell>
                            <TableCell>{exercise.weight_kg || "-"}</TableCell>
                            <TableCell>
                              {exercise.rest_seconds
                                ? `${exercise.rest_seconds} วินาที`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-1">
                                {renderMoveMenu(exercise)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleEditExercise(
                                      exercise.workout_exercise_id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteExercise(
                                      exercise.workout_exercise_id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      ยังไม่มีท่าออกกำลังกายในวันนี้
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push(
                        `/trainer/${trainerId}/members/[memberId]/workout-plan/${planId}/exercises/add?day=${day}`
                      )
                    }
                  >
                    เพิ่มท่าออกกำลังกาย
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>ท่าออกกำลังกาย</CardTitle>
            <CardDescription>
              ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="mb-4 text-muted-foreground">
                คุณยังไม่ได้เพิ่มท่าออกกำลังกายในโปรแกรมนี้
              </p>
              <Button
                onClick={() =>
                  router.push(
                    `/trainer/${trainerId}/members/[memberId]/workout-plan/${planId}/exercises/add`
                  )
                }
              >
                เพิ่มท่าออกกำลังกาย
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

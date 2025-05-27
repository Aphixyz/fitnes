"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getThaiDays } from "@/utils/utils";

// Import deleteWorkoutExercise function from actions
import { deleteWorkoutExercise } from "@/schemas/workoutv2/Workout-Exercises-Management/deleteWorkoutExercise";

/**
 * Component สำหรับแสดงรายการท่าออกกำลังกาย
 * @param {Object} props
 * @param {Array} props.exercises - รายการท่าออกกำลังกายทั้งหมด
 * @param {Object} props.groupedByDay - ท่าออกกำลังกายจัดกลุ่มตามวัน
 * @param {string} props.planId - รหัสแผนการออกกำลังกาย
 * @param {string} props.trainerId - รหัสเทรนเนอร์
 * @param {string} props.workoutDays - วันที่ออกกำลังกาย (เป็น string คั่นด้วย comma)
 * @param {Function} props.onRefresh - callback เมื่อข้อมูลมีการเปลี่ยนแปลง
 * @param {string} props.memberId - รหัสสมาชิก
 */
export default function ExerciseList({
  exercises,
  groupedByDay,
  planId,
  trainerId,
  workoutDays,
  onRefresh,
  memberId,
}) {
  const router = useRouter();
  // ใช้ utility function getThaiDays
  const thaiDays = getThaiDays();
  const dayNames = {
    1: `วัน${thaiDays[0]}`,
    2: `วัน${thaiDays[1]}`,
    3: `วัน${thaiDays[2]}`,
    4: `วัน${thaiDays[3]}`,
    5: `วัน${thaiDays[4]}`,
    6: `วัน${thaiDays[5]}`,
    7: `วัน${thaiDays[6]}`,
    none: "ไม่ระบุวัน",
  };

  // ฟังก์ชั่นสำหรับลบท่าออกกำลังกาย
  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm("คุณต้องการลบท่าออกกำลังกายนี้ใช่หรือไม่?")) {
      try {
        // ส่งข้อมูลไปยัง server action พร้อม trainer_id
        const response = await deleteWorkoutExercise({
          workout_exercise_id: exerciseId,
          trainer_id: Number(trainerId),
        });

        if (response.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบท่าออกกำลังกายเรียบร้อยแล้ว",
          });
          // เรียก callback เพื่อโหลดข้อมูลใหม่หลังจากลบสำเร็จ
          onRefresh();
        } else {
          throw new Error(
            response.message || "เกิดข้อผิดพลาดในการลบท่าออกกำลังกาย"
          );
        }
      } catch (error) {
        console.error("Error deleting exercise:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถลบท่าออกกำลังกายได้",
          variant: "destructive",
        });
      }
    }
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ท่าออกกำลังกาย</CardTitle>
          <CardDescription>
            โปรแกรมนี้ยังไม่มีท่าออกกำลังกาย คุณสามารถเพิ่มท่าออกกำลังกายได้
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">
            ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
          </p>
          <Link
            href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/exercises/add`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มท่าออกกำลังกาย
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // ตรวจสอบว่ามี groupedByDay หรือไม่
  if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ท่าออกกำลังกาย</CardTitle>
          <CardDescription>
            พบท่าออกกำลังกาย {exercises.length} ท่า
            แต่ไม่สามารถจัดกลุ่มตามวันได้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ไม่สามารถแสดงท่าออกกำลังกายตามวันได้
              กรุณาลองโหลดหน้านี้ใหม่อีกครั้ง
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Link
              href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/exercises/add`}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มท่าออกกำลังกาย
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // จัดเรียงวัน
  const daysOrder = ["1", "2", "3", "4", "5", "6", "7", "none"];
  const sortedDays = Object.keys(groupedByDay).sort(
    (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          ท่าออกกำลังกายทั้งหมด ({exercises.length} ท่า)
        </h2>
        <Link
          href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/exercises/add`}
        >
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มท่าออกกำลังกาย
          </Button>
        </Link>
      </div>

      {sortedDays.map((day) => (
        <Card key={day} className="overflow-hidden">
          <CardHeader className="bg-slate-50 py-3">
            <CardTitle className="text-lg font-medium">
              {dayNames[day]}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "40%" }}>ท่าออกกำลังกาย</TableHead>
                  <TableHead>เซต/ครั้ง</TableHead>
                  <TableHead>น้ำหนัก</TableHead>
                  <TableHead>พัก</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedByDay[day].map((exercise) => (
                  <TableRow key={exercise.workout_exercise_id}>
                    <TableCell className="font-medium">
                      {exercise.exercise_name}
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {exercise.sets} x {exercise.repetitions || "-"}
                    </TableCell>
                    <TableCell>
                      {exercise.weight_kg ? `${exercise.weight_kg} กก.` : "-"}
                    </TableCell>
                    <TableCell>
                      {exercise.rest_seconds
                        ? `${exercise.rest_seconds} วินาที`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/exercises/${exercise.workout_exercise_id}`}
                        >
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() =>
                            handleDeleteExercise(exercise.workout_exercise_id)
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

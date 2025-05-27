"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { updateWorkoutPlanStatus } from "@/schemas/workoutv2/Workout-Plan-Management/updateWorkoutPlanStatus";
import { deleteWorkoutPlan } from "@/schemas/workoutv2/Workout-Plan-Management/deleteWorkoutPlan";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Archive,
} from "lucide-react";

export default function WorkoutPlanTable({ plans, trainerId, memberId }) {
  const router = useRouter();
  const [modifiedPlans, setModifiedPlans] = useState(plans);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">ใช้งาน</Badge>;
      case "inactive":
        return <Badge variant="outline">ไม่ใช้งาน</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">เสร็จสิ้น</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      // เรียกใช้ updateWorkoutPlanStatus สำหรับทุกสถานะ
      const result = await updateWorkoutPlanStatus(
        planId,
        trainerId,
        newStatus
      );

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });

        // อัพเดตสถานะในรายการ
        setModifiedPlans(
          modifiedPlans.map((plan) =>
            plan.workout_plan_id === planId
              ? { ...plan, plan_status: newStatus }
              : plan
          )
        );

        // รีเฟรชหน้าเพื่อให้แสดงข้อมูลล่าสุด
        router.refresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing plan status:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะแผนได้",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่ต้องการลบแผนออกกำลังกายนี้?")) {
      return;
    }

    try {
      // ใช้ deleteWorkoutPlan ซึ่งรับพารามิเตอร์เป็นออบเจ็กต์
      const result = await deleteWorkoutPlan({
        workout_plan_id: planId,
        trainer_id: Number(trainerId),
        force_delete: false, // ไม่บังคับลบข้อมูลที่เกี่ยวข้อง
      });

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });

        // ลบแผนออกจากรายการ
        setModifiedPlans(
          modifiedPlans.filter((plan) => plan.workout_plan_id !== planId)
        );

        // รีเฟรชหน้าเพื่อให้แสดงข้อมูลล่าสุด
        router.refresh();
      } else {
        // กรณีมีข้อมูลการบันทึกผลการออกกำลังกายที่เชื่อมโยง
        if (result.error === "has_related_data" && result.has_logs) {
          if (
            confirm(
              `แผนนี้มีการบันทึกผลการออกกำลังกาย ${result.log_count} รายการที่เกี่ยวข้อง ต้องการลบทั้งหมดหรือไม่?`
            )
          ) {
            // ลองลบอีกครั้งโดยบังคับลบ
            const forceResult = await deleteWorkoutPlan({
              workout_plan_id: planId,
              trainer_id: Number(trainerId),
              force_delete: true, // บังคับลบข้อมูลที่เกี่ยวข้อง
            });

            if (forceResult.success) {
              toast({
                title: "สำเร็จ",
                description:
                  "ลบแผนการออกกำลังกายและข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ",
              });

              // ลบแผนออกจากรายการ
              setModifiedPlans(
                modifiedPlans.filter((plan) => plan.workout_plan_id !== planId)
              );

              // รีเฟรชหน้าเพื่อให้แสดงข้อมูลล่าสุด
              router.refresh();
            } else {
              toast({
                title: "เกิดข้อผิดพลาด",
                description: forceResult.message,
                variant: "destructive",
              });
            }
          }
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบแผนออกกำลังกายได้",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ชื่อแผน</TableHead>
          <TableHead>วันที่เริ่มต้น</TableHead>
          <TableHead>วันที่สิ้นสุด</TableHead>
          <TableHead>จำนวนวันฝึก/สัปดาห์</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="text-right">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modifiedPlans.map((plan) => (
          <TableRow key={plan.workout_plan_id}>
            <TableCell className="font-medium">
              <Link
                href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${plan.workout_plan_id}`}
                className="hover:underline"
              >
                {plan.plan_name}
              </Link>
            </TableCell>
            <TableCell>
              {new Date(plan.plan_startdate).toLocaleDateString("th-TH")}
            </TableCell>
            <TableCell>
              {plan.plan_enddate
                ? new Date(plan.plan_enddate).toLocaleDateString("th-TH")
                : "-"}
            </TableCell>
            <TableCell>
              {plan.workout_days
                ? plan.workout_days.split(",").length
                : "ไม่ระบุ"}
            </TableCell>
            <TableCell>{getStatusBadge(plan.plan_status)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">เปิดเมนู</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/trainer/${trainerId}/members/${memberId}/workout-plan/${plan.workout_plan_id}`
                      )
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    ดูรายละเอียด
                  </DropdownMenuItem>

                  {plan.plan_status !== "completed" && (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/trainer/${trainerId}/members/${memberId}/workout-plan/${plan.workout_plan_id}/edit`
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* แสดงเมนูเปลี่ยนสถานะเฉพาะเมื่อแผนไม่ใช่สถานะ completed */}
                  {plan.plan_status !== "completed" && (
                    <>
                      {plan.plan_status !== "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(plan.workout_plan_id, "active")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          เปิดใช้งาน
                        </DropdownMenuItem>
                      )}

                      {plan.plan_status !== "inactive" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(plan.workout_plan_id, "inactive")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          ปิดใช้งาน
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(plan.workout_plan_id, "completed")
                        }
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        ทำเครื่องหมายว่าเสร็จสิ้น
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeletePlan(plan.workout_plan_id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    ลบแผน
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

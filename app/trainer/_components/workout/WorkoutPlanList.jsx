"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/utils";
import {
  ChevronDown,
  Edit,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  changeWorkoutPlanStatus,
  deleteWorkoutPlan,
} from "@/actions/trainer/workout/workoutv1/workoutPlanActions";
import CreateWorkoutButton from "@/app/trainer/_components/workout/CreateWorkoutButton";

export default function WorkoutPlanList({
  plans,
  trainerId,
  memberId,
  showMember = true,
  onRefresh,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (planId, newStatus) => {
    try {
      setLoading(true);
      const result = await changeWorkoutPlanStatus(
        planId,
        newStatus,
        trainerId
      );

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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะโปรแกรมได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("คุณต้องการลบโปรแกรมการฝึกนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteWorkoutPlan(planId, trainerId);

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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโปรแกรมได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePlan = (planId) => {
    router.push(`/trainer/${trainerId}/workout/duplicate/${planId}`);
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">ยังไม่มีโปรแกรมการฝึก</p>
          <CreateWorkoutButton trainerId={trainerId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>โปรแกรมการฝึก</CardTitle>
            <CardDescription>รายการโปรแกรมการฝึกทั้งหมด</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ลำดับ</TableHead>
                <TableHead>ชื่อโปรแกรม</TableHead>
                {showMember && <TableHead>สมาชิก</TableHead>}
                <TableHead>จำนวนท่า</TableHead>
                <TableHead>วันที่เริ่มต้น</TableHead>
                <TableHead>วันที่สิ้นสุด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan, index) => (
                <TableRow key={plan.workout_plan_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/trainer/${trainerId}/members/${plan.member_id}/workout-plan/${plan.workout_plan_id}`}
                      className="font-medium hover:underline"
                    >
                      {plan.plan_name}
                    </Link>
                  </TableCell>
                  {showMember && (
                    <TableCell>{plan.member_name || "-"}</TableCell>
                  )}
                  <TableCell>{plan.exercise_count || 0} ท่า</TableCell>
                  <TableCell>
                    {plan.plan_startdate
                      ? formatDate(plan.plan_startdate)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {plan.plan_enddate ? formatDate(plan.plan_enddate) : "-"}
                  </TableCell>
                  <TableCell>
                    {plan.plan_status === "active" ? (
                      <Badge className="bg-green-500">ใช้งาน</Badge>
                    ) : plan.plan_status === "completed" ? (
                      <Badge className="bg-blue-500">เสร็จสิ้น</Badge>
                    ) : (
                      <Badge variant="outline">ไม่ใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white shadow-md"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/trainer/${trainerId}/members/${plan.member_id}/workout-plan/${plan.workout_plan_id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              memberId
                                ? `/trainer/${trainerId}/members/${memberId}/workout-plan/${plan.workout_plan_id}/edit`
                                : `/trainer/${trainerId}/workout/edit/${plan.workout_plan_id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDuplicatePlan(plan.workout_plan_id)
                          }
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4" /> ทำสำเนา
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {plan.plan_status !== "active" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(plan.workout_plan_id, "active")
                            }
                            className="cursor-pointer"
                            disabled={loading}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> เปิดใช้งาน
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  plan.workout_plan_id,
                                  "inactive"
                                )
                              }
                              className="cursor-pointer"
                              disabled={loading}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> ปิดใช้งาน
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  plan.workout_plan_id,
                                  "completed"
                                )
                              }
                              className="cursor-pointer"
                              disabled={loading}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />{" "}
                              ทำเครื่องหมายว่าเสร็จสิ้น
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePlan(plan.workout_plan_id)}
                          className="cursor-pointer text-red-500 focus:text-red-500"
                          disabled={loading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> ลบโปรแกรม
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

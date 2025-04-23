"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/utils";
import {
  changeNutritionPlanStatus,
  deleteNutritionPlan,
} from "@/actions/trainer/nutrition/nutritionPlanAction";
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Archive,
  TrashIcon,
} from "lucide-react";
import CreateNutritionPlanButton from "@/app/trainer/_components/nutrition/CreateNutritionPlanButton";

export default function NutritionPlanList({ plans, trainerId, onRefresh }) {
  const router = useRouter();

  const handleStatusChange = async (planId, newStatus) => {
    try {
      const result = await changeNutritionPlanStatus(
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
        description: "ไม่สามารถเปลี่ยนสถานะแผนได้",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่ต้องการลบแผนโภชนาการนี้?")) {
      return;
    }

    try {
      const result = await deleteNutritionPlan(planId, trainerId);
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
        description: "ไม่สามารถลบแผนโภชนาการได้",
        variant: "destructive",
      });
    }
  };

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

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">ยังไม่มีแผนโภชนาการ</p>
          <CreateNutritionPlanButton trainerId={trainerId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>แผนโภชนาการทั้งหมด</CardTitle>
        <CardDescription>รายการแผนโภชนาการสำหรับสมาชิก</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อแผน</TableHead>
              <TableHead>สมาชิก</TableHead>
              <TableHead>วันที่เริ่มต้น</TableHead>
              <TableHead>วันที่สิ้นสุด</TableHead>
              <TableHead>แคลอรี่ต่อวัน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.nutrition_plan_id}>
                <TableCell className="font-medium">
                  <div
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      router.push(
                        `/trainer/${trainerId}/members/${plan.member_id}/nutrition-plan/${plan.nutrition_plan_id}`
                      )
                    }
                  >
                    {plan.plan_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      router.push(
                        `/trainer/${trainerId}/members/${plan.member_id}`
                      )
                    }
                  >
                    {plan.member_name}
                  </div>
                </TableCell>
                <TableCell>{formatDate(plan.plan_startdate)}</TableCell>
                <TableCell>
                  {plan.plan_enddate ? formatDate(plan.plan_enddate) : "-"}
                </TableCell>
                <TableCell>{plan.daily_calories || "-"}</TableCell>
                <TableCell>{getStatusBadge(plan.plan_status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/trainer/${trainerId}/members/${plan.member_id}/nutrition-plan/${plan.nutrition_plan_id}`
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        ดูรายละเอียด
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/trainer/${trainerId}/nutrition/${plan.nutrition_plan_id}/edit`
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {plan.plan_status !== "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(plan.nutrition_plan_id, "active")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          เปิดใช้งาน
                        </DropdownMenuItem>
                      )}

                      {plan.plan_status !== "inactive" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              plan.nutrition_plan_id,
                              "inactive"
                            )
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          ปิดใช้งาน
                        </DropdownMenuItem>
                      )}

                      {plan.plan_status !== "completed" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              plan.nutrition_plan_id,
                              "completed"
                            )
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          ทำเครื่องหมายว่าเสร็จสิ้น
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePlan(plan.nutrition_plan_id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        ลบแผน
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMemberNutritionPlans } from "@/actions/trainer/nutrition/nutritionPlanAction";
import { getMemberDetails } from "@/actions/trainer/getMemberDetails";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Archive,
  MoreHorizontal,
  Plus,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/utils";
import {
  changeNutritionPlanStatus,
  deleteNutritionPlan,
} from "@/actions/trainer/nutrition/nutritionPlanAction";

export default function MemberNutritionPlansPage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id;
  const memberId = params.memberId;

  const [memberName, setMemberName] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลสมาชิก
        const memberResult = await getMemberDetails(trainerId, memberId);
        if (memberResult.success) {
          setMemberName(
            `${memberResult.member.member_firstname} ${memberResult.member.member_lastname}`
          );
        }

        // ดึงแผนโภชนาการของสมาชิก
        const plansResult = await getMemberNutritionPlans(memberId, trainerId);
        if (plansResult.success) {
          setPlans(plansResult.plans || []);
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: plansResult.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลแผนโภชนาการได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId, memberId]);

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

        // อัพเดตสถานะในรายการ
        setPlans(
          plans.map((plan) =>
            plan.nutrition_plan_id === planId
              ? { ...plan, plan_status: newStatus }
              : plan
          )
        );
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

        // ลบแผนออกจากรายการ
        setPlans(plans.filter((plan) => plan.nutrition_plan_id !== planId));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            แผนโภชนาการ
          </h1>
          <p className="text-muted-foreground">
            จัดการแผนโภชนาการสำหรับ {memberName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/trainer/${trainerId}/members/${memberId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </Link>
          <Link
            href={`/trainer/${trainerId}/members/${memberId}/nutrition-plan/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างแผนใหม่
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : plans.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>แผนโภชนาการทั้งหมด</CardTitle>
            <CardDescription>รายการแผนโภชนาการสำหรับสมาชิกนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อแผน</TableHead>
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
                      <Link
                        href={`/trainer/${trainerId}/members/${memberId}/nutrition-plan/${plan.nutrition_plan_id}`}
                        className="hover:underline"
                      >
                        {plan.plan_name}
                      </Link>
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
                                `/trainer/${trainerId}/members/${memberId}/nutrition-plan/${plan.nutrition_plan_id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/trainer/${trainerId}/members/${memberId}/nutrition-plan/${plan.nutrition_plan_id}/edit`
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
                                handleStatusChange(
                                  plan.nutrition_plan_id,
                                  "active"
                                )
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
                            onClick={() =>
                              handleDeletePlan(plan.nutrition_plan_id)
                            }
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              ยังไม่มีแผนโภชนาการสำหรับสมาชิกนี้
            </p>
            <Link
              href={`/trainer/${trainerId}/members/${memberId}/nutrition-plan/create`}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                สร้างแผนใหม่
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { formatDate } from "@/utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export default function WorkoutPlanTable({
  plans,
  trainerId,
  memberId,
  onStatusChange,
}) {
  // สีของ Badge ตามสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "inactive":
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // แสดงข้อความสถานะเป็นภาษาไทย
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "กำลังใช้งาน";
      case "completed":
        return "สำเร็จแล้ว";
      case "inactive":
      case "paused":
        return "ไม่ได้ใช้งาน";
      case "draft":
        return "แบบร่าง";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>ประวัติแผนการออกกำลังกาย</CardTitle>
        <CardDescription>
          แผนการออกกำลังกายทั้งหมด {plans.length} แผน
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อแผน</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
              <TableHead>ระยะเวลา</TableHead>
              <TableHead>โปรแกรม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.workout_plan_id}>
                <TableCell>
                  <Link
                    href={`/trainer/${trainerId}/workout-plan-editor/${plan.workout_plan_id}?memberId=${memberId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {plan.plan_name}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(plan.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{plan.plan_duration || "-"} สัปดาห์</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span>{plan.program_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(plan.plan_status)}>
                    {getStatusText(plan.plan_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={plan.plan_status}
                    onValueChange={(value) =>
                      onStatusChange(plan.workout_plan_id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span>กำลังใช้งาน</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                          <span>สำเร็จแล้ว</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 text-yellow-500" />
                          <span>ไม่ได้ใช้งาน</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 text-gray-500" />
                          <span>แบบร่าง</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

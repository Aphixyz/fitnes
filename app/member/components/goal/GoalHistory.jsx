"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/utils";

export default function GoalHistory({ historyData, onViewDetails }) {
  const [visibleItems, setVisibleItems] = useState(5);

  // เพิ่มการล็อกข้อมูลเพื่อดีบัก
  console.log("GoalHistory component - historyData:", historyData);

  // ตรวจสอบว่า historyData เป็นอาร์เรย์หรือไม่
  const validHistoryData = Array.isArray(historyData) ? historyData : [];
  console.log("GoalHistory component - validHistoryData:", validHistoryData);

  if (!validHistoryData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประวัติเป้าหมายการออกกำลังกาย</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ยังไม่มีประวัติเป้าหมายการออกกำลังกาย
          </p>
        </CardContent>
      </Card>
    );
  }

  const showMore = () => {
    setVisibleItems((prev) => prev + 5);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">สำเร็จแล้ว</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">ยกเลิก</Badge>;
      default:
        return <Badge className="bg-gray-500">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติเป้าหมายการออกกำลังกาย</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่เริ่ม</TableHead>
                <TableHead>วันที่สิ้นสุด</TableHead>
                <TableHead>ประเภทเป้าหมาย</TableHead>
                <TableHead>น้ำหนักเป้าหมาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validHistoryData.slice(0, visibleItems).map((goal) => (
                <TableRow key={goal.fitness_goal_id}>
                  <TableCell>
                    {formatDate(goal.fitness_goal_startdate)}
                  </TableCell>
                  <TableCell>{formatDate(goal.fitness_goal_enddate)}</TableCell>
                  <TableCell>{goal.fitness_goal_type}</TableCell>
                  <TableCell>
                    {goal.fitness_goal_targetweight
                      ? `${goal.fitness_goal_targetweight} กก.`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(goal.fitness_goal_status)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(goal)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {visibleItems < validHistoryData.length && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={showMore}>
              แสดงเพิ่มเติม
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, calculateBMI } from "@/utils/utils";

export default function HealthHistory({ historyData, onViewDetails }) {
  const [visibleItems, setVisibleItems] = useState(5);

  if (!historyData || historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการบันทึกข้อมูลสุขภาพ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ยังไม่มีประวัติการบันทึกข้อมูลสุขภาพ
          </p>
        </CardContent>
      </Card>
    );
  }

  const showMore = () => {
    setVisibleItems((prev) => prev + 5);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติการบันทึกข้อมูลสุขภาพ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>น้ำหนัก (กก.)</TableHead>
                <TableHead>ส่วนสูง (ซม.)</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>เปอร์เซ็นต์ไขมัน (%)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.slice(0, visibleItems).map((record) => {
                // คำนวณ BMI สำหรับแต่ละรายการ
                const bmi = calculateBMI(
                  record.member_health_weight,
                  record.member_health_height
                );

                return (
                  <TableRow key={record.member_health_id}>
                    <TableCell>
                      {formatDate(record.member_health_measurementdate)}
                    </TableCell>
                    <TableCell>{record.member_health_weight || "-"}</TableCell>
                    <TableCell>{record.member_health_height || "-"}</TableCell>
                    <TableCell>{bmi || "-"}</TableCell>
                    <TableCell>{record.member_health_bodyfat || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(record)}
                          className="hover:bg-gray-100"
                        >
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {visibleItems < historyData.length && (
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

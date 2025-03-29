"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, calculateBMI } from "@/utils/utils";

export default function WeightHistoryGraph({ historyData }) {
  const [timeRange, setTimeRange] = useState("3m");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!historyData || historyData.length === 0) {
      setFilteredData([]);
      return;
    }

    // คัดกรองข้อมูลตามช่วงเวลาที่เลือก
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1m":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3m":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6m":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "all":
        startDate = new Date(0); // กำหนดให้เป็นวันที่ 1 มกราคม 1970
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 3));
    }

    // กรองข้อมูลตามช่วงเวลา
    const filtered = historyData
      .filter(
        (record) => new Date(record.member_health_measurementdate) >= startDate
      )
      .sort(
        (a, b) =>
          new Date(a.member_health_measurementdate) -
          new Date(b.member_health_measurementdate)
      );

    setFilteredData(filtered);
  }, [historyData, timeRange]);

  if (!historyData || historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประวัติน้ำหนัก</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ยังไม่มีข้อมูลประวัติน้ำหนัก</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>ประวัติน้ำหนัก</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md z-50">
            <SelectItem value="1m" className="hover:bg-gray-100">
              1 เดือน
            </SelectItem>
            <SelectItem value="3m" className="hover:bg-gray-100">
              3 เดือน
            </SelectItem>
            <SelectItem value="6m" className="hover:bg-gray-100">
              6 เดือน
            </SelectItem>
            <SelectItem value="1y" className="hover:bg-gray-100">
              1 ปี
            </SelectItem>
            <SelectItem value="all" className="hover:bg-gray-100">
              ทั้งหมด
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        {filteredData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">
              ไม่มีข้อมูลในช่วงเวลาที่เลือก
            </p>
          </div>
        ) : (
          <div className="h-64">
            <LineChart
              data={filteredData.map((record) => {
                // คำนวณ BMI สำหรับแต่ละรายการข้อมูล
                const bmi = calculateBMI(
                  record.member_health_weight,
                  record.member_health_height
                );

                return {
                  date: formatDate(record.member_health_measurementdate),
                  weight: record.member_health_weight,
                  bmi: bmi, // ใช้ค่า BMI ที่คำนวณแล้ว
                  timestamp: new Date(
                    record.member_health_measurementdate
                  ).getTime(),
                };
              })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LineChart({ data }) {
  return (
    <div className="w-full h-full">
      <div
        className="recharts-responsive-container"
        style={{ width: "100%", height: "100%" }}
      >
        <LineChartComponent data={data} />
      </div>
    </div>
  );
}

function LineChartComponent({ data }) {
  // ใช้ recharts
  return (
    <>
      <div className="flex flex-col h-full">
        {/* คอมโพเนนต์ Recharts จะถูกแทนที่ด้วย React component */}
        <div className="relative flex-1">
          {/* แกน Y และ ข้อมูล */}
          <div className="absolute inset-0 flex">
            {/* แกน Y (น้ำหนัก) */}
            <div className="w-10 flex flex-col justify-between text-xs text-muted-foreground">
              {calculateYAxisTicks(data, "weight").map((tick, i) => (
                <div key={i}>{tick}</div>
              ))}
            </div>

            {/* แสดงกราฟ */}
            <div className="flex-1 relative">
              {/* เส้นกราฟ */}
              <svg className="w-full h-full overflow-visible">
                {renderLineGraph(data, "weight")}
                {/* จุดข้อมูล */}
                {data.map((point, i) => (
                  <circle
                    key={i}
                    cx={calculateXPosition(i, data.length)}
                    cy={calculateYPosition(point.weight, data, "weight")}
                    r="3"
                    className="fill-emerald-500"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* แกน X (วันที่) */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-muted-foreground">
            {data
              .filter(
                (_, i) =>
                  i === 0 ||
                  i === Math.floor(data.length / 2) ||
                  i === data.length - 1
              )
              .map((point, i) => (
                <div key={i}>{point.date}</div>
              ))}
          </div>
        </div>

        {/* คำอธิบาย */}
        <div className="flex justify-center space-x-4 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
            <span className="text-xs">น้ำหนัก (กก.)</span>
          </div>
        </div>
      </div>
    </>
  );
}

// คำนวณตำแหน่ง X
function calculateXPosition(index, totalPoints) {
  const width = 100;
  return index * (width / (totalPoints - 1 || 1)) + "%";
}

// คำนวณตำแหน่ง Y
function calculateYPosition(value, data, field) {
  const values = data.map((d) => d[field]);
  const min = Math.min(...values) * 0.95; // ให้มีพื้นที่ว่างด้านล่าง 5%
  const max = Math.max(...values) * 1.05; // ให้มีพื้นที่ว่างด้านบน 5%
  const range = max - min;

  // กลับด้าน Y (เพราะใน SVG แกน Y เริ่มจากด้านบน)
  return (1 - (value - min) / range) * 100 + "%";
}

// สร้างเส้นกราฟ
function renderLineGraph(data, field) {
  if (data.length < 2) return null;

  let path = `M ${calculateXPosition(0, data.length)} ${calculateYPosition(
    data[0][field],
    data,
    field
  )}`;

  for (let i = 1; i < data.length; i++) {
    path += ` L ${calculateXPosition(i, data.length)} ${calculateYPosition(
      data[i][field],
      data,
      field
    )}`;
  }

  return (
    <path d={path} fill="none" className="stroke-emerald-500" strokeWidth="2" />
  );
}

// คำนวณค่าแกน Y
function calculateYAxisTicks(data, field) {
  if (!data || data.length === 0) return [];

  const values = data.map((d) => d[field]);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;

  // สร้าง tick 5 จุด
  const ticks = [];
  for (let i = 5; i >= 0; i--) {
    ticks.push(Math.round((min + (max - min) * (i / 5)) * 10) / 10);
  }

  return ticks;
}

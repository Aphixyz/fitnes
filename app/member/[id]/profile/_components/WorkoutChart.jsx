"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { formatShortThaiDate, formatHourThai } from "@/utils/utils";

const METRIC_CONFIG = {
  duration: { label: "ระยะเวลา", unit: "วินาที", color: "var(--chart-1)" },
  volume: { label: "น้ำหนักรวม", unit: "กก.", color: "var(--chart-2)" },
  reps: { label: "จำนวนครั้ง", unit: "ครั้ง", color: "var(--chart-3)" },
};

/**
 * WorkoutChart - กราฟ Bar Chart สรุปการออกกำลังกายรายสัปดาห์
 * @param {Object} props
 * @param {number} props.member_id - รหัสสมาชิก
 * @param {string} [props.startDate] - วันที่เริ่มต้น (YYYY-MM-DD)
 * @param {string} [props.endDate] - วันที่สิ้นสุด (YYYY-MM-DD)
 * @param {Array} [props.ticks] - array ของวันที่สำหรับ XAxis ticks
 * @param {Array} [props.subscriptions] - array ของ subscription objects
 * @param {Function} props.getExerciseSummary - server action สำหรับดึงข้อมูล summary
 */
export default function WorkoutChart({
  member_id,
  startDate,
  endDate,
  ticks,
  getExerciseSummary,
}) {
  const [selectedMetric, setSelectedMetric] = useState("duration");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setHasError(false);
    startTransition(() => {
      getExerciseSummary({ member_id, startDate, endDate })
        .then((result) => {
          if (!ignore) setData(result);
        })
        .catch((err) => {
          console.error("WorkoutChart error:", err);
          if (!ignore) setHasError(true);
        })
        .finally(() => {
          if (!ignore) setIsLoading(false);
        });
    });
    return () => {
      ignore = true;
    };
  }, [member_id, startDate, endDate, getExerciseSummary]);

  // เตรียมข้อมูลสำหรับกราฟ
  const chartData =
    data?.map((item) => ({
      week: item.week,
      week_start: item.week_start,
      duration: item.duration,
      volume: item.volume,
      reps: item.reps,
    })) || [];

  // config สำหรับ ChartContainer
  const config = {
    [selectedMetric]: {
      label: METRIC_CONFIG[selectedMetric].label,
      color: METRIC_CONFIG[selectedMetric].color,
    },
  };

  // Error state
  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>กราฟการออกกำลังกาย</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>กราฟการออกกำลังกาย</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Toggle Metric */}
        <div className="flex gap-2 mb-4">
          {Object.keys(METRIC_CONFIG).map((key) => (
            <Button
              key={key}
              variant={selectedMetric === key ? "default" : "outline"}
              onClick={() => setSelectedMetric(key)}
              disabled={isLoading || isPending}
            >
              {METRIC_CONFIG[key].label}
            </Button>
          ))}
        </div>
        {/* Chart */}
        <ChartContainer config={config}>
          <BarChart
            width={400}
            height={300}
            data={chartData}
            className="w-full"
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week_start"
              type="category"
              interval={0}
              tick={true}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              tickLine={true}
              tickMargin={10}
              axisLine={true}
              tickFormatter={(value) => formatShortThaiDate(value, false)}
            />
            <YAxis
              width={70}
              fontSize={12}
              dx={-6}
              tickMargin={8}
              tickFormatter={(value) => {
                if (selectedMetric === "duration") {
                  // แสดงเป็นชั่วโมง ปัดเศษลง
                  return `${Math.floor(value / 3600)} ชม.`;
                }
                if (selectedMetric === "volume") {
                  return `${value} กก.`;
                }
                if (selectedMetric === "reps") {
                  return `${value} ครั้ง`;
                }
                return value;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload.length > 0) {
                      return formatShortThaiDate(
                        payload[0].payload.week_start,
                        true
                      );
                    }
                    return value;
                  }}
                  valueFormatter={(value) =>
                    `${value} ${METRIC_CONFIG[selectedMetric].unit}`
                  }
                />
              }
            />
            <Bar
              dataKey={selectedMetric}
              fill={METRIC_CONFIG[selectedMetric].color}
              radius={1}
              barSize={40}
              isAnimationActive={!isLoading}
            >
              <LabelList
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value) =>
                  selectedMetric === "duration"
                    ? value > 0
                      ? formatHourThai(value)
                      : ""
                    : value > 0
                    ? value
                    : ""
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        {/* Empty state */}
        {!isLoading && chartData.length === 0 && (
          <div className="text-center text-slate-600 mt-4">ไม่มีข้อมูล</div>
        )}
      </CardContent>
    </Card>
  );
}

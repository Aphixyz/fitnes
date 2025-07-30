"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChevronDown, Calendar, TrendingUp, Edit } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  formatThaiDateForChart,
  filterDataByPeriod,
  prepareChartData,
  prepareHistoryData,
  calculateTrend,
  MEASUREMENT_TYPES,
  PERIOD_OPTIONS,
} from "@/utils/utils";

export default function MeasuresProgress({ data, memberId }) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("weight");
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const chartData = useMemo(() => {
    return prepareChartData(
      data,
      selectedType,
      selectedPeriod,
      MEASUREMENT_TYPES
    );
  }, [data, selectedType, selectedPeriod]);

  const currentData = useMemo(() => {
    if (selectedDataPoint) return selectedDataPoint;
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData, selectedDataPoint]);

  const historyData = useMemo(() => {
    return prepareHistoryData(data, selectedType, MEASUREMENT_TYPES);
  }, [data, selectedType]);

  const chartConfig = {
    value: {
      label: MEASUREMENT_TYPES[selectedType].label,
      color: "#3b82f6",
    },
  };

  const trend = calculateTrend(chartData);

  return (
    <div className="space-y-0 -mx-4 md:-mx-6">
      
      {/* ส่วนที่ 1: Chart Section */}
      <section className="bg-white">
        <div className="flex flex-col space-y-1.5 p-4 md:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {currentData ? (
                  <>
                    {currentData.value} {MEASUREMENT_TYPES[selectedType].unit}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {currentData.formattedDate}
                    </span>
                  </>
                ) : (
                  "ไม่มีข้อมูล"
                )}
              </h3>
            </div>

            {/* ตัวเลือกช่วงเวลา */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <span>
                  {
                    PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)
                      ?.label
                  }
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPeriodDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  {PERIOD_OPTIONS.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedPeriod(period.value);
                        setShowPeriodDropdown(false);
                        setSelectedDataPoint(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-0 pb-4 md:px-0 md:pb-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={chartData}
                  margin={{ right: 40, top: 8, bottom: 8 }}
                >
                  <XAxis
                    dataKey="formattedDate"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={6}
                    fontSize={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={true}
                    tickMargin={6}
                    fontSize={10}
                    stroke="#6b7280"
                    tick={{ fill: "#666" }}
                    tickFormatter={(value) =>
                      `${value} ${MEASUREMENT_TYPES[selectedType].unit}`
                    }
                    domain={[
                      (dataMin) => Math.floor(dataMin * 0.95),
                      (dataMax) => Math.ceil(dataMax * 1.05),
                    ]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="value"
                    type="natural"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{
                      fill: "#3b82f6",
                      stroke: "white",
                      strokeWidth: 2,
                      r: 4,
                      cursor: "pointer",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#3b82f6",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                    onClick={(data) => {
                      if (data && data.payload) {
                        setSelectedDataPoint(data.payload);
                      }
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              ไม่มีข้อมูลในช่วงเวลาที่เลือก
            </div>
          )}
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6">
          {/* ตัวเลือกประเภทการวัดผล */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Object.entries(MEASUREMENT_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedType(key);
                    setSelectedDataPoint(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    selectedType === key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              ประวัติ{MEASUREMENT_TYPES[selectedType].label}
            </h3>

            {historyData.length > 0 ? (
              <div className="space-y-3">
                {historyData.map((item, index) => (
                  <div
                    key={`${item.date}-${index}`}
                    onClick={() => {
                      if (item.healthId) {
                        router.push(
                          `/member/${memberId}/profile/measures/${item.healthId}`
                        );
                      }
                    }}
                    className={`flex justify-between items-center p-3 bg-white rounded-lg transition-colors border border-gray-100 ${
                      item.healthId
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700">
                        {item.formattedDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {item.value} {MEASUREMENT_TYPES[selectedType].unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-100">
                ไม่มีประวัติ{MEASUREMENT_TYPES[selectedType].label}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ซ่อน scrollbar แนวนอน */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

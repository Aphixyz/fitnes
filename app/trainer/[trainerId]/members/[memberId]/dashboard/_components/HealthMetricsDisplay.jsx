"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scale,
  TrendingUp,
  TrendingDown,
  TrendingUp as TrendUp,
  Target
} from "lucide-react";

/**
 * WeightProgressChart component - แสดงกราฟความคืบหน้าของน้ำหนัก
 */
function WeightProgressChart({ weightData, goalWeight }) {
  if (!weightData || weightData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Scale className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>ไม่มีข้อมูลน้ำหนักให้แสดง</p>
        </div>
      </div>
    );
  }

  // Calculate trend
  const latestWeight = weightData[weightData.length - 1]?.weight;
  const previousWeight = weightData[weightData.length - 2]?.weight;
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : 0;
  const isIncreasing = weightChange > 0;
  const isDecreasing = weightChange < 0;


  return (
    <div className="space-y-6">
      {/* Weight Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">น้ำหนักปัจจุบัน</p>
                <p className="text-2xl font-bold text-blue-900">
                  {latestWeight ? `${latestWeight} กก.` : 'N/A'}
                </p>
                {goalWeight && (
                  <p className="text-xs text-blue-600 mt-1">
                    เป้าหมาย: {goalWeight} กก.
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Scale className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border ${
          isIncreasing ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' : 
          isDecreasing ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : 
          'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  isIncreasing ? 'text-red-700' : 
                  isDecreasing ? 'text-green-700' : 
                  'text-gray-700'
                }`}>
                  การเปลี่ยนแปลง
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    isIncreasing ? 'text-red-900' : 
                    isDecreasing ? 'text-green-900' : 
                    'text-gray-900'
                  }`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} กก.
                  </p>
                  {isIncreasing && <TrendUp className="w-5 h-5 text-red-600" />}
                  {isDecreasing && <TrendingDown className="w-5 h-5 text-green-600" />}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  จากครั้งที่แล้ว
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Comparison */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">เปรียบเทียบน้ำหนัก</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Weight */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-sm font-medium text-blue-700 mb-2">น้ำหนักปัจจุบัน</h5>
                <p className="text-3xl font-bold text-blue-900 mb-2">
                  {latestWeight ? `${latestWeight}` : 'N/A'}
                </p>
                <p className="text-sm text-blue-600">กิโลกรัม</p>
                {weightData.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    อัพเดทล่าสุด: {new Date(weightData[weightData.length - 1].date).toLocaleDateString('th-TH')}
                  </p>
                )}
              </div>
            </div>

            {/* Goal Weight */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-500 rounded-full mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">น้ำหนักเป้าหมาย</h5>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {goalWeight ? `${goalWeight}` : 'ไม่ได้ตั้ง'}
                </p>
                <p className="text-sm text-gray-600">กิโลกรัม</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {latestWeight && goalWeight && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
                <span className="text-sm text-gray-600">
                  {latestWeight < goalWeight ? 
                    `เหลืออีก ${(goalWeight - latestWeight).toFixed(1)} กก.` : 
                    latestWeight > goalWeight ? 
                    `เกินเป้าหมาย ${(latestWeight - goalWeight).toFixed(1)} กก.` :
                    'บรรลุเป้าหมายแล้ว!'
                  }
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    latestWeight <= goalWeight ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (latestWeight / goalWeight) * 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 กก.</span>
                <span>{goalWeight} กก.</span>
              </div>
            </div>
          )}

          {/* Weight Records Summary */}
          {weightData.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700">บันทึกทั้งหมด</p>
                <p className="text-xl font-bold text-green-900">{weightData.length}</p>
                <p className="text-xs text-green-600">ครั้ง</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700">น้ำหนักต่ำสุด</p>
                <p className="text-xl font-bold text-blue-900">
                  {Math.min(...weightData.map(d => d.weight)).toFixed(1)}
                </p>
                <p className="text-xs text-blue-600">กิโลกรัม</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-700">น้ำหนักสูงสุด</p>
                <p className="text-xl font-bold text-purple-900">
                  {Math.max(...weightData.map(d => d.weight)).toFixed(1)}
                </p>
                <p className="text-xs text-purple-600">กิโลกรัม</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * HealthMetricsDisplay component - แสดงข้อมูล health metrics ในรูปแบบ Accordion
 */
export function HealthMetricsDisplay({ data, memberId, showOnlyWeight = false }) {
  const [weightHistory, setWeightHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { weight, bodyFat, measurements = {} } = data || {};

  useEffect(() => {
    async function fetchWeightHistory() {
      try {
        setLoading(true);
        setError(null);

        // Import and call the server action to get weight history
        const { getMemberWeightHistory } = await import(
          "@/actions/trainer/dashboard/getMemberWeightHistory"
        );
        
        const result = await getMemberWeightHistory(memberId);
        
        if (result.success) {
          setWeightHistory(result.data);
        } else {
          setError(result.message || "เกิดข้อผิดพลาดในการโหลดประวัติน้ำหนัก");
        }
      } catch (err) {
        console.error("Error fetching weight history:", err);
        setError("ไม่สามารถโหลดประวัติน้ำหนักได้");
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      fetchWeightHistory();
    }
  }, [memberId]);

  // Show only weight section if showOnlyWeight is true
  if (showOnlyWeight) {
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible defaultValue="weight" className="space-y-2">
          <AccordionItem value="weight" className="border border-blue-200 rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 rounded-t-lg">
              <div className="flex items-center space-x-4 w-full">
                <div className="p-3 rounded-full bg-blue-100">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-semibold text-gray-900">การติดตามน้ำหนัก</div>
                  <div className="text-sm text-gray-600">
                    {weight ? `ปัจจุบัน: ${weight} กก.` : 'ยังไม่มีข้อมูล'}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  กราฟแนวโน้ม
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4 border-t border-gray-100">
                {loading ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                    <Skeleton className="h-80 w-full rounded-lg" />
                  </div>
                ) : error ? (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                ) : (
                  <WeightProgressChart 
                    weightData={weightHistory?.weightData || []}
                    goalWeight={weightHistory?.goalWeight}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // Full health metrics display
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-3">
        {/* Weight Tracking Section */}
        <AccordionItem value="weight" className="border border-blue-200 rounded-lg shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 rounded-t-lg">
            <div className="flex items-center space-x-4 w-full">
              <div className="p-3 rounded-full bg-blue-100">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold text-gray-900">การติดตามน้ำหนัก</div>
                <div className="text-sm text-gray-600">
                  {weight ? `ปัจจุบัน: ${weight} กก.` : 'ยังไม่มีข้อมูล'}
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                กราฟ
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="pt-4 border-t border-gray-100">
              {loading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-80 w-full rounded-lg" />
                </div>
              ) : error ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              ) : (
                <WeightProgressChart 
                  weightData={weightHistory?.weightData || []}
                  goalWeight={weightHistory?.goalWeight}
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Body Fat Section (if available) */}
        {bodyFat && (
          <AccordionItem value="bodyfat" className="border border-orange-200 rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-orange-50/50 rounded-t-lg">
              <div className="flex items-center space-x-4 w-full">
                <div className="p-3 rounded-full bg-orange-100">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-semibold text-gray-900">เปอร์เซ็นต์ไขมัน</div>
                  <div className="text-sm text-gray-600">ปัจจุบัน: {bodyFat}%</div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  {bodyFat}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4 border-t border-gray-100">
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-700 mb-3">{bodyFat}%</div>
                      <div className="text-sm text-gray-600 mb-4">เปอร์เซ็นต์ไขมันในร่างกาย</div>
                      <div className="text-xs text-gray-500">
                        ข้อมูลจากการวัดล่าสุด
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Body Measurements Section (if available) */}
        {Object.keys(measurements).length > 0 && (
          <AccordionItem value="measurements" className="border border-purple-200 rounded-lg shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-purple-50/50 rounded-t-lg">
              <div className="flex items-center space-x-4 w-full">
                <div className="p-3 rounded-full bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-semibold text-gray-900">ขนาดรอบส่วน</div>
                  <div className="text-sm text-gray-600">
                    {Object.keys(measurements).length} รายการ
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  ซม.
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(measurements).map(([key, value]) => {
                    const labels = {
                      chest: "รอบอก",
                      waist: "รอบเอว",
                      hip: "รอบสะโพก",
                      arm: "รอบแขน",
                      thigh: "รอบขา",
                    };

                    return (
                      <Card key={key} className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">{labels[key]}</div>
                            <div className="text-xl font-bold text-gray-900">{value} ซม.</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}

export default HealthMetricsDisplay;
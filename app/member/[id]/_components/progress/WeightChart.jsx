"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Weight, TrendingUp, TrendingDown } from "lucide-react";

export default function WeightChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            กราฟน้ำหนัก
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Weight className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">ยังไม่มีข้อมูลน้ำหนัก</p>
            <p className="text-sm text-gray-400">
              บันทึกน้ำหนักเพื่อดูกราฟความคืบหน้า
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // คำนวณสถิติ
  const weights = data.map(item => item.weight).filter(w => w !== null);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const latestWeight = weights[weights.length - 1];
  const firstWeight = weights[0];
  const totalChange = latestWeight - firstWeight;
  const changePercentage = ((totalChange / firstWeight) * 100).toFixed(1);

  // Format ข้อมูลสำหรับ chart
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    }),
    weight: item.weight ? parseFloat(item.weight.toFixed(1)) : null,
    body_fat: item.body_fat ? parseFloat(item.body_fat.toFixed(1)) : null
  }));

  // Custom tooltip - Mobile optimized
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[120px] max-w-[200px]">
          <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name === 'weight' ? 'น้ำหนัก' : 'ไขมัน'}: {entry.value} {entry.name === 'weight' ? 'kg' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            กราฟน้ำหนัก
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {minWeight.toFixed(1)} - {maxWeight.toFixed(1)} kg
            </Badge>
            <Badge variant={totalChange >= 0 ? "default" : "secondary"} className="flex items-center gap-1">
              {totalChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)} kg ({changePercentage}%)
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">เริ่มต้น</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {firstWeight.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">ปัจจุบัน</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {latestWeight.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">ต่ำสุด</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {minWeight.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">สูงสุด</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {maxWeight.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
        </div>

        {/* Weight Chart - Mobile Optimized */}
        <div className="h-80 sm:h-96 w-full touch-pan-x">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ 
                top: 20, 
                right: window.innerWidth < 640 ? 10 : 30, 
                left: window.innerWidth < 640 ? 10 : 20, 
                bottom: 5 
              }}
            >
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="date"
                stroke="#6B7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
                interval={window.innerWidth < 640 ? 'preserveStartEnd' : 0}
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                height={window.innerWidth < 640 ? 60 : 30}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                stroke="#6B7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} kg`}
                width={window.innerWidth < 640 ? 40 : 60}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }}
                animationDuration={200}
                offset={10}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: false, y: true }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#3B82F6"
                strokeWidth={window.innerWidth < 640 ? 2 : 3}
                fill="url(#weightGradient)"
                dot={{ 
                  fill: '#3B82F6', 
                  strokeWidth: 2, 
                  r: window.innerWidth < 640 ? 3 : 4 
                }}
                activeDot={{ 
                  r: window.innerWidth < 640 ? 5 : 6, 
                  stroke: '#3B82F6', 
                  strokeWidth: 2,
                  fill: '#ffffff'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body Fat Chart (if available) - Mobile Optimized */}
        {data.some(item => item.body_fat) && (
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
              เปอร์เซ็นต์ไขมัน
            </h4>
            <div className="h-60 sm:h-72 w-full touch-pan-x">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ 
                    top: 5, 
                    right: window.innerWidth < 640 ? 10 : 30, 
                    left: window.innerWidth < 640 ? 10 : 20, 
                    bottom: 5 
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#E5E7EB" 
                    strokeOpacity={0.5}
                  />
                  <XAxis 
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tickLine={false}
                    axisLine={false}
                    interval={window.innerWidth < 640 ? 'preserveStartEnd' : 0}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                    height={window.innerWidth < 640 ? 60 : 30}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={window.innerWidth < 640 ? 10 : 12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    width={window.innerWidth < 640 ? 35 : 50}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#F59E0B', strokeWidth: 1, strokeDasharray: '5 5' }}
                    animationDuration={200}
                    offset={10}
                    allowEscapeViewBox={{ x: false, y: true }}
                  />
                  <Line
                    type="monotone"
                    dataKey="body_fat"
                    stroke="#F59E0B"
                    strokeWidth={window.innerWidth < 640 ? 2 : 2}
                    dot={{ 
                      fill: '#F59E0B', 
                      strokeWidth: 2, 
                      r: window.innerWidth < 640 ? 2 : 3 
                    }}
                    activeDot={{ 
                      r: window.innerWidth < 640 ? 4 : 5, 
                      stroke: '#F59E0B', 
                      strokeWidth: 2,
                      fill: '#ffffff'
                    }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Progress Insight */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            {totalChange >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {totalChange >= 0 ? 'น้ำหนักเพิ่มขึ้น' : 'น้ำหนักลดลง'} {Math.abs(totalChange).toFixed(1)} kg
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                จากการติดตามใน {data.length} ครั้ง ระยะเวลา {Math.ceil(
                  (new Date(data[data.length - 1].date) - new Date(data[0].date)) / (1000 * 60 * 60 * 24)
                )} วัน
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
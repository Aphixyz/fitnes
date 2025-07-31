"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Activity } from "lucide-react";

export default function VolumeChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            กราฟ Training Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">ยังไม่มีข้อมูลการออกกำลังกาย</p>
            <p className="text-sm text-gray-400">
              เริ่มบันทึกการออกกำลังกายเพื่อดูกราฟ Volume
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // คำนวณสถิติ
  const volumes = data.map(item => item.weekly_volume).filter(v => v > 0);
  const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
  const avgVolume = volumes.length > 0 ? totalVolume / volumes.length : 0;
  const maxVolume = Math.max(...volumes);
  const totalWorkoutDays = data.reduce((sum, item) => sum + item.workout_days, 0);
  const totalSets = data.reduce((sum, item) => sum + item.total_sets, 0);

  // หาแนวโน้ม (เทรนด์)
  const trend = volumes.length >= 2 ? 
    volumes[volumes.length - 1] - volumes[volumes.length - 2] : 0;

  // Format ข้อมูลสำหรับ chart
  const chartData = data.map(item => ({
    ...item,
    week: new Date(item.week_start).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    }),
    weekly_volume: Math.round(item.weekly_volume),
    workout_days: item.workout_days,
    total_sets: item.total_sets,
    avg_volume_per_day: item.workout_days > 0 ? Math.round(item.weekly_volume / item.workout_days) : 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">สัปดาห์ {label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              <span className="font-medium">Volume:</span> {data.weekly_volume.toLocaleString()} kg
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">วันที่ฝึก:</span> {data.workout_days} วัน
            </p>
            <p className="text-sm text-purple-600">
              <span className="font-medium">เซตรวม:</span> {data.total_sets} เซต
            </p>
            <p className="text-sm text-orange-600">
              <span className="font-medium">Volume/วัน:</span> {data.avg_volume_per_day.toLocaleString()} kg
            </p>
          </div>
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
            <BarChart3 className="h-5 w-5" />
            Training Volume รายสัปดาห์
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              เฉลี่ย {Math.round(avgVolume).toLocaleString()} kg/สัปดาห์
            </Badge>
            <Badge variant={trend >= 0 ? "default" : "secondary"} className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend >= 0 ? '+' : ''}{Math.round(trend).toLocaleString()} kg
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Volume รวม</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(totalVolume).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">วันฝึกรวม</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {totalWorkoutDays}
            </p>
            <p className="text-xs text-gray-500">วัน</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">เซตรวม</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {totalSets.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">เซต</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">สูงสุด</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {Math.round(maxVolume).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
        </div>

        {/* Main Volume Chart */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Training Volume รายสัปดาห์
          </h4>
          <div className="h-[320px] sm:h-[400px] w-full touch-pan-x">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={chartData} 
                margin={{ top: 20, right: 15, left: 15, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="week"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="volume"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={50}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="days"
                  orientation="right"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 7]}
                  width={35}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="volume"
                  dataKey="weekly_volume"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
                <Line
                  yAxisId="days"
                  type="monotone"
                  dataKey="workout_days"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Frequency Chart */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            จำนวนเซตต่อสัปดาห์
          </h4>
          <div className="h-[280px] sm:h-[320px] w-full touch-pan-x">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 15, left: 15, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="week"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, 'เซต']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="total_sets"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Insight */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className={`h-5 w-5 mt-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {trend >= 0 ? 'Volume เพิ่มขึ้น' : 'Volume ลดลง'} {Math.abs(trend).toLocaleString()} kg
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                จากสัปดาห์ที่แล้ว • เฉลี่ย {Math.round(avgVolume / (totalWorkoutDays / data.length || 1)).toLocaleString()} kg ต่อวันฝึก
              </p>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-400">เคล็ดลับการพัฒนา</p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {avgVolume < 5000 
                  ? 'ลองเพิ่มน้ำหนักหรือจำนวนเซตเพื่อเพิ่ม Volume' 
                  : avgVolume < 10000
                  ? 'Volume ดีแล้ว! พยายามรักษาความสม่ำเสมอ'
                  : 'Volume สูงมาก! ระวังการพักฟื้นที่เพียงพอ'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
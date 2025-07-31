"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Utensils, Target, TrendingUp, Flame } from "lucide-react";

export default function NutritionChart({ data }) {
  if (!data || !data.weekly_data || data.weekly_data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            กราฟโภชนาการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">ยังไม่มีข้อมูลโภชนาการ</p>
            <p className="text-sm text-gray-400">
              เริ่มบันทึกอาหารเพื่อดูกราฟโภชนาการ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyData = data.weekly_data;
  const targets = data.targets;

  // คำนวณสถิติ
  const avgCalories = weeklyData.reduce((sum, week) => sum + week.avg_calories, 0) / weeklyData.length;
  const avgProtein = weeklyData.reduce((sum, week) => sum + week.avg_protein, 0) / weeklyData.length;
  const avgCarbs = weeklyData.reduce((sum, week) => sum + week.avg_carbs, 0) / weeklyData.length;
  const avgFat = weeklyData.reduce((sum, week) => sum + week.avg_fat, 0) / weeklyData.length;
  const totalLoggedDays = weeklyData.reduce((sum, week) => sum + week.logged_days, 0);

  // Format ข้อมูลสำหรับ chart
  const chartData = weeklyData.map(item => ({
    ...item,
    week: new Date(item.week_start).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    }),
    avg_calories: Math.round(item.avg_calories),
    avg_protein: Math.round(item.avg_protein),
    avg_carbs: Math.round(item.avg_carbs),
    avg_fat: Math.round(item.avg_fat)
  }));

  // ข้อมูลสำหรับ Macro Distribution Pie Chart
  const macroData = [
    { name: 'โปรตีน', value: avgProtein, color: '#3B82F6', calories: avgProtein * 4 },
    { name: 'คาร์บ', value: avgCarbs, color: '#F59E0B', calories: avgCarbs * 4 },
    { name: 'ไขมัน', value: avgFat, color: '#10B981', calories: avgFat * 9 }
  ];

  // คำนวณเปอร์เซ็นต์ macro
  const totalMacroCalories = macroData.reduce((sum, macro) => sum + macro.calories, 0);
  const macroPercentages = macroData.map(macro => ({
    ...macro,
    percentage: totalMacroCalories > 0 ? (macro.calories / totalMacroCalories * 100).toFixed(1) : 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">สัปดาห์ {label}</p>
          <div className="space-y-1">
            <p className="text-sm text-red-600">
              <span className="font-medium">แคลอรี่:</span> {data.avg_calories} kcal
            </p>
            <p className="text-sm text-blue-600">
              <span className="font-medium">โปรตีน:</span> {data.avg_protein} g
            </p>
            <p className="text-sm text-yellow-600">
              <span className="font-medium">คาร์บ:</span> {data.avg_carbs} g
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">ไขมัน:</span> {data.avg_fat} g
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">บันทึก:</span> {data.logged_days} วัน
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            สรุปโภชนาการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Flame className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">แคลอรี่เฉลี่ย</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {Math.round(avgCalories)}
              </p>
              <p className="text-xs text-gray-500">kcal/วัน</p>
              {targets && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">เป้าหมาย: {targets.calories}</p>
                  <Progress 
                    value={(avgCalories / targets.calories) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">โปรตีน</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(avgProtein)}
              </p>
              <p className="text-xs text-gray-500">g/วัน</p>
              {targets && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">เป้าหมาย: {Math.round(targets.protein)}g</p>
                  <Progress 
                    value={(avgProtein / targets.protein) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 rounded mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">คาร์บ</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {Math.round(avgCarbs)}
              </p>
              <p className="text-xs text-gray-500">g/วัน</p>
              {targets && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">เป้าหมาย: {Math.round(targets.carbs)}g</p>
                  <Progress 
                    value={(avgCarbs / targets.carbs) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ไขมัน</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {Math.round(avgFat)}
              </p>
              <p className="text-xs text-gray-500">g/วัน</p>
              {targets && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">เป้าหมาย: {Math.round(targets.fat)}g</p>
                  <Progress 
                    value={(avgFat / targets.fat) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calories Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            แนวโน้มแคลอรี่รายสัปดาห์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="week"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                {targets && (
                  <Line
                    type="monotone"
                    dataKey={() => targets.calories}
                    stroke="#9CA3AF"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="avg_calories"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fill="url(#caloriesGradient)"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              สัดส่วน Macronutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroPercentages}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                  >
                    {macroPercentages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              {macroPercentages.map((macro, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="text-sm font-medium">{macro.name}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: macro.color }}>
                    {macro.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">{Math.round(macro.value)}g</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Macro Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              แนวโน้ม Macronutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="week"
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avg_protein"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_carbs"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_fat"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
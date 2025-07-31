"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

/**
 * ProgressOverview Component - แสดงข้อมูลความก้าวหน้าสำคัญ
 * @param {Object} progressData - ข้อมูลความก้าวหน้า
 */
export default function ProgressOverview({ progressData }) {
  if (!progressData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📈</span>
            <span>ความก้าวหน้าล่าสุด</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            ไม่มีข้อมูลความก้าวหน้า
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data } = progressData;

  // คำนวณ trend colors และ icons
  const getWeightTrendDisplay = (trend) => {
    if (trend > 0) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: `+${trend.toFixed(1)} กก.`
      };
    } else if (trend < 0) {
      return {
        icon: <TrendingDown className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        text: `${trend.toFixed(1)} กก.`
      };
    } else {
      return {
        icon: <Target className="w-4 h-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        text: "เท่าเดิม"
      };
    }
  };

  const weightTrend = getWeightTrendDisplay(data.weight.trend);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📈</span>
          <span>ความก้าวหน้าล่าสุด</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weight Progress */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">⚖️</span>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${weightTrend.bgColor}`}>
                {weightTrend.icon}
                <span className={`text-sm font-medium ${weightTrend.color}`}>
                  {weightTrend.text}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.weight.current} กก.
            </div>
            <div className="text-sm text-gray-500">น้ำหนักปัจจุบัน</div>
          </div>

          {/* Workout Streak */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-6 h-6 text-green-600" />
              <Badge className="bg-green-100 text-green-700">
                {data.workout.streak} วัน
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.workout.weeklyCompletions}
            </div>
            <div className="text-sm text-gray-500">ครั้งในสัปดาห์</div>
          </div>

          {/* Nutrition Average */}
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🍽️</span>
              <Badge className="bg-orange-100 text-orange-700">
                เฉลี่ย
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.nutrition.avgDailyCalories.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">แคลอรี่/วัน</div>
          </div>
        </div>

        {/* Quick History Charts */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">ประวัติ 7 วันล่าสุด</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight History Mini Chart */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 mb-2">น้ำหนัก (กก.)</div>
              <div className="flex items-end justify-between h-16 space-x-1">
                {data.weight.history.slice(-7).map((record, index) => (
                  <div
                    key={index}
                    className="bg-blue-400 rounded-t-sm relative group cursor-pointer"
                    style={{
                      height: `${Math.max(10, (record.weight / Math.max(...data.weight.history.map(r => r.weight))) * 100)}%`,
                      width: `${100/7}%`
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black text-white text-xs px-2 py-1 rounded">
                        {record.weight} กก.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout History Mini Chart */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 mb-2">การออกกำลังกาย</div>
              <div className="flex items-end justify-between h-16 space-x-1">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const workout = data.workout.history.find(w => w.date === dateStr);
                  const hasWorkout = workout && workout.completed_programs > 0;
                  
                  return (
                    <div
                      key={i}
                      className={`rounded-t-sm relative group cursor-pointer ${
                        hasWorkout ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                      style={{
                        height: hasWorkout ? '100%' : '20%',
                        width: `${100/7}%`
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                          <br />
                          {hasWorkout ? `${workout.completed_programs} โปรแกรม` : 'ไม่ออกกำลังกาย'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
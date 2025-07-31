"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Dumbbell, 
  Utensils, 
  Flame,
  BarChart3,
  Clock,
  TrendingUp
} from "lucide-react";

export default function ProgressStats({ workoutStats, nutritionStats, periodDays }) {
  const {
    total_workout_days = 0,
    active_plans = 0,
    total_volume = 0,
    avg_reps = 0,
    total_sets = 0
  } = workoutStats || {};

  const {
    logged_days = 0,
    avg_calories = 0,
    avg_protein = 0,
    avg_carbs = 0,
    avg_fat = 0,
    total_calories = 0
  } = nutritionStats || {};

  // คำนวณสถิติเพิ่มเติม
  const workoutFrequency = total_workout_days > 0 ? ((total_workout_days / periodDays) * 100).toFixed(1) : 0;
  const nutritionConsistency = logged_days > 0 ? ((logged_days / periodDays) * 100).toFixed(1) : 0;
  const avgVolumePerWorkout = total_workout_days > 0 ? (total_volume / total_workout_days).toFixed(0) : 0;
  const avgSetsPerWorkout = total_workout_days > 0 ? (total_sets / total_workout_days).toFixed(1) : 0;

  const statCards = [
    {
      title: "ความสม่ำเสมอในการออกกำลังกาย",
      value: `${workoutFrequency}%`,
      subtitle: `${total_workout_days} วันจาก ${periodDays} วัน`,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Volume เฉลี่ยต่อวัน",
      value: `${Math.round(avgVolumePerWorkout).toLocaleString()}`,
      subtitle: "kg ต่อวันฝึก",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "เซตเฉลี่ยต่อการฝึก",
      value: avgSetsPerWorkout,
      subtitle: `รวม ${total_sets} เซต`,
      icon: Dumbbell,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "การบันทึกโภชนาการ",
      value: `${nutritionConsistency}%`,
      subtitle: `${logged_days} วันจาก ${periodDays} วัน`,
      icon: Utensils,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          สถิติรายละเอียด
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nutrition Breakdown */}
        {logged_days > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              สรุปโภชนาการเฉลี่ย (ต่อวัน)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">แคลอรี่</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {Math.round(avg_calories)}
                </p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">โปรตีน</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(avg_protein)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">คาร์บ</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.round(avg_carbs)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">ไขมัน</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {Math.round(avg_fat)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
            </div>
          </div>
        )}

        {/* Workout Performance Metrics */}
        {total_workout_days > 0 && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              ประสิทธิภาพการฝึก
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">แผนที่ใช้งาน</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {active_plans}
                </p>
                <p className="text-xs text-gray-500">แผน</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">ท่า/วัน</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {avg_reps ? Math.round(avg_reps) : '-'}
                </p>
                <p className="text-xs text-gray-500">reps เฉลี่ย</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(total_volume).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
            </div>
          </div>
        )}

        {/* No Data States */}
        {total_workout_days === 0 && logged_days === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">ยังไม่มีข้อมูลการฝึกและโภชนาการ</p>
            <p className="text-sm text-gray-400">
              เริ่มบันทึกการออกกำลังกายและอาหารเพื่อดูสถิติที่นี่
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
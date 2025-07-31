"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, UtensilsCrossed, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

/**
 * TodaysFocus Component - แสดงแผนของวันนี้
 * @param {Object} todaysData - ข้อมูลแผนของวันนี้
 * @param {number} memberId - รหัสสมาชิก
 */
export default function TodaysFocus({ todaysData, memberId }) {
  if (!todaysData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>วันนี้</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📅</div>
            <p>ไม่มีแผนสำหรับวันนี้</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data } = todaysData;
  const todayFormatted = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>วันนี้</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {todayFormatted}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workout Plan Section */}
        {data.workout ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">การออกกำลังกาย</h3>
              </div>
              <Badge 
                className={`${
                  data.workout.progress === 100 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {data.workout.progress}% เสร็จแล้ว
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{data.workout.plan_name}</span>
                <span className="text-gray-500">
                  {data.workout.completed_today}/{data.workout.total_programs} โปรแกรม
                </span>
              </div>
              
              <Progress value={data.workout.progress} className="h-2" />
              
              {data.workout.plan_note && (
                <p className="text-xs text-gray-600 mt-2">
                  💡 {data.workout.plan_note}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>เป้าหมาย {data.workout.weekly_target} ครั้ง/สัปดาห์</span>
              </div>
              
              <Button size="sm" asChild>
                <Link href={`/member/${memberId}/quick-add/workout-log`}>
                  {data.workout.progress === 100 ? 'ดูผลลัพธ์' : 'เริ่มออกกำลังกาย'}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Dumbbell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">ไม่มีแผนการออกกำลังกายสำหรับวันนี้</p>
            <Button size="sm" variant="outline" className="mt-2" asChild>
              <Link href={`/member/${memberId}/program`}>
                ดูแผนทั้งหมด
              </Link>
            </Button>
          </div>
        )}

        {/* Nutrition Plan Section */}
        {data.nutrition ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">โภชนาการ</h3>
              </div>
              <Badge className="bg-green-100 text-green-700">
                วันนี้
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Calories Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>แคลอรี่</span>
                  <span className="text-gray-500">
                    {data.nutrition.consumed_calories_today}/{data.nutrition.calorie_target || 'ไม่ระบุ'} kcal
                  </span>
                </div>
                {data.nutrition.calorie_target && (
                  <Progress 
                    value={Math.min(100, (data.nutrition.consumed_calories_today / data.nutrition.calorie_target) * 100)} 
                    className="h-2" 
                  />
                )}
              </div>

              {/* Macros Summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded">
                  <div className="font-medium text-red-600">
                    {data.nutrition.protein_ratio || 0}%
                  </div>
                  <div className="text-gray-500">โปรตีน</div>
                </div>
                <div className="p-2 bg-white rounded">
                  <div className="font-medium text-blue-600">
                    {data.nutrition.carb_ratio || 0}%
                  </div>
                  <div className="text-gray-500">คาร์บ</div>
                </div>
                <div className="p-2 bg-white rounded">
                  <div className="font-medium text-yellow-600">
                    {data.nutrition.fat_ratio || 0}%
                  </div>
                  <div className="text-gray-500">ไขมัน</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span>โปรตีน: {data.nutrition.consumed_protein_today}g วันนี้</span>
              </div>
              
              <Button size="sm" asChild>
                <Link href={`/member/${memberId}/quick-add/macro-log`}>
                  บันทึกอาหาร
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">ไม่มีแผนโภชนาการสำหรับวันนี้</p>
            <Button size="sm" variant="outline" className="mt-2" asChild>
              <Link href={`/member/${memberId}/nutrition`}>
                ดูแผนโภชนาการ
              </Link>
            </Button>
          </div>
        )}


      </CardContent>
    </Card>
  );
}
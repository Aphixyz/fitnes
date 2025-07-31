"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dumbbell, 
  Target, 
  Calendar, 
  Trophy, 
  Flame,
  TrendingUp,
  Play,
  Clock
} from "lucide-react";
import Link from "next/link";

/**
 * WorkoutMotivationDisplay Component - แสดงภาพรวม เป้าหมาย และโปรแกรมวันนี้
 * @param {Object} workoutData - ข้อมูลการออกกำลังกาย
 * @param {number} memberId - รหัสสมาชิก
 */
export default function WorkoutMotivationDisplay({ workoutData, memberId }) {
  if (!workoutData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Dumbbell className="w-5 h-5" />
            <span>การออกกำลังกาย</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-2">🏋️‍♂️</div>
          <p className="text-gray-500 mb-4">ไม่มีแผนการออกกำลังกาย</p>
          <Button size="sm" asChild>
            <Link href={`/member/${memberId}/program`}>
              ดูแผนทั้งหมด
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data } = workoutData;
  const todayDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // คำนวณ progress เป้าหมายสัปดาห์
  const weeklyProgress = data.goals?.weeklyTarget > 0 
    ? Math.min(100, (data.overview.thisWeekWorkouts / data.goals.weeklyTarget) * 100)
    : 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="w-5 h-5" />
            <span className="text-sm font-medium">การออกกำลังกาย</span>
          </div>
        </CardTitle>
        
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-sm font-bold text-gray-900">
                {data.overview.currentStreak}
              </span>
            </div>
            <div className="text-[10px] text-gray-500">วันติดต่อกัน</div>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="w-3 h-3 text-green-600" />
              <span className="text-sm font-bold text-gray-900">
                {data.overview.thisWeekWorkouts}
              </span>
            </div>
            <div className="text-[10px] text-gray-500">ครั้งสัปดาห์นี้</div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Trophy className="w-3 h-3 text-purple-600" />
              <span className="text-sm font-bold text-gray-900">
                {data.overview.totalPrograms}
              </span>
            </div>
            <div className="text-[10px] text-gray-500">โปรแกรมรวม</div>
          </div>
        </div>

        {/* Available Programs */}
        <div className="flex-1 min-h-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-700">โปรแกรมที่พร้อมบันทึก</h4>
            <Button size="sm" variant="ghost" className="text-xs h-6 px-2" asChild>
              <Link href={`/member/${memberId}/program`}>
                ทั้งหมด
              </Link>
            </Button>
          </div>

          {data.availablePrograms && data.availablePrograms.length > 0 ? (
            <div className="space-y-2 overflow-y-auto">
              {data.availablePrograms.slice(0, 4).map((program, index) => (
                <div 
                  key={program.workout_program_id}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs text-gray-900 truncate">
                        {program.program_name}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {program.exercise_count} การออกกำลังกาย
                      </div>
                    </div>
                    
                    <Button size="sm" className="text-xs h-6 px-2 ml-2" asChild>
                      <Link href={`/member/${memberId}/quick-add/workout-log?programId=${program.workout_program_id}`}>
                        บันทึก
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-2">ไม่มีโปรแกรมที่พร้อมบันทึก</p>
              <Button size="sm" variant="outline" className="text-xs h-6 px-2" asChild>
                <Link href={`/member/${memberId}/program`}>
                  ดูแผนทั้งหมด
                </Link>
              </Button>
            </div>
          )}
        </div>

        
      </CardContent>
    </Card>
  );
}
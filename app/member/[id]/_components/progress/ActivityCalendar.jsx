"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  Activity, 
  Utensils, 
  Weight,
  ChevronLeft,
  ChevronRight,
  Info,
  X
} from "lucide-react";

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ActivityCalendar({ data }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  if (!data || !data.calendar_data || data.calendar_data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No activity data available</p>
            <p className="text-sm text-gray-400">
              Start logging workouts and nutrition to see your activity calendar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // สร้าง Map ของข้อมูลกิจกรรมตามวันที่
  const activityMap = new Map();
  data.calendar_data.forEach(item => {
    activityMap.set(item.date, item);
  });

  // สร้างปฏิทินสำหรับเดือนที่เลือก
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // เริ่มจากวันอาทิตย์

    const days = [];
    const currentDate = new Date(startDate);

    // สร้างวันที่ครบ 42 วัน (6 สัปดาห์)
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === selectedMonth;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const activityData = activityMap.get(dateStr);

      days.push({
        date: new Date(currentDate),
        dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        activity: activityData || null
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // ฟังก์ชันสำหรับเลือกสีของวัน
  const getDayColor = (activity) => {
    if (!activity || activity.intensity_level === 0) {
      return 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700';
    }

    const colors = [
      'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700', // level 0
      'bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800', // level 1
      'bg-green-300 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-700', // level 2
      'bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600', // level 3
      'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500'  // level 4
    ];

    return colors[Math.min(activity.intensity_level, 4)];
  };

  // ฟังก์ชันสำหรับสร้าง tooltip content
  const getTooltipContent = (dayData) => {
    if (!dayData.activity) {
      return (
        <div className="text-center">
          <p className="font-medium">{dayData.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p className="text-sm text-gray-500 mt-1">No activity recorded</p>
        </div>
      );
    }

    const activity = dayData.activity;
    return (
      <div className="min-w-64">
        <p className="font-medium mb-2">{dayData.date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        
        <div className="space-y-2">
          {activity.workout && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Workout: {activity.workout.programs_completed} programs, {activity.workout.total_sets} sets</span>
            </div>
          )}
          
          {activity.nutrition && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Nutrition: {Math.round(activity.nutrition.calories)} kcal logged</span>
            </div>
          )}
          
          {activity.health && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Health: {activity.health.has_weight ? 'Weight' : ''} {activity.health.has_measurements ? 'Measurements' : ''} recorded</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500">
            Activity Score: {activity.intensity ? activity.intensity.toFixed(1) : 0}
          </p>
        </div>
      </div>
    );
  };

  // นำทางเดือน
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  // ฟังก์ชันสำหรับจัดการคลิกวัน
  const handleDayClick = (dayData) => {
    setSelectedDay(dayData);
    if (dayData.activity) {
      setShowDayDetail(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Calendar Header */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              ปฏิทินกิจกรรม
            </CardTitle>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentMonth}
              className="text-xs px-3 py-1 h-8"
            >
              วันนี้
            </Button>
          </div>
          
          {/* Mobile Month Navigation - Enhanced Touch */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={goToPreviousMonth}
              className="h-12 w-12 p-0 rounded-full touch-manipulation transition-all duration-200 active:scale-95 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="text-center flex-1 mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {MONTHS[selectedMonth]} {selectedYear}
              </h3>
            </div>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={goToNextMonth}
              className="h-12 w-12 p-0 rounded-full touch-manipulation transition-all duration-200 active:scale-95 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Workouts</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {data.statistics.workout_days}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Utensils className="h-5 w-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Nutrition</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {data.statistics.nutrition_days}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Weight className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Health</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {data.statistics.health_tracking_days}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Consistency</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {data.statistics.consistency_percentage}%
              </p>
              <p className="text-xs text-gray-500">active days</p>
            </div>
          </div>

          {/* Calendar Header - Mobile Optimized */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
              <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Mobile Calendar Grid - Enhanced Touch */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {calendarDays.map((dayData, index) => (
              <button
                key={index}
                className={`
                  relative h-14 w-full rounded-xl border-2 
                  transition-all duration-200 active:scale-95 
                  touch-manipulation select-none
                  ${getDayColor(dayData.activity)}
                  ${!dayData.isCurrentMonth ? 'opacity-30' : ''}
                  ${dayData.isToday ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' : 'border-transparent'}
                  ${dayData.activity ? 'hover:scale-105 shadow-sm' : ''}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                `}
                onClick={() => handleDayClick(dayData)}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = ''}
                onTouchCancel={(e) => e.currentTarget.style.transform = ''}
                aria-label={`${dayData.date.toLocaleDateString('th-TH')} ${dayData.activity ? 'มีกิจกรรม' : 'ไม่มีกิจกรรม'}`}
              >
                <span className={`
                  text-base font-medium 
                  ${dayData.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}
                  ${dayData.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                `}>
                  {dayData.day}
                </span>
                
                {/* Mobile Activity indicators - Enhanced */}
                {dayData.activity && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {dayData.activity.workout && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>
                    )}
                    {dayData.activity.nutrition && (
                      <div className="w-2.5 h-2.5 bg-orange-600 rounded-full shadow-sm"></div>
                    )}
                    {dayData.activity.health && (
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full shadow-sm"></div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Legend */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">ระดับกิจกรรม</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-500">น้อย</span>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded-sm"></div>
                <div className="w-4 h-4 bg-green-300 dark:bg-green-800 rounded-sm"></div>
                <div className="w-4 h-4 bg-green-400 dark:bg-green-700 rounded-sm"></div>
                <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded-sm"></div>
                <span className="text-xs text-gray-500">มาก</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>ออกกำลังกาย</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span>อาหาร</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span>สุขภาพ</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Activity Summary */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">
              สรุป {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            วันที่มีกิจกรรมในเดือนนี้: {
              calendarDays
                .filter(day => day.isCurrentMonth && day.activity && day.activity.activity_count > 0)
                .length
            } / {new Date(selectedYear, selectedMonth + 1, 0).getDate()} วัน
          </p>
        </CardContent>
      </Card>

      {/* Mobile Detail Dialog */}
      <Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedDay?.date.toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDayDetail(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay?.activity ? (
            <div className="space-y-4">
              {selectedDay.activity.workout && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium text-blue-700 dark:text-blue-300">การออกกำลังกาย</span>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <p>โปรแกรม: {selectedDay.activity.workout.programs_completed}</p>
                    <p>เซต: {selectedDay.activity.workout.total_sets}</p>
                    <p>Volume: {Math.round(selectedDay.activity.workout.daily_volume).toLocaleString()} kg</p>
                  </div>
                </div>
              )}
              
              {selectedDay.activity.nutrition && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="font-medium text-orange-700 dark:text-orange-300">โภชนาการ</span>
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                    <p>แคลอรี่: {Math.round(selectedDay.activity.nutrition.calories)} kcal</p>
                    <p>โปรตีน: {Math.round(selectedDay.activity.nutrition.protein)} g</p>
                    <p>คาร์บ: {Math.round(selectedDay.activity.nutrition.carb)} g</p>
                    <p>ไขมัน: {Math.round(selectedDay.activity.nutrition.fat)} g</p>
                  </div>
                </div>
              )}
              
              {selectedDay.activity.health && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="font-medium text-purple-700 dark:text-purple-300">การติดตามสุขภาพ</span>
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                    {selectedDay.activity.health.has_weight && (
                      <p>น้ำหนัก: {selectedDay.activity.health.weight} kg</p>
                    )}
                    {selectedDay.activity.health.body_fat && (
                      <p>ไขมัน: {selectedDay.activity.health.body_fat}%</p>
                    )}
                    {selectedDay.activity.health.has_measurements && (
                      <p>บันทึกการวัดร่างกาย</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 text-center">
                  คะแนนกิจกรรม: {selectedDay.activity.intensity ? selectedDay.activity.intensity.toFixed(1) : 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">ไม่มีกิจกรรมในวันนี้</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
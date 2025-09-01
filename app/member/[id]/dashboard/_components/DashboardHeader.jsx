'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * Sticky Header Component สำหรับ Member Dashboard
 * พร้อม Date Navigation และ Profile Image
 */
export default function DashboardHeader({ 
  memberData, 
  onDateChange, 
  initialDate = new Date() 
}) {
  const params = useParams();
  const memberId = params.id;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // อัพเดทข้อมูลเมื่อวันที่เปลี่ยน
  useEffect(() => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  // ฟังก์ชันเปลี่ยนวันที่
  const handlePrevDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // ฟอร์แมทวันที่เป็นภาษาไทย
  const formatThaiDate = (date) => {
    return format(date, "EEE d MMM", { locale: th });
  };

  // ตรวจสอบว่าเป็นวันนี้หรือไม่
  const isSelectedToday = isToday(selectedDate);

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm size-20 w-full">
      <div className="px-8 py-3 pt-4 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Empty for balance */}
          <div className="w-8"></div>

          {/* Center - Date Navigation Controls */}
          <div className="flex items-center space-x-2 mx-4">
            {/* Previous Day Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="p-1 h-8 w-8"
              aria-label="วันก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Date Selector (Clickable) */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    min-w-[100px] justify-center text-sm font-medium
                    ${isSelectedToday ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}
                    hover:bg-gray-100 transition-colors
                  `}
                  aria-label="เลือกวันที่"
                >
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatThaiDate(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={th}
                  initialFocus
                  disabled={(date) => date > new Date()} // ไม่ให้เลือกวันในอนาคต
                  className="rounded-md border"
                />
                
                {/* Quick Date Options */}
                <div className="p-3 border-t space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleDateSelect(new Date())}
                  >
                    วันนี้
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleDateSelect(subDays(new Date(), 1))}
                  >
                    เมื่อวาน
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleDateSelect(subDays(new Date(), 7))}
                  >
                    1 สัปดาห์ที่แล้ว
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Next Day Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              disabled={isToday(selectedDate)} // ไม่ให้ไปวันถัดไปถ้าเป็นวันนี้
              className="p-1 h-8 w-8 disabled:opacity-50"
              aria-label="วันถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side - Profile Image */}
          <div className="flex-shrink-0">
            <Link href={`/member/${memberId}/profile`} className="block">
              <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200">
                <AvatarImage 
                  src={memberData?.profileImage ? `/uploads/${memberData.profileImage}` : undefined}
                  alt={`${memberData?.name || 'สมาชิก'} profile`} 
                />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {memberData?.name?.charAt(0).toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
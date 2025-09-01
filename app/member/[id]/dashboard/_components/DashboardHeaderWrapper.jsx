'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import DashboardHeader from './DashboardHeader';

/**
 * Wrapper Component สำหรับ DashboardHeader
 * จัดการ URL navigation เมื่อมีการเปลี่ยนวันที่
 */
export default function DashboardHeaderWrapper({ 
  memberData, 
  memberId, 
  initialDate 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ฟังก์ชันจัดการการเปลี่ยนวันที่
  const handleDateChange = useCallback((newDate) => {
    const params = new URLSearchParams(searchParams);
    
    // ถ้าเป็นวันนี้ ให้ลบ date parameter ออก
    const today = new Date();
    const isToday = newDate.toDateString() === today.toDateString();
    
    if (isToday) {
      params.delete('date');
    } else {
      // เพิ่ม date parameter ในรูปแบบ YYYY-MM-DD
      const dateString = newDate.toISOString().split('T')[0];
      params.set('date', dateString);
    }
    
    // อัพเดท URL โดยไม่ reload หน้า
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <DashboardHeader
      memberData={memberData}
      onDateChange={handleDateChange}
      initialDate={initialDate}
    />
  );
}
"use client";

import { useRouter } from "next/navigation";

const HistoryList = ({ data, unit, formatDate, memberId }) => {
  const router = useRouter();
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-3">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">
          ยังไม่มีประวัติข้อมูล
        </p>
      </div>
    );
  }

  const formatDateExtended = (dateString) => {
    const date = new Date(dateString);
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    
    const currentYear = new Date().getFullYear();
    const year = date.getFullYear();
    const thaiYear = year + 543;
    
    let dateStr = `${date.getDate()} ${thaiMonths[date.getMonth()]}`;
    
    // Add year if not current year
    if (year !== currentYear) {
      dateStr += ` ${thaiYear}`;
    }
    
    return dateStr;
  };

  // Sort data by date (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleItemClick = (healthId) => {
    if (healthId && memberId) {
      router.push(`/member/${memberId}/profile/measures/${healthId}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
      {sortedData.map((item, index) => (
        <div 
          key={index} 
          className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => handleItemClick(item.member_health_id)}
        >
          <div className="text-gray-900 font-medium">
            {formatDateExtended(item.date)}
          </div>
          <div className="text-gray-900 font-semibold">
            {Math.round(item.value)}{unit}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
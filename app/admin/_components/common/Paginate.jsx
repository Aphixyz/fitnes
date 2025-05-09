"use client";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  disableNavigation = false,
  disableNextOnly = false
}) {
  const handlePrevious = () => {
    if (disableNavigation) return;
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (disableNavigation || disableNextOnly) return;
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // สร้างปุ่มสำหรับแต่ละหน้า
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5; // จำนวนปุ่มหน้าที่แสดงสูงสุด
    
    if (totalPages <= maxVisiblePages) {
      // ถ้ามีจำนวนหน้าไม่มาก แสดงทั้งหมด
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => disableNavigation ? null : onPageChange(i)}
            disabled={disableNavigation}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : disableNavigation
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // ถ้ามีจำนวนหน้ามาก แสดงเพียงบางส่วน
      
      // เริ่มด้วยหน้าแรกเสมอ
      buttons.push(
        <button
          key={1}
          onClick={() => disableNavigation ? null : onPageChange(1)}
          disabled={disableNavigation}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-blue-600 text-white'
              : disableNavigation
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          1
        </button>
      );
      
      // คำนวณช่วงที่จะแสดง
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // แสดงจุดไข่ปลาถ้าไม่ได้เริ่มที่หน้า 2
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
      
      // แสดงปุ่มสำหรับหน้าในช่วงที่คำนวณ
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => disableNavigation ? null : onPageChange(i)}
            disabled={disableNavigation}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : disableNavigation
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
      
      // แสดงจุดไข่ปลาถ้าไม่ได้จบที่หน้าก่อนสุดท้าย
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      
      // จบด้วยหน้าสุดท้ายเสมอ (ถ้าไม่ใช่หน้าเดียว)
      if (totalPages > 1) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => disableNavigation ? null : onPageChange(totalPages)}
            disabled={disableNavigation}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-blue-600 text-white'
                : disableNavigation
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="flex justify-center items-center mt-4 space-x-2">
      {/* ปุ่มก่อนหน้า */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || disableNavigation}
        className={`px-3 py-1 rounded ${
          currentPage === 1 || disableNavigation
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        &lt;
      </button>
      
      {/* ปุ่มหมายเลขหน้า */}
      <div className="flex space-x-1">
        {renderPageButtons()}
      </div>
      
      {/* ปุ่มถัดไป */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || disableNavigation}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages || disableNavigation
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        &gt;
      </button>
    </div>
  );
}
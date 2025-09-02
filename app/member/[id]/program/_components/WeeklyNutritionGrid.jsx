"use client";

/**
 * WeeklyNutritionGrid Component
 * แสดง weekly nutrition plan ในรูปแบบ grid 7x4
 * @param {Object} nutritionData - ข้อมูล nutrition plan
 */
const WeeklyNutritionGrid = ({ nutritionData }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  // ถ้าไม่มีข้อมูล nutrition
  if (!nutritionData) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
        <div className="text-gray-400 mb-3 sm:mb-4">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          ยังไม่มีแผนโภชนาการ
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          กรุณาติดต่อเทรนเนอร์เพื่อขอรับแผนโภชนาการที่เหมาะกับคุณ
        </p>
      </div>
    );
  }

  // คำนวณ relative height สำหรับแต่ละ nutrient (ยกเว้น calories ที่จะคงที่)
  const maxValue = Math.max(
    nutritionData.protein || 0,
    nutritionData.carb || 0,
    nutritionData.fat || 0
  );

  const getRelativeHeight = (value) => {
    if (maxValue === 0) return 60; // minimum height
    const minHeight = 60;
    const maxHeight = 120;
    const ratio = value / maxValue;
    return Math.max(minHeight, minHeight + (maxHeight - minHeight) * ratio);
  };

  const caloriesHeight = 80; // Fixed height สำหรับ calories
  const proteinHeight = getRelativeHeight(nutritionData.protein || 0);
  const carbHeight = getRelativeHeight(nutritionData.carb || 0);
  const fatHeight = getRelativeHeight(nutritionData.fat || 0);

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden">
      {/* Grid Container */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day Headers */}
          {dayNames.map((day, index) => (
            <div
              key={`day-${index}`}
              className="text-center font-medium text-xs sm:text-sm text-gray-700 mb-2"
              title={dayNames[index]}
            >
              {day}
            </div>
          ))}

          {/* Calories Row */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`calories-${index}`}
              className="bg-blue-300 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium text-gray-800 mb-1"
              style={{ height: `${caloriesHeight}px` }}
              title={`แคลอรี่: ${nutritionData.calories || 0} kcal`}
            >
              <div className="text-center">
                <div className="font-bold">{nutritionData.calories || 0}</div>
              </div>
            </div>
          ))}

          {/* Protein Row */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`protein-${index}`}
              className="bg-orange-300 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium text-gray-800 mb-1"
              style={{ height: `${proteinHeight}px` }}
              title={`โปรตีน: ${nutritionData.protein || 0} กรัม`}
            >
              <div className="text-center">
                <div className="font-bold">{nutritionData.protein || 0} P</div>
              </div>
            </div>
          ))}

          {/* Fat Row */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`fat-${index}`}
              className="bg-yellow-300 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium text-gray-800 mb-1"
              style={{ height: `${fatHeight}px` }}
              title={`ไขมัน: ${nutritionData.fat || 0} กรัม`}
            >
              <div className="text-center">
                <div className="font-bold">{nutritionData.fat || 0} F</div>
              </div>
            </div>
          ))}

          {/* Carb Row */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`carb-${index}`}
              className="bg-green-300 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium text-gray-800"
              style={{ height: `${carbHeight}px` }}
              title={`คาร์โบไหเดรต: ${nutritionData.carb || 0} กรัม`}
            >
              <div className="text-center">
                <div className="font-bold">{nutritionData.carb || 0} C</div>
              </div>
            </div>
          ))}
        </div>

      </div>
  );
};

export default WeeklyNutritionGrid;
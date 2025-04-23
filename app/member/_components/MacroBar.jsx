"use client";

import React from 'react';

/**
 * MacroBar component สำหรับแสดงเป้าหมายของสารอาหารและแคลอรี่
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {number} props.dailyCalories - เป้าหมายแคลอรี่ต่อวัน
 * @param {number} props.caloriesPercentage - เปอร์เซ็นต์ของแคลอรี่ที่บรรลุเป้าหมาย
 * @param {Object} props.macros - เป้าหมายสารอาหารหลัก (โปรตีน, คาร์โบไฮเดรต, ไขมัน)
 * @param {Object} props.percentages - เปอร์เซ็นต์ความสำเร็จของสารอาหารหลัก
 */
const MacroBar = ({ 
  dailyCalories, 
  caloriesPercentage = 0,
  macros = { protein: 0, carbs: 0, fat: 0 }, 
  percentages = { protein: 0, carbs: 0, fat: 0 } 
}) => {
  // Function สำหรับกำหนดขนาดของ progress bar
  const getProgressWidth = (percentage) => {
    return `${Math.min(percentage, 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* แถบแคลอรี่หลัก */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <h3 className="text-lg font-semibold">เป้าหมายแคลอรี่ต่อวัน</h3>
          <span className="font-bold">{dailyCalories || '0'} kcal</span>
        </div>
        
        {/* Progress bar for calories */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: getProgressWidth(caloriesPercentage) }}
          ></div>
        </div>
        
        <div className="text-right text-sm mt-1 text-gray-600">
          {caloriesPercentage}% ของเป้าหมาย
        </div>
      </div>
      
      {/* แถบสารอาหารหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-sm">โปรตีน</span>
            <span className="text-sm">{macros.protein || '0'}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: getProgressWidth(percentages.protein) }}
            ></div>
          </div>
          <div className="text-right text-xs mt-1 text-gray-600">
            {percentages.protein}%
          </div>
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-sm">คาร์โบไฮเดรต</span>
            <span className="text-sm">{macros.carbs || '0'}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: getProgressWidth(percentages.carbs) }}
            ></div>
          </div>
          <div className="text-right text-xs mt-1 text-gray-600">
            {percentages.carbs}%
          </div>
        </div>
        
        {/* Fat */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-sm">ไขมัน</span>
            <span className="text-sm">{macros.fat || '0'}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: getProgressWidth(percentages.fat) }}
            ></div>
          </div>
          <div className="text-right text-xs mt-1 text-gray-600">
            {percentages.fat}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroBar;
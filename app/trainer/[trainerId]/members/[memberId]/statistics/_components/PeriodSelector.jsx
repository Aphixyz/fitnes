import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periodOptions = [
    { value: "WEEK", label: "1 สัปดาห์ที่ผ่านมา" },
    { value: "1M", label: "1 เดือนที่ผ่านมา" },
    { value: "2M", label: "2 เดือนที่ผ่านมา" },
    { value: "3M", label: "3 เดือนที่ผ่านมา" },
    { value: "6M", label: "6 เดือนที่ผ่านมา" },
    { value: "1Y", label: "1 ปีที่ผ่านมา" },
    { value: "ALL", label: "ข้อมูลทั้งหมด" },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">ช่วงเวลา:</label>
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="เลือกช่วงเวลา" />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodSelector;

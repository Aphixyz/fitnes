"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  timeToSeconds,
  secondsToTime,
  distanceToMeters,
  metersToDistance,
} from "@/utils/utils";

export default function ProgramExerciseSets({
  sets = [],
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) {
  // State เก็บประเภทพารามิเตอร์ที่เลือกสำหรับแต่ละคอลัมน์
  const [column1Type, setColumn1Type] = useState("weight");
  const [column2Type, setColumn2Type] = useState("reps");

  // ตัวเลือกพื้นฐานสำหรับทุกประเภท parameter
  const baseParameterOptions = [
    { value: "weight", label: "น้ำหนัก - กิโลกรัม" },
    { value: "reps", label: "รอบ" },
    { value: "time", label: "เวลา" },
    { value: "distance", label: "ระยะ" },
    { value: "none", label: "ไม่กำหนด" },
  ];

  // สร้างตัวเลือกที่ไม่ซ้ำกันสำหรับแต่ละคอลัมน์
  const getColumn1Options = () =>
    baseParameterOptions.filter(
      (opt) => opt.value !== column2Type || opt.value === "none"
    );

  const getColumn2Options = () =>
    baseParameterOptions.filter(
      (opt) => opt.value !== column1Type || opt.value === "none"
    );

  // จัดการการเปลี่ยนประเภท column1
  const handleColumn1TypeChange = (newType) => {
    // ถ้าเลือกประเภทเดียวกับ column2 และไม่ใช่ 'none'
    if (newType === column2Type && newType !== "none") {
      setColumn2Type("none");
    }
    setColumn1Type(newType);

    // Reset ค่าที่ไม่เกี่ยวข้องเป็น null ในทุก set
    sets.forEach((set, idx) => {
      // เก็บค่าใหม่ตาม type และ reset ค่าอื่น ๆ
      if (newType !== "weight") onUpdateSet(idx, "weight", null);
      if (newType !== "reps") onUpdateSet(idx, "reps", null);
      if (newType !== "time") onUpdateSet(idx, "time", null);
      if (newType !== "distance") onUpdateSet(idx, "distance", null);

      // กำหนดค่าเริ่มต้นสำหรับ type ใหม่
      if (newType !== "none") {
        const defaultValue = getDefaultValueForType(newType);
        onUpdateSet(idx, newType, defaultValue);
      }
    });
  };

  // จัดการการเปลี่ยนประเภท column2
  const handleColumn2TypeChange = (newType) => {
    // ถ้าเลือกประเภทเดียวกับ column1 และไม่ใช่ 'none'
    if (newType === column1Type && newType !== "none") {
      setColumn1Type("none");
    }
    setColumn2Type(newType);

    // Reset ค่าที่ไม่เกี่ยวข้องเป็น null ในทุก set
    sets.forEach((set, idx) => {
      // ถ้าประเภทไม่ตรงกับ column1 หรือ column2 ที่เลือกใหม่ ให้ reset เป็น null
      const relevantTypes = [column1Type, newType];

      if (!relevantTypes.includes("weight")) onUpdateSet(idx, "weight", null);
      if (!relevantTypes.includes("reps")) onUpdateSet(idx, "reps", null);
      if (!relevantTypes.includes("time")) onUpdateSet(idx, "time", null);
      if (!relevantTypes.includes("distance"))
        onUpdateSet(idx, "distance", null);

      // กำหนดค่าเริ่มต้นสำหรับ type ใหม่
      if (newType !== "none") {
        const defaultValue = getDefaultValueForType(newType);
        onUpdateSet(idx, newType, defaultValue);
      }
    });
  };

  // เพิ่ม set
  const handleAddSet = (copyFromSet = null) => {
    // ถ้าเป็นการเพิ่ม set ใหม่โดยไม่มีการคัดลอก (กดปุ่ม "+ เพิ่มเซ็ต")
    if (!copyFromSet && sets.length > 0) {
      // คัดลอกจาก set ล่าสุด
      const lastSet = sets[sets.length - 1];
      onAddSet(lastSet);
    } else {
      // คัดลอกจาก set ที่ระบุ (กดปุ่ม "คัดลอกเซ็ตนี้")
      onAddSet(copyFromSet);
    }
  };

  // ลบ set
  const handleRemoveSet = (index) => {
    onRemoveSet(index);
  };

  // สร้างค่าเริ่มต้นตามประเภท parameter
  const getDefaultValueForType = (paramType) => {
    switch (paramType) {
      case "weight":
        return 10;
      case "reps":
        return 10;
      case "time":
        return 60; // 1 นาที (เป็นวินาที)
      case "distance":
        return 1000; // 1 กิโลเมตร (เป็นเมตร)
      default:
        return null;
    }
  };

  // แปลงค่าจาก input เป็นตัวเลข
  const parseNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // จัดการการเปลี่ยนแปลงค่าน้ำหนัก
  const handleWeightChange = (index, value) => {
    onUpdateSet(index, "weight", parseNumber(value));
  };

  // จัดการการเปลี่ยนแปลงค่ารอบ
  const handleRepsChange = (index, value) => {
    onUpdateSet(index, "reps", parseNumber(value));
  };

  // จัดการการเปลี่ยนแปลงค่าเวลา
  const handleTimeChange = (index, minutes, seconds) => {
    const mins = parseNumber(minutes) || 0;
    const secs = parseNumber(seconds) || 0;
    const totalSeconds = mins * 60 + secs;
    onUpdateSet(index, "time", totalSeconds > 0 ? totalSeconds : null);
  };

  // จัดการการเปลี่ยนแปลงค่าระยะทาง
  const handleDistanceChange = (index, kilometers, meters) => {
    const km = parseNumber(kilometers) || 0;
    const m = parseNumber(meters) || 0;
    const totalMeters = km * 1000 + m;
    onUpdateSet(index, "distance", totalMeters > 0 ? totalMeters : null);
  };

  // แสดงค่า parameter ตาม type ที่เลือก
  const renderParameterInput = (set, index, paramType) => {
    switch (paramType) {
      case "weight":
        return (
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={set.weight !== null ? set.weight : ""}
              onChange={(e) => handleWeightChange(index, e.target.value)}
              className="pr-8 text-right"
              placeholder="0"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
              kg
            </span>
          </div>
        );

      case "reps":
        return (
          <Input
            type="number"
            min="0"
            value={set.reps !== null ? set.reps : ""}
            onChange={(e) => handleRepsChange(index, e.target.value)}
            className="text-center"
            placeholder="10"
          />
        );

      case "time":
        // แยกวินาทีเป็นนาทีและวินาที
        const minutes = set.time ? Math.floor(set.time / 60) : "";
        const seconds = set.time ? set.time % 60 : "";

        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) =>
                  handleTimeChange(index, e.target.value, seconds)
                }
                className="text-center pr-7"
                placeholder="0"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
                นาที
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) =>
                  handleTimeChange(index, minutes, e.target.value)
                }
                className="text-center pr-7"
                placeholder="0"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
                วินาที
              </span>
            </div>
          </div>
        );

      case "distance":
        // แยกเมตรเป็นกิโลเมตรและเมตร
        const kilometers = set.distance ? Math.floor(set.distance / 1000) : "";
        const meters = set.distance ? set.distance % 1000 : "";

        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={kilometers}
                onChange={(e) =>
                  handleDistanceChange(index, e.target.value, meters)
                }
                className="text-center pr-7"
                placeholder="0"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
                กม.
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="999"
                value={meters}
                onChange={(e) =>
                  handleDistanceChange(index, kilometers, e.target.value)
                }
                className="text-center pr-7"
                placeholder="0"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
                ม.
              </span>
            </div>
          </div>
        );

      case "none":
      default:
        return (
          <div className="h-9 flex items-center justify-center text-sm text-muted-foreground">
            ไม่กำหนด
          </div>
        );
    }
  };

  // กำหนด column type จากข้อมูลที่มีอยู่ (เมื่อโหลดข้อมูลมาครั้งแรกหรือมีการเปลี่ยนแปลง sets)
  useEffect(() => {
    if (sets.length > 0) {
      // ตรวจสอบว่ามีค่าประเภทใดบ้างที่ไม่เป็น null
      const hasWeight = sets.some(
        (set) => set.weight !== null && set.weight !== undefined
      );
      const hasReps = sets.some(
        (set) => set.reps !== null && set.reps !== undefined
      );
      const hasTime = sets.some(
        (set) => set.time !== null && set.time !== undefined
      );
      const hasDistance = sets.some(
        (set) => set.distance !== null && set.distance !== undefined
      );

      // นับจำนวนประเภทที่มีข้อมูล
      const activeTypes = [
        hasWeight && "weight",
        hasReps && "reps",
        hasTime && "time",
        hasDistance && "distance",
      ].filter(Boolean);

      // กำหนด column type ตามประเภทที่มีข้อมูล
      if (activeTypes.length >= 1) {
        setColumn1Type(activeTypes[0]);
      }

      if (activeTypes.length >= 2) {
        setColumn2Type(activeTypes[1]);
      } else if (activeTypes.length === 1) {
        // ถ้ามีแค่ประเภทเดียว ให้ column2 เป็น none
        setColumn2Type("none");
      }
    }
  }, [sets]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="font-medium text-left p-2 w-[60px]">เซ็ต</th>

              {/* ส่วนหัวคอลัมน์ 1 - สามารถเลือกประเภทได้ */}
              <th className="font-medium p-2">
                <Select
                  value={column1Type}
                  onValueChange={handleColumn1TypeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกพารามิเตอร์" />
                  </SelectTrigger>
                  <SelectContent>
                    {getColumn1Options().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </th>

              {/* ส่วนหัวคอลัมน์ 2 - สามารถเลือกประเภทได้ */}
              <th className="font-medium p-2">
                <Select
                  value={column2Type}
                  onValueChange={handleColumn2TypeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกพารามิเตอร์" />
                  </SelectTrigger>
                  <SelectContent>
                    {getColumn2Options().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </th>

              {/* คอลัมน์สำหรับปุ่ม */}
              <th className="w-[120px] p-2"></th>
            </tr>
          </thead>
          <tbody>
            {sets.map((set, index) => (
              <tr
                key={set.setId || set.program_exercise_set_id || index}
                className={index % 2 === 0 ? "bg-muted/30" : ""}
              >
                {/* เลขเซ็ต */}
                <td className="p-2 text-center font-medium">{set.set_order}</td>

                {/* คอลัมน์ 1 - แสดง input ตามประเภทที่เลือก */}
                <td className="p-2">
                  {column1Type !== "none" ? (
                    renderParameterInput(set, index, column1Type)
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      ไม่กำหนด
                    </div>
                  )}
                </td>

                {/* คอลัมน์ 2 - แสดง input ตามประเภทที่เลือก */}
                <td className="p-2">
                  {column2Type !== "none" ? (
                    renderParameterInput(set, index, column2Type)
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      ไม่กำหนด
                    </div>
                  )}
                </td>

                {/* ปุ่มดำเนินการ */}
                <td className="p-2">
                  <div className="flex gap-1 justify-end">
                    {/* ปุ่มคัดลอกเซ็ต */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAddSet(set)}
                      title="คัดลอกเซ็ตนี้"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {/* ปุ่มลบเซ็ต */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleRemoveSet(index)}
                      title="ลบเซ็ตนี้"
                      disabled={sets.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ปุ่มเพิ่มเซ็ต */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => handleAddSet()}
      >
        <Plus className="h-4 w-4 mr-2" />
        เพิ่มเซ็ต
      </Button>
    </div>
  );
}

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

export default function ProgramExerciseSets({ sets = [], onUpdateSets }) {
  // ประกาศ state สำหรับจัดการข้อมูลเซ็ต
  const [localSets, setLocalSets] = useState(
    sets.length > 0
      ? sets
      : [
          {
            set_order: 1,
            weight: null,
            reps: 10,
            time: null,
            distance: null,
            rest: 60,
          },
        ]
  );

  // อัพเดต state เมื่อ props เปลี่ยน
  useEffect(() => {
    setLocalSets(
      sets.length > 0
        ? sets
        : [
            {
              set_order: 1,
              weight: null,
              reps: 10,
              time: null,
              distance: null,
              rest: 60,
            },
          ]
    );
  }, [sets]);

  // อัพเดต parent component เมื่อ localSets เปลี่ยนแปลง
  useEffect(() => {
    onUpdateSets(localSets);
  }, [localSets, onUpdateSets]);

  // เพิ่มเซ็ตใหม่
  const handleAddSet = () => {
    const lastSet = localSets[localSets.length - 1];
    const newSet = {
      set_order: localSets.length + 1,
      weight: lastSet?.weight || null,
      reps: lastSet?.reps || 10,
      time: lastSet?.time || null,
      distance: lastSet?.distance || null,
      rest: lastSet?.rest || 60,
    };

    setLocalSets([...localSets, newSet]);
  };

  // คัดลอกเซ็ต
  const handleCopySet = (index) => {
    const setToCopy = { ...localSets[index] };
    const newSet = {
      ...setToCopy,
      set_order: localSets.length + 1,
    };

    setLocalSets([...localSets, newSet]);
  };

  // ลบเซ็ต
  const handleDeleteSet = (index) => {
    if (localSets.length === 1) return; // ป้องกันการลบเซ็ตทั้งหมด

    const updatedSets = localSets.filter((_, i) => i !== index);
    // อัพเดต set_order
    const reorderedSets = updatedSets.map((set, i) => ({
      ...set,
      set_order: i + 1,
    }));

    setLocalSets(reorderedSets);
  };

  // อัพเดตค่าใน set
  const handleSetChange = (index, field, value) => {
    const updatedSets = [...localSets];

    // แปลงค่าเป็นตัวเลขถ้าเป็นฟิลด์ตัวเลข
    if (["weight", "reps", "rest"].includes(field) && value !== "") {
      updatedSets[index][field] = Number(value);
    } else {
      updatedSets[index][field] = value;
    }

    setLocalSets(updatedSets);
  };

  // ตัวเลือกสำหรับระยะเวลาพัก
  const restOptions = [
    { value: "30", label: "0:30" },
    { value: "45", label: "0:45" },
    { value: "60", label: "1:00" },
    { value: "90", label: "1:30" },
    { value: "120", label: "2:00" },
    { value: "150", label: "2:30" },
    { value: "180", label: "3:00" },
  ];

  return (
    <div>
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs font-medium text-muted-foreground px-2">
          <div className="col-span-1">เซ็ต</div>
          <div className="col-span-3">น้ำหนัก</div>
          <div className="col-span-3">จำนวน</div>
          <div className="col-span-4">พัก</div>
          <div className="col-span-1"></div>
        </div>

        {/* Set rows */}
        {localSets.map((set, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-sm font-medium">
              {set.set_order}
            </div>

            <div className="col-span-3">
              <div className="relative">
                <Input
                  type="number"
                  value={set.weight || ""}
                  onChange={(e) =>
                    handleSetChange(index, "weight", e.target.value)
                  }
                  className="pr-6 text-right"
                  placeholder="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs text-muted-foreground">
                  kg
                </span>
              </div>
            </div>

            <div className="col-span-3">
              <Input
                type="number"
                value={set.reps || ""}
                onChange={(e) => handleSetChange(index, "reps", e.target.value)}
                className="text-center"
                placeholder="10"
              />
            </div>

            <div className="col-span-4">
              <Select
                value={set.rest?.toString() || "60"}
                onValueChange={(value) => handleSetChange(index, "rest", value)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="ระยะพัก" />
                </SelectTrigger>
                <SelectContent>
                  {restOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 flex justify-end">
              <div className="flex gap-1">
                {localSets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDeleteSet(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleCopySet(index)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add set button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddSet}
        className="mt-3 w-full"
      >
        <Plus className="h-4 w-4 mr-1" />
        เพิ่มเซ็ต
      </Button>
    </div>
  );
}

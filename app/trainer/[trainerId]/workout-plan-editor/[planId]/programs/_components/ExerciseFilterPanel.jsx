"use client";

import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

// ใช้ memo เพื่อป้องกัน re-render ที่ไม่จำเป็น
const ExerciseFilterPanel = memo(
  ({ isOpen, onToggle, filters, onChange, filterOptions }) => {
    // สร้าง state สำหรับเก็บค่า filters ภายใน component
    const [localFilters, setLocalFilters] = useState({ ...filters });

    // อัพเดต localFilters เมื่อ filters ภายนอกเปลี่ยน
    useEffect(() => {
      setLocalFilters({ ...filters });
    }, [filters]);

    // ฟังก์ชันเมื่อกดรีเซ็ต filter ทั้งหมด
    const handleReset = () => {
      const resetFilters = {
        equipment: [],
        muscle: [],
        level: [],
        mechanic: [],
        category: [],
      };
      setLocalFilters(resetFilters);
      onChange(resetFilters);
    };

    // ฟังก์ชันสำหรับอัพเดต filters แบบ multi-select
    const handleFilterChange = (key, value) => {
      if (!localFilters[key]) {
        setLocalFilters({
          ...localFilters,
          [key]: [value],
        });
        onChange({
          ...localFilters,
          [key]: [value],
        });
      } else if (localFilters[key].includes(value)) {
        const updatedFilters = {
          ...localFilters,
          [key]: localFilters[key].filter((item) => item !== value),
        };
        setLocalFilters(updatedFilters);
        onChange(updatedFilters);
      } else {
        const updatedFilters = {
          ...localFilters,
          [key]: [...localFilters[key], value],
        };
        setLocalFilters(updatedFilters);
        onChange(updatedFilters);
      }
    };

    // ตรวจสอบว่ามี filter ที่เลือกอยู่หรือไม่
    const hasActiveFilters = Object.values(localFilters).some(
      (arr) => arr && arr.length > 0
    );

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border rounded-md mt-2"
          >
            {/* ปุ่มรีเซ็ต แสดงเมื่อมีตัวกรองที่เลือก */}
            {hasActiveFilters && (
              <div className="flex justify-end p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 h-auto text-xs font-medium"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* ScrollArea แยกสำหรับ Filter Panel */}
            <ScrollArea className="h-[350px]">
              <div className="p-4 space-y-6">
                {/* Body Part Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-base">Body Part</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filterOptions?.muscles?.map((muscle) => (
                      <div key={muscle} className="flex items-center space-x-2">
                        <Checkbox
                          id={`muscle-${muscle}`}
                          checked={localFilters.muscle?.includes(muscle)}
                          onCheckedChange={() =>
                            handleFilterChange("muscle", muscle)
                          }
                        />
                        <Label
                          htmlFor={`muscle-${muscle}`}
                          className="text-sm cursor-pointer"
                        >
                          {muscle || "ไม่ระบุ"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-base">Equipment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filterOptions?.equipment?.map((equipment) => (
                      <div
                        key={equipment}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`equipment-${equipment}`}
                          checked={localFilters.equipment?.includes(equipment)}
                          onCheckedChange={() =>
                            handleFilterChange("equipment", equipment)
                          }
                        />
                        <Label
                          htmlFor={`equipment-${equipment}`}
                          className="text-sm cursor-pointer"
                        >
                          {equipment || "ไม่ระบุ"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-base">Level</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filterOptions?.levels?.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level}`}
                          checked={localFilters.level?.includes(level)}
                          onCheckedChange={() =>
                            handleFilterChange("level", level)
                          }
                        />
                        <Label
                          htmlFor={`level-${level}`}
                          className="text-sm cursor-pointer"
                        >
                          {level || "ไม่ระบุ"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-base">Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filterOptions?.categories?.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={localFilters.category?.includes(category)}
                          onCheckedChange={() =>
                            handleFilterChange("category", category)
                          }
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category || "ไม่ระบุ"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

ExerciseFilterPanel.displayName = "ExerciseFilterPanel";

export default ExerciseFilterPanel;

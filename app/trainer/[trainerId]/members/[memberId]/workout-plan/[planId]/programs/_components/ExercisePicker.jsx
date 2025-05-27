"use client";

import { useState, useCallback, memo, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import ExerciseFilterPanel from "./ExerciseFilterPanel";
import ExerciseList from "./ExerciseList";
import useExerciseSearch from "@/hooks/useExerciseSearch";
import { debounce } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function ExercisePicker({
  isPanel = false,
  workoutProgramId,
  trainerId,
  onExerciseAdded,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    equipment: [],
    muscle: [],
    level: [],
    mechanic: [],
    category: [],
  });
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  // ใช้ custom hook สำหรับการค้นหาข้อมูล
  const {
    exercises,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    loaderRef,
    filterOptions,
    error,
  } = useExerciseSearch(debouncedSearchTerm, filters);

  // Debounce search input
  const handleSearchInput = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // จัดการการเปลี่ยนแปลงการค้นหา
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearchInput(value);
  };

  // จัดการการเปลี่ยนแปลง filter
  const handleFilterChange = useCallback((newFilters) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, []);

  // จัดการการเพิ่มท่าออกกำลังกาย
  const handleSelectExercise = (exercise) => {
    try {
      // สร้างออบเจ็กต์ท่าออกกำลังกายใหม่สำหรับ local draft
      const newExercise = {
        // ใช้ค่าติดลบเพื่อระบุว่าเป็นรายการใหม่ที่ยังไม่ถูกบันทึกลงฐานข้อมูล
        program_exercise_id: Date.now() * -1, // temp ID จนกว่าจะบันทึก
        exercise_id: exercise.id,
        order_index: 9999, // จะถูกเรียงใหม่หลังจากเพิ่มเข้า state
        rest: "60", // ค่าเริ่มต้น
        notes: "",
        // ข้อมูลจาก exercise object
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        level: exercise.level,
        mechanic: exercise.mechanic,
        // สร้างเซ็ตเริ่มต้น
        sets: [
          {
            set_order: 1,
            weight: null,
            reps: 10,
            time: null,
            distance: null,
          },
        ],
      };

      toast({
        title: "เพิ่มท่าออกกำลังกาย",
        description: `เพิ่มท่า ${exercise.name} เข้าโปรแกรมแล้ว`,
      });

      // ส่งข้อมูลท่าที่เพิ่มกลับไปยัง ProgramEditor
      if (onExerciseAdded) {
        onExerciseAdded(newExercise);
      }
    } catch (err) {
      console.error("Error adding exercise:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มท่าออกกำลังกายได้",
        variant: "destructive",
      });
    }
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* ส่วน Header - จะไม่ scroll */}
      <div className="flex-none p-4 pb-2">
        <div className="flex w-full border rounded-md overflow-hidden">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ค้นหาท่าออกกำลังกาย"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            variant="ghost"
            className={`flex-none m-0 px-3 h-10 border-l rounded-none hover:bg-accent ${
              filterOpen ? "bg-accent/50" : ""
            }`}
            onClick={toggleFilterPanel}
            aria-label="Filter"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {filters &&
              Object.values(filters).some((arr) => arr?.length > 0) && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.values(filters).reduce(
                    (total, arr) => total + (arr?.length || 0),
                    0
                  )}
                </span>
              )}
          </Button>
        </div>

        {/* Filter Panel */}
        <div className="relative z-10">
          <ExerciseFilterPanel
            isOpen={filterOpen}
            onToggle={toggleFilterPanel}
            filters={filters}
            onChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </div>
      </div>

      {/* Exercise List Container - จะ scroll ได้ */}
      <div className="flex-1 min-h-0 flex flex-col px-4">
        <ExerciseList
          exercises={exercises}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          loaderRef={loaderRef}
          onSelectExercise={handleSelectExercise}
          height="100%" // ใช้ความสูง 100% เพื่อให้ขยายเต็มพื้นที่
        />

        {/* แสดงจำนวนที่พบทั้งหมด */}
        {exercises.length > 0 && (
          <div className="text-sm text-muted-foreground mt-2 mb-4">
            แสดง {exercises.length} จาก {totalCount} ท่า
          </div>
        )}
      </div>
    </div>
  );
}

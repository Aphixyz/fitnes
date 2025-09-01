"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import ProgramExerciseSets from "./ProgramExerciseSets";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { getRestTimeOptions, secondsToTime } from "@/utils/utils";

// เปลี่ยนเป็น Presentational Component รับ exercise object และ callback props โดยตรง
export default function ProgramExerciseCard({
  exercise,
  onDelete,
  onUpdateExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  dragHandleProps,
}) {
  const [expanded, setExpanded] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const restOptions = getRestTimeOptions();
  const { toast } = useToast();

  // จัดการการเปลี่ยนเวลาพัก
  const handleRestChange = (value) => {
    const restValue = value === "0" ? null : Number(value);
    onUpdateExercise("rest", restValue);

    // แสดง toast แจ้งเตือน
    const restLabel = value === "0" ? "ไม่กำหนด" : secondsToTime(Number(value));
    toast({
      title: "ตั้งค่าเวลาพักสำเร็จ",
      description: `ตั้งเวลาพักสำหรับท่า ${exercise.name} เป็น ${restLabel} แล้ว`,
    });
  };

  // ตรวจสอบและแสดงค่าเวลาพักให้ถูกต้อง
  const getRestValue = () => {
    // ถ้า rest เป็น null, undefined หรือ 0 ให้ใช้ค่า "0" (ไม่กำหนด)
    if (
      exercise.rest === null ||
      exercise.rest === undefined ||
      exercise.rest === 0
    ) {
      return "0";
    }
    // ถ้ามีค่าให้แปลงเป็น string
    return exercise.rest.toString();
  };

  return (
    <>
      <div className="border rounded-md mb-4 bg-white shadow-sm">
        {/* ส่วนหัวการ์ด */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            {/* Handle สำหรับลาก */}
            <div className="cursor-grab touch-none" {...dragHandleProps}>
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* รูปและชื่อท่า */}
            <div className="flex items-center flex-grow gap-3">
              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
                <img
                  src={`/exercises/${exercise.exercise_id}/0.jpg`}
                  alt={exercise.name}
                  onError={(e) => {
                    e.target.src = "/placeholder-exercise.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3
                  className="font-medium hover:text-primary cursor-pointer hover:underline"
                  onClick={() => setIsDetailModalOpen(true)}
                >
                  {exercise.name}
                </h3>
              </div>
            </div>

            {/* ปุ่มต่างๆ */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* เนื้อหาการ์ด */}
        {expanded && (
          <>
            {/* ส่วนตั้งค่าพัก */}
            <div className="px-4 mb-4">
              <div className="text-sm font-medium mb-1">เวลาพักระหว่างท่า</div>
              <Select value={getRestValue()} onValueChange={handleRestChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกเวลาพัก" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {restOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ส่วน Sets - ใช้ ProgramExerciseSets */}
            <div className="px-4 pb-4">
              <ProgramExerciseSets
                sets={exercise.sets || []}
                onAddSet={onAddSet}
                onRemoveSet={onRemoveSet}
                onUpdateSet={onUpdateSet}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal แสดงรายละเอียดท่า */}
      <ExerciseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        exercise={exercise}
      />
    </>
  );
}

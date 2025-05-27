"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  PencilLine,
  Info,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProgramExerciseSets from "./ProgramExerciseSets";

export default function ProgramExerciseCard({
  exercise,
  onDelete,
  onUpdate,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}) {
  const [expanded, setExpanded] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(exercise.notes || "");
  const [localRest, setLocalRest] = useState(exercise.rest || "60");

  // อัพเดต local state เมื่อ props เปลี่ยน
  useEffect(() => {
    setLocalNotes(exercise.notes || "");
    setLocalRest(exercise.rest || "60");
  }, [exercise]);

  // จัดการการเปลี่ยนแปลงโน้ต
  const handleNotesChange = (e) => {
    setLocalNotes(e.target.value);
  };

  // บันทึกโน้ต
  const handleSaveNotes = () => {
    onUpdate(exercise.program_exercise_id, {
      notes: localNotes,
    });
    setIsEditingNotes(false);
  };

  // จัดการการเปลี่ยนเวลาพัก
  const handleRestChange = (value) => {
    const restValue = value;
    setLocalRest(restValue);
    onUpdate(exercise.program_exercise_id, {
      rest: restValue,
    });
  };

  // ส่งต่อการอัพเดตเซ็ตไปยัง parent
  const handleUpdateSets = (updatedSets) => {
    onUpdate(exercise.program_exercise_id, {
      sets: updatedSets,
    });
  };

  // แปลงเวลาพัก (วินาที) เป็นรูปแบบที่อ่านง่าย
  const formatRestTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  // ตัวเลือกเวลาพัก
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
    <div className="border rounded-md mb-4 bg-white shadow-sm">
      {/* ส่วนหัวการ์ด */}
      <div className="flex items-center p-4 gap-2">
        {/* Handle สำหรับลาก drag-drop */}
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
            <h3 className="font-medium">{exercise.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span className="mr-2">พัก {formatRestTime(localRest)}</span>
              {exercise.primaryMuscles?.length > 0 && (
                <span>{exercise.primaryMuscles.join(", ")}</span>
              )}
            </div>
          </div>
        </div>

        {/* ปุ่มต่างๆ */}
        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-medium">{exercise.name}</h4>
                <div className="text-sm">
                  <p>
                    <strong>กลุ่มกล้ามเนื้อหลัก:</strong>{" "}
                    {exercise.primaryMuscles?.join(", ") || "-"}
                  </p>
                  <p>
                    <strong>กลุ่มกล้ามเนื้อรอง:</strong>{" "}
                    {exercise.secondaryMuscles?.join(", ") || "-"}
                  </p>
                  <p>
                    <strong>อุปกรณ์:</strong> {exercise.equipment || "-"}
                  </p>
                  <p>
                    <strong>ระดับ:</strong> {exercise.level || "-"}
                  </p>
                  <p>
                    <strong>ประเภท:</strong> {exercise.category || "-"}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}

          {!isLast && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={() => onDelete(exercise.program_exercise_id)}
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

      {/* ส่วนเนื้อหาการ์ด (แสดงเมื่อขยาย) */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Rest Period */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label
                htmlFor={`rest-${exercise.program_exercise_id}`}
                className="text-sm font-medium"
              >
                เวลาพัก
              </Label>
            </div>
            <Select
              value={localRest.toString()}
              onValueChange={handleRestChange}
            >
              <SelectTrigger
                id={`rest-${exercise.program_exercise_id}`}
                className="w-[180px]"
              >
                <SelectValue placeholder="เลือกเวลาพัก" />
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

          {/* Note section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label
                htmlFor={`notes-${exercise.program_exercise_id}`}
                className="text-sm font-medium"
              >
                โน้ต
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
              >
                <PencilLine className="h-3.5 w-3.5 mr-1" />
                {isEditingNotes ? "ยกเลิก" : "แก้ไข"}
              </Button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  id={`notes-${exercise.program_exercise_id}`}
                  value={localNotes}
                  onChange={handleNotesChange}
                  placeholder="เพิ่มโน้ตสำหรับท่านี้..."
                  className="h-20 text-sm"
                />
                <Button size="sm" onClick={handleSaveNotes}>
                  บันทึก
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded min-h-[2.5rem]">
                {localNotes || "ยังไม่มีโน้ตสำหรับท่านี้"}
              </p>
            )}
          </div>

          {/* Sets section */}
          <div>
            <Label className="text-sm font-medium mb-2">
              เซ็ตการออกกำลังกาย
            </Label>
            <ProgramExerciseSets
              sets={exercise.sets || []}
              onUpdateSets={handleUpdateSets}
            />
          </div>
        </div>
      )}
    </div>
  );
}

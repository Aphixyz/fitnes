"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Trash2, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExerciseListInDay from "./ExerciseListInDay";
import ExercisePickerModal from "./ExercisePickerModal";

// ตัวเลือกวันในสัปดาห์
const weekdays = [
  { value: "1", label: "จันทร์" },
  { value: "2", label: "อังคาร" },
  { value: "3", label: "พุธ" },
  { value: "4", label: "พฤหัสบดี" },
  { value: "5", label: "ศุกร์" },
  { value: "6", label: "เสาร์" },
  { value: "7", label: "อาทิตย์" },
];

export default function WorkoutDayItem({ day, index, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sessionName, setSessionName] = useState(
    day.session_name || `วันที่ ${index + 1}`
  );
  const [dayOfWeek, setDayOfWeek] = useState(day.day_of_week || "1");
  const [sessionType, setSessionType] = useState(day.session_type || "workout");

  // เปิด/ปิด Exercise Picker
  const toggleExercisePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };

  // อัปเดตข้อมูลวันฝึก
  const handleUpdate = () => {
    onUpdate(day.id, {
      session_name: sessionName,
      day_of_week: dayOfWeek,
      session_type: sessionType,
    });
    setEditing(false);
  };

  // เพิ่มท่าออกกำลังกายใหม่
  const handleAddExercises = (exercises) => {
    // สร้าง ID ชั่วคราวสำหรับท่าใหม่
    const newExercises = exercises.map((ex) => ({
      ...ex,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exercise_id: ex.id.toString(), // แปลงเป็น string ตามที่ schema ต้องการ
    }));

    // อัปเดตวันฝึกด้วยท่าใหม่
    onUpdate(day.id, {
      exercises: [...(day.exercises || []), ...newExercises],
    });
  };

  // อัปเดตข้อมูลท่าออกกำลังกาย
  const handleExerciseUpdate = (exerciseId, updatedData) => {
    const updatedExercises = (day.exercises || []).map((ex) => {
      if (ex.id === exerciseId) {
        return { ...ex, ...updatedData };
      }
      return ex;
    });

    onUpdate(day.id, { exercises: updatedExercises });
  };

  // ลบท่าออกกำลังกาย
  const handleExerciseDelete = (exerciseId) => {
    const updatedExercises = (day.exercises || []).filter(
      (ex) => ex.id !== exerciseId
    );
    onUpdate(day.id, { exercises: updatedExercises });
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor={`session_name_${day.id}`}>ชื่อเซสชัน</Label>
                <Input
                  id={`session_name_${day.id}`}
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="ชื่อวันฝึก"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`day_of_week_${day.id}`}>วันในสัปดาห์</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกวัน" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`session_type_${day.id}`}>ประเภทเซสชัน</Label>
                <Select
                  value={sessionType}
                  onValueChange={(value) => {
                    setSessionType(value);
                    onUpdate(day.id, { session_type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทเซสชัน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workout">
                      วันออกกำลังกาย (Workout)
                    </SelectItem>
                    <SelectItem value="rest">วันพัก (Rest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <CardTitle className="text-lg font-semibold">
              {sessionName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                •{" "}
                {weekdays.find((d) => d.value === dayOfWeek)?.label ||
                  "ไม่ระบุวัน"}
              </span>
            </CardTitle>
          )}

          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  ยกเลิก
                </Button>
                <Button size="sm" onClick={handleUpdate}>
                  บันทึก
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={toggleExercisePicker}
                >
                  <Plus className="h-4 w-4 mr-1" /> เพิ่มท่า
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" /> แก้ไขข้อมูลวันฝึก
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => onDelete(day.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> ลบวันฝึกนี้
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {sessionType === "workout" && (
            <>
              <ExerciseListInDay
                exercises={day.exercises || []}
                onExerciseUpdate={handleExerciseUpdate}
                onExerciseDelete={handleExerciseDelete}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Exercise Picker Modal */}
      {isPickerOpen && (
        <ExercisePickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelectExercises={handleAddExercises}
        />
      )}
    </>
  );
}

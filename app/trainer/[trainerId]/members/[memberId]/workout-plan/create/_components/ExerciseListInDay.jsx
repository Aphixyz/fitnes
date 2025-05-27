"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ExerciseListInDay({
  exercises = [],
  onExerciseUpdate,
  onExerciseDelete,
}) {
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    exercise_type: "strength",
    sets: "",
    reps: "",
    weight_kg: "",
    rest: "",
    duration: "",
    distance: "",
    notes: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (exerciseForm.exercise_type === "strength") {
      // Clear non-strength fields
      setExerciseForm((prev) => ({
        ...prev,
        duration: "",
        distance: "",
        // Keep rest as it's used in strength too
      }));
    } else if (exerciseForm.exercise_type === "cardio") {
      // Clear non-cardio fields
      setExerciseForm((prev) => ({
        ...prev,
        sets: "",
        reps: "",
        weight_kg: "",
      }));
    } else if (exerciseForm.exercise_type === "hiit") {
      // Clear non-hiit fields
      setExerciseForm((prev) => ({
        ...prev,
        sets: "",
        reps: "",
        weight_kg: "",
        distance: "",
      }));
    } else if (exerciseForm.exercise_type === "mobility") {
      // Clear non-mobility fields
      setExerciseForm((prev) => ({
        ...prev,
        sets: "",
        reps: "",
        weight_kg: "",
        rest: "",
        distance: "",
      }));
    }
  }, [exerciseForm.exercise_type]);

  // เปิด Dialog แก้ไขท่าออกกำลังกาย
  const openEditDialog = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      exercise_type: exercise.exercise_type || "strength",
      sets: exercise.sets || "",
      reps: exercise.reps || "",
      weight_kg: exercise.weight_kg || "",
      rest: exercise.rest || 60,
      duration: exercise.duration || "",
      distance: exercise.distance || "",
      notes: exercise.notes || "",
    });
  };

  // ปิด Dialog แก้ไขท่าออกกำลังกาย
  const closeEditDialog = () => {
    setEditingExercise(null);
  };

  // บันทึกข้อมูลที่แก้ไข
  const saveExerciseChanges = () => {
    // Reset validation errors
    setValidationErrors({});

    // Validate based on exercise type
    const { exercise_type } = exerciseForm;
    const errors = {};

    if (exercise_type === "strength") {
      if (!exerciseForm.sets) {
        errors.sets = "โปรดระบุจำนวนเซต";
      }
      if (!exerciseForm.reps) {
        errors.reps = "โปรดระบุจำนวนครั้ง";
      }
    }

    if (exercise_type === "cardio") {
      if (!exerciseForm.duration) {
        errors.duration = "โปรดระบุระยะเวลา";
      }
      if (!exerciseForm.distance) {
        errors.distance = "โปรดระบุระยะทาง";
      }
    }

    if (exercise_type === "hiit") {
      if (!exerciseForm.duration) {
        errors.duration = "โปรดระบุระยะเวลาทำงาน";
      }
      if (!exerciseForm.rest) {
        errors.rest = "โปรดระบุระยะเวลาพัก";
      }
    }

    if (exercise_type === "mobility") {
      if (!exerciseForm.duration) {
        errors.duration = "โปรดระบุระยะเวลา";
      }
    }

    // If there are validation errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Create update object with only relevant fields
    const updateData = {
      exercise_type,
      notes: exerciseForm.notes,
    };

    // Add fields based on exercise type
    if (exercise_type === "strength") {
      updateData.sets = Number(exerciseForm.sets);
      updateData.reps = exerciseForm.reps;
      updateData.weight_kg = exerciseForm.weight_kg;
      updateData.rest = Number(exerciseForm.rest || 60);
    } else if (exercise_type === "cardio") {
      updateData.duration = Number(exerciseForm.duration);
      updateData.distance = Number(exerciseForm.distance || 0);
    } else if (exercise_type === "hiit") {
      updateData.duration = Number(exerciseForm.duration);
      updateData.rest = Number(exerciseForm.rest || 30);
    } else if (exercise_type === "mobility") {
      updateData.duration = Number(exerciseForm.duration);
    }

    onExerciseUpdate(editingExercise.id, updateData);
    closeEditDialog();
  };

  // จัดการการเปลี่ยนแปลงฟอร์ม
  const handleFormChange = (field, value) => {
    if (field === "exercise_type") {
      // Reset validation errors when changing exercise type
      setValidationErrors({});
    }

    setExerciseForm({
      ...exerciseForm,
      [field]: value,
    });
  };

  // แสดงข้อความเมื่อยังไม่มีท่าออกกำลังกาย
  if (!exercises.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>ยังไม่มีท่าออกกำลังกายในวันนี้</p>
        <p className="text-sm">กดปุ่ม "เพิ่มท่า" เพื่อเพิ่มท่าออกกำลังกาย</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>ท่าออกกำลังกาย</TableHead>

            {/* Dynamic headers based on exercise types */}
            {exercises.some((e) => e.exercise_type === "strength") && (
              <>
                <TableHead className="w-[80px] text-center">เซต</TableHead>
                <TableHead className="w-[100px] text-center">
                  ครั้ง/เซต
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  พัก (วินาที)
                </TableHead>
              </>
            )}

            {exercises.some((e) => e.exercise_type !== "strength") && (
              <TableHead className="text-center" colSpan={3}>
                รายละเอียด
              </TableHead>
            )}

            <TableHead className="w-[120px] text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise, index) => (
            <TableRow key={exercise.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {exercise.name || exercise.exercise_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getExerciseTypeLabel(exercise.exercise_type)}
                  </div>
                  {exercise.notes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {exercise.notes}
                    </div>
                  )}
                </div>
              </TableCell>
              {exercise.exercise_type === "strength" && (
                <>
                  <TableCell className="text-center">{exercise.sets}</TableCell>
                  <TableCell className="text-center">{exercise.reps}</TableCell>
                  <TableCell className="text-center">
                    {exercise.rest || 60}
                  </TableCell>
                </>
              )}
              {exercise.exercise_type === "cardio" && (
                <TableCell colSpan={3} className="text-center">
                  {formatDuration(exercise.duration)}
                  {exercise.distance ? ` - ${exercise.distance} ม.` : ""}
                </TableCell>
              )}
              {exercise.exercise_type === "hiit" && (
                <TableCell colSpan={3} className="text-center">
                  {formatDuration(exercise.duration)} / พัก{" "}
                  {formatDuration(exercise.rest)}
                </TableCell>
              )}
              {exercise.exercise_type === "mobility" && (
                <TableCell colSpan={3} className="text-center">
                  {formatDuration(exercise.duration)}
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(exercise)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onExerciseDelete(exercise.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog แก้ไขท่าออกกำลังกาย */}
      <Dialog open={!!editingExercise} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              แก้ไขท่า {editingExercise?.name || editingExercise?.exercise_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise_type">ประเภทการออกกำลังกาย</Label>
              <Select
                id="exercise_type"
                value={exerciseForm.exercise_type}
                onValueChange={(value) =>
                  handleFormChange("exercise_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทการออกกำลังกาย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">
                    <div className="flex items-center">
                      <span className="mr-2">💪</span> เสริมสร้างความแข็งแรง
                    </div>
                  </SelectItem>
                  <SelectItem value="cardio">
                    <div className="flex items-center">
                      <span className="mr-2">🏃‍♂️</span> คาร์ดิโอ
                    </div>
                  </SelectItem>
                  <SelectItem value="hiit">
                    <div className="flex items-center">
                      <span className="mr-2">⚡</span> HIIT
                    </div>
                  </SelectItem>
                  <SelectItem value="mobility">
                    <div className="flex items-center">
                      <span className="mr-2">🧘</span> โมบิลิตี้
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exerciseForm.exercise_type === "strength" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets">จำนวนเซต</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={exerciseForm.sets}
                    min="1"
                    onChange={(e) => handleFormChange("sets", e.target.value)}
                    className={validationErrors.sets ? "border-red-500" : ""}
                  />
                  {validationErrors.sets && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.sets}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reps">จำนวนครั้ง/เซต</Label>
                  <Input
                    id="reps"
                    value={exerciseForm.reps}
                    placeholder="e.g. 12, 8-12, ถึงหมดแรง"
                    onChange={(e) => handleFormChange("reps", e.target.value)}
                    className={validationErrors.reps ? "border-red-500" : ""}
                  />
                  {validationErrors.reps && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.reps}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_kg">น้ำหนัก (กก.)</Label>
                  <Input
                    id="weight_kg"
                    value={exerciseForm.weight_kg}
                    placeholder="e.g. 10, 12-10-8"
                    onChange={(e) =>
                      handleFormChange("weight_kg", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rest">เวลาพัก (วินาที)</Label>
                  <Input
                    id="rest"
                    type="number"
                    value={exerciseForm.rest}
                    min="0"
                    step="5"
                    onChange={(e) => handleFormChange("rest", e.target.value)}
                  />
                </div>
              </div>
            )}

            {exerciseForm.exercise_type === "cardio" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">ระยะเวลา (วินาที)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={exerciseForm.duration}
                    min="0"
                    onChange={(e) =>
                      handleFormChange("duration", e.target.value)
                    }
                  />
                  {validationErrors.duration && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.duration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">ระยะทาง (เมตร)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={exerciseForm.distance}
                    min="0"
                    onChange={(e) =>
                      handleFormChange("distance", e.target.value)
                    }
                  />
                  {validationErrors.distance && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.distance}
                    </p>
                  )}
                </div>
              </div>
            )}

            {exerciseForm.exercise_type === "hiit" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">ระยะเวลาทำงาน (วินาที)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={exerciseForm.duration}
                    min="0"
                    onChange={(e) =>
                      handleFormChange("duration", e.target.value)
                    }
                  />
                  {validationErrors.duration && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.duration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rest">ระยะเวลาพัก (วินาที)</Label>
                  <Input
                    id="rest"
                    type="number"
                    value={exerciseForm.rest}
                    min="0"
                    onChange={(e) => handleFormChange("rest", e.target.value)}
                  />
                  {validationErrors.rest && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.rest}
                    </p>
                  )}
                </div>
              </div>
            )}

            {exerciseForm.exercise_type === "mobility" && (
              <div className="space-y-2">
                <Label htmlFor="duration">ระยะเวลา (วินาที)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={exerciseForm.duration}
                  min="0"
                  onChange={(e) => handleFormChange("duration", e.target.value)}
                />
                {validationErrors.duration && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.duration}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
              <Textarea
                id="notes"
                value={exerciseForm.notes}
                placeholder="เพิ่มคำแนะนำหรือรายละเอียดเพิ่มเติม"
                onChange={(e) => handleFormChange("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              ยกเลิก
            </Button>
            <Button onClick={saveExerciseChanges}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to format duration
function formatDuration(seconds) {
  if (!seconds) return "";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

// Helper function to get exercise type label
function getExerciseTypeLabel(type) {
  switch (type) {
    case "strength":
      return "เสริมสร้างความแข็งแรง";
    case "cardio":
      return "คาร์ดิโอ";
    case "hiit":
      return "HIIT";
    case "mobility":
      return "โมบิลิตี้";
    default:
      return "";
  }
}

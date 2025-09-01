"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { updateProgramDetail } from "@/actions/trainer/workout/workout_program/updateProgramDetail";

// Custom hook สำหรับ debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function DetailForm({
  workoutProgramId,
  workoutPlanId,
  trainerId,
  memberId,
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const initialRender = useRef(true);

  // ใช้ useWatch เพื่อดูการเปลี่ยนแปลงเฉพาะส่วนของ programDetail
  const programName = useWatch({
    control,
    name: "programDetail.programName",
  });

  const programNote = useWatch({
    control,
    name: "programDetail.programNote",
  });

  // Debounce values สำหรับ auto-save (500ms)
  const debouncedName = useDebounce(programName, 500);
  const debouncedNote = useDebounce(programNote, 500);

  // Auto-save เมื่อมีการเปลี่ยนแปลงค่าใน debounced fields
  useEffect(() => {
    // ป้องกันการเรียก auto-save ตอน component เพิ่ง mount
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (!workoutProgramId || !debouncedName) return;

    autoSaveDetails(debouncedName, debouncedNote);
  }, [debouncedName, debouncedNote, workoutProgramId]);

  // ฟังก์ชัน auto-save
  const autoSaveDetails = async (name, note) => {
    if (!workoutProgramId || isSaving) return;

    // validation
    if (!name.trim()) {
      toast({
        title: "กรุณาระบุชื่อโปรแกรม",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // เตรียมข้อมูลสำหรับส่ง
      const payload = {
        program_id: Number(workoutProgramId),
        workout_plan_id: Number(workoutPlanId),
        trainerId,
        memberId,
        program_name: name,
        program_note: note || null,
      };

      // เรียก server action สำหรับ update เฉพาะรายละเอียดโปรแกรม
      const response = await updateProgramDetail(payload);

      if (response.success) {
        // แสดง toast เบาๆ (หรือไม่แสดงเลยถ้าไม่ต้องการรบกวน UX)
        console.log("Auto-saved program details");
      } else {
        if (
          response.error === "validation_error" &&
          response.validationErrors
        ) {
          response.validationErrors.forEach((err) => {
            toast({
              title: "ข้อมูลไม่ถูกต้อง",
              description: err.message,
              variant: "destructive",
            });
          });
        } else {
          throw new Error(
            response.message || "เกิดข้อผิดพลาดขณะบันทึกอัตโนมัติ"
          );
        }
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      toast({
        title: "บันทึกอัตโนมัติล้มเหลว",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          รายละเอียดโปรแกรม
          {isSaving && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="programName" className="text-sm font-medium">
              ชื่อโปรแกรม{" "}
              {isSaving && (
                <span className="text-xs text-muted-foreground">
                  (กำลังบันทึกอัตโนมัติ...)
                </span>
              )}
            </Label>
            <Input
              id="programName"
              placeholder="ชื่อโปรแกรมออกกำลังกาย"
              className="mt-1"
              {...control.register("programDetail.programName", {
                required: "กรุณาระบุชื่อโปรแกรม",
              })}
            />
            {errors.programDetail?.programName && (
              <p className="text-destructive text-sm mt-1">
                {errors.programDetail.programName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="programNote" className="text-sm font-medium">
              หมายเหตุ
            </Label>
            <Textarea
              id="programNote"
              placeholder="รายละเอียดเพิ่มเติมของโปรแกรม (ถ้ามี)"
              className="mt-1 resize-none"
              rows={3}
              {...control.register("programDetail.programNote")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

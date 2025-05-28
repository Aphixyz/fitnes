"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// Components
import DetailForm from "./DetailForm";
import ProgramExercisesForm from "./ProgramExercisesForm";
import ProgramEditor from "./ProgramEditor";
import { updateWorkoutProgram } from "@/actions/trainer/workout/workout_program/updateWorkoutProgram";

// Schema สำหรับ validation
const exerciseSetSchema = z.object({
  program_exercise_set_id: z.string().or(z.number().nullable()).optional(),
  set_order: z.number(),
  weight: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  time: z.number().nullable().optional(),
  distance: z.number().nullable().optional(),
});

const exerciseSchema = z.object({
  program_exercise_id: z.string().or(z.number().nullable()),
  exercise_id: z.string().or(z.number()),
  name: z.string(),
  primaryMuscles: z.array(z.string()).optional(),
  secondaryMuscles: z.array(z.string()).optional(),
  equipment: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  order_index: z.number(),
  rest: z.number().nullable().optional(),
  sets: z.array(exerciseSetSchema),
});

const formSchema = z.object({
  programDetail: z.object({
    programName: z.string().min(1, "กรุณาระบุชื่อโปรแกรม"),
    programNote: z.string().nullable().optional(),
  }),
  exercises: z.array(exerciseSchema),
});

export default function WorkoutProgramEditor({
  workoutProgram,
  workoutProgramId,
  workoutPlanId,
  trainerId,
  memberId,
  onStateChange,
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // แปลงข้อมูลเริ่มต้นจาก props เพื่อใช้เป็น defaultValues ใน form
  const formattedExercises =
    workoutProgram?.exercises?.map((ex) => ({
      program_exercise_id: ex.program_exercise_id,
      exercise_id: ex.exercise_id,
      name: ex.name,
      primaryMuscles: ex.primary_muscles ? ex.primary_muscles.split(",") : [],
      secondaryMuscles: ex.secondary_muscles
        ? ex.secondary_muscles.split(",")
        : [],
      equipment: ex.equipment,
      level: ex.level,
      category: ex.category,
      order_index: ex.order_index,
      rest: ex.rest !== null && ex.rest !== undefined ? Number(ex.rest) : 0,
      sets: ex.sets.map((set) => ({
        program_exercise_set_id: set.program_exercise_set_id,
        set_order: set.set_order || set.set,
        weight: set.weight !== null ? Number(set.weight) : null,
        reps: set.reps !== null ? Number(set.reps) : null,
        time: set.time !== null ? Number(set.time) : null,
        distance: set.distance !== null ? Number(set.distance) : null,
      })),
      instructions: ex.instructions,
    })) || [];

  // สร้าง methods สำหรับฟอร์มด้วย React-Hook-Form
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programDetail: {
        programName: workoutProgram?.program_name || "",
        programNote: workoutProgram?.program_note || "",
      },
      exercises: formattedExercises,
    },
    mode: "onChange",
  });

  // จับ states จาก form
  const isDirty = methods.formState.isDirty;

  // ส่ง state และ submit function ให้ parent
  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange(isDirty, isSubmitting, handleSubmit);
    }
  }, [isDirty, isSubmitting, onStateChange]);

  // ฟังก์ชัน submit หลัก (manual save ทั้งฟอร์ม)
  const handleSubmit = useCallback(async () => {
    try {
      return await methods.handleSubmit(async (data) => {
        setIsSubmitting(true);

        try {
          // เตรียม payload สำหรับส่งไปยัง server action
          const payload = {
            program_id: Number(workoutProgramId),
            workout_plan_id: Number(workoutPlanId),
            trainerId,
            memberId,
            program_name: data.programDetail.programName,
            program_note: data.programDetail.programNote || null,
            exercises: data.exercises.map((ex) => {
              const isTemp =
                typeof ex.program_exercise_id === "string" &&
                ex.program_exercise_id.includes("temp_");

              return {
                program_exercise_id: isTemp
                  ? null
                  : Number(ex.program_exercise_id),
                exercise_id: ex.exercise_id,
                order_index: ex.order_index,
                rest: ex.rest === 0 ? null : ex.rest,
                sets: ex.sets.map((set) => {
                  const isSetTemp =
                    typeof set.program_exercise_set_id === "string" &&
                    set.program_exercise_set_id.includes("temp_");

                  return {
                    set: set.set_order,
                    weight: set.weight ?? null,
                    reps: set.reps ?? null,
                    time: set.time ? set.time.toString() : null,
                    distance: set.distance ?? null,
                  };
                }),
              };
            }),
          };

          // ส่งข้อมูลไป server
          const response = await updateWorkoutProgram(payload);

          if (response.success) {
            // รีเซ็ต form state หลังบันทึกสำเร็จ (เพื่อให้ isDirty กลับเป็น false)
            methods.reset(methods.getValues());

            toast({
              title: "บันทึกสำเร็จ",
              description: "บันทึกข้อมูลโปรแกรมเรียบร้อยแล้ว",
            });

            // รีโหลดหน้าเพื่อแสดงข้อมูลใหม่
            router.refresh();
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
              return;
            }
            throw new Error(
              response.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล"
            );
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาด:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description:
              error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      })();
    } catch (e) {
      console.error("Form validation failed:", e);
      setIsSubmitting(false);
    }
  }, [
    workoutProgramId,
    workoutPlanId,
    trainerId,
    memberId,
    methods,
    toast,
    router,
  ]);

  // เพิ่มท่าใหม่เข้า exercises array
  const handleExerciseAdded = useCallback(
    (exercise) => {
      const exercises = methods.getValues("exercises");
      const existingExercise = exercises.find(
        (ex) => ex.exercise_id === exercise.exercise_id
      );

      if (existingExercise) {
        toast({
          title: "ท่าออกกำลังกายซ้ำ",
          description: `ท่า ${exercise.name} มีอยู่ในโปรแกรมแล้ว`,
          variant: "destructive",
        });
        return;
      }

      // เพิ่มท่าใหม่
      methods.setValue(
        "exercises",
        [
          ...exercises,
          {
            program_exercise_id: `temp_${Date.now()}_${exercises.length}`,
            ...exercise,
            order_index: exercises.length,
            rest: 60,
            sets: [
              {
                program_exercise_set_id: `temp_set_${Date.now()}`,
                set_order: 1,
                weight: 10,
                reps: 10,
                time: null,
                distance: null,
              },
            ],
          },
        ],
        { shouldDirty: true }
      );

      toast({
        title: "เพิ่มท่าออกกำลังกาย",
        description: `เพิ่มท่า ${exercise.name} เข้าโปรแกรมแล้ว`,
      });
    },
    [methods, toast]
  );

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ฟอร์มข้อมูลโปรแกรม (Auto-save) */}
        <div className="lg:col-span-12">
          <DetailForm
            workoutProgramId={workoutProgramId}
            workoutPlanId={workoutPlanId}
            trainerId={trainerId}
            memberId={memberId}
          />
        </div>

        {/* รายการท่าออกกำลังกาย (Manual-save) */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>รายการท่าออกกำลังกาย</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramExercisesForm />
            </CardContent>
          </Card>
        </div>

        {/* ตัวเลือกท่าออกกำลังกาย */}
        <div className="lg:col-span-4">
          <ProgramEditor
            workoutProgramId={workoutProgramId}
            trainerId={trainerId}
            onExerciseAdded={handleExerciseAdded}
          />
        </div>
      </div>
    </FormProvider>
  );
}

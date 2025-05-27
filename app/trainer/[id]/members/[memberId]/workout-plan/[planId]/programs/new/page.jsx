"use client";

import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { addWorkoutProgram } from "@/actions/trainer/workout_program/addWorkoutProgram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProgramPage({ params }) {
  const { id: trainerId, memberId, planId } = params;
  const { pending } = useFormStatus();
  const router = useRouter();

  const onSuccess = (res) => {
    if (res.success) {
      // กลับไปที่หน้า planId และเลื่อนไปที่ tab โปรแกรมย่อย
      router.push(
        `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}#programs`
      );
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold">สร้างโปรแกรมย่อยใหม่</h1>
      <form action={async (formData) => {
        const result = await addWorkoutProgram(formData);
        onSuccess(result);
      }}>
        <input type="hidden" name="workout_plan_id" value={planId} />

        <div className="mt-4 space-y-4">
          <div>
            <Label>ชื่อโปรแกรม</Label>
            <Input name="program_name" required />
          </div>
          <div>
            <Label>รายละเอียด (ไม่บังคับ)</Label>
            <textarea name="program_note" className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button type="submit" className="ml-2" disabled={pending}>
            {pending ? "กำลังบันทึก..." : "บันทึก & กลับ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
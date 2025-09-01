"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateWorkoutPlan } from "@/actions/trainer/workout/workout_plan/updateWorkoutPlan";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Edit, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const durationOptions = [
  { value: 0, label: "ไม่กำหนด" },
  { value: 1, label: "1 สัปดาห์" },
  { value: 2, label: "2 สัปดาห์" },
  { value: 3, label: "3 สัปดาห์" },
  { value: 4, label: "4 สัปดาห์" },
  { value: 6, label: "6 สัปดาห์" },
  { value: 8, label: "8 สัปดาห์" },
  { value: 12, label: "12 สัปดาห์" },
];

// Schema for form validation
const formSchema = z.object({
  plan_name: z.string().min(1, "กรุณาระบุชื่อแผนการออกกำลังกาย"),
  plan_note: z.string().optional(),
  plan_duration: z.coerce.number().nonnegative(),
  plan_startdate: z.string().min(1, "กรุณาระบุวันเริ่มต้น"),
  plan_enddate: z.string().optional().nullable(),
});

export default function EditInfoBtn({ plan, trainerId, memberId, planId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Set up form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan_name: plan.plan_name,
      plan_note: plan.plan_note || "",
      plan_duration: plan.plan_duration || 0,
      plan_startdate: plan.plan_startdate,
      plan_enddate: plan.plan_enddate || "",
    },
  });

  // Handle duration change
  const handleDurationChange = (value) => {
    const duration = parseInt(value);
    form.setValue("plan_duration", duration);

    if (duration > 0 && form.getValues("plan_startdate")) {
      // Calculate end date based on duration
      const startDate = new Date(form.getValues("plan_startdate"));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration * 7);
      
      form.setValue("plan_enddate", endDate.toISOString().split("T")[0]);
    } else if (duration === 0) {
      form.setValue("plan_enddate", "");
    }
  };

  // Handle submit
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await updateWorkoutPlan({
        workout_plan_id: Number(planId),
        trainer_id: Number(trainerId),
        ...data,
        // Handle nullable fields
        plan_note: data.plan_note || null,
        plan_enddate: data.plan_enddate || null,
      });

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตแผนการออกกำลังกายเรียบร้อยแล้ว",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center" 
        onClick={() => setIsOpen(true)}
      >
        <Edit className="mr-2 h-4 w-4" />
        แก้ไขแผนออกกำลังกาย
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>แก้ไขแผนการออกกำลังกาย</DialogTitle>
            <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center"></DialogClose>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* ชื่อแผน */}
              <FormField
                control={form.control}
                name="plan_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อแผนการออกกำลังกาย</FormLabel>
                    <FormControl>
                      <Input placeholder="ระบุชื่อแผน" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ระยะเวลา */}
              <FormField
                control={form.control}
                name="plan_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ระยะเวลา</FormLabel>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={handleDurationChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกระยะเวลา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* วันเริ่มต้น */}
              <FormField
                control={form.control}
                name="plan_startdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันเริ่มต้น</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Recalculate end date if duration is set
                          if (form.getValues("plan_duration") > 0) {
                            const duration = form.getValues("plan_duration");
                            const startDate = new Date(e.target.value);
                            const endDate = new Date(startDate);
                            endDate.setDate(endDate.getDate() + duration * 7);
                            form.setValue("plan_enddate", endDate.toISOString().split("T")[0]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* วันสิ้นสุด */}
              <FormField
                control={form.control}
                name="plan_enddate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันสิ้นสุด</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        disabled={form.getValues("plan_duration") > 0}
                        value={field.value || ""}
                      />
                    </FormControl>
                    {form.getValues("plan_duration") > 0 && (
                      <p className="text-xs text-muted-foreground">
                        วันสิ้นสุดถูกคำนวณอัตโนมัติตามระยะเวลาที่เลือก
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* บันทึกเพิ่มเติม */}
              <FormField
                control={form.control}
                name="plan_note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>บันทึกเพิ่มเติม</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="บันทึกเพิ่มเติมเกี่ยวกับแผนการออกกำลังกายนี้" 
                        className="resize-none" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
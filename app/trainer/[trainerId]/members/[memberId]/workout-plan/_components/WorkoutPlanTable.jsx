"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, MoreHorizontal, Edit, Apple, Trash2 } from "lucide-react";
import { changePlanStatus } from "@/actions/trainer/workout/workout_plan/changePlanStatus";
import { deleteWorkoutPlan } from "@/actions/trainer/workout/workout_plan/deleteWorkoutPlan";
import { useToast } from "@/components/ui/use-toast";

export default function WorkoutPlanTable({
  plans,
  trainerId,
  memberId,
  onStatusChange,
}) {
  const { toast } = useToast();

  // สีของ Badge ตามสถานะ (2 สถานะ)
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // แสดงข้อความสถานะเป็นภาษาไทย (2 สถานะ)
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "มอบหมาย";
      default:
        return "เสร็จสิ้น";
    }
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return "ไม่ระบุ";
    return `${duration} สัปดาห์`;
  };

  // Format date
  const formatPlanDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  // Workout Plan Actions Menu Component
  const WorkoutPlanActionsMenu = ({ plan, onStatusChange, onDelete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleStatusToggle = async () => {
      setIsProcessing(true);
      try {
        const newStatus = plan.plan_status === "active" ? "completed" : "active";
        const result = await changePlanStatus({
          plan_id: plan.workout_plan_id,
          status: newStatus,
        });

        if (result.updated) {
          // Call the parent component's status change handler
          await onStatusChange(plan.workout_plan_id, newStatus);
          toast({
            title: "อัพเดตสถานะสำเร็จ",
            description: "เปลี่ยนสถานะแผนการออกกำลังกายเรียบร้อย",
          });
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถเปลี่ยนสถานะได้",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเปลี่ยนสถานะได้",
          variant: "destructive",
        });
        console.error("Error updating status:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    const handleEdit = () => {
      window.location.href = `/trainer/${trainerId}/workout-plan-editor/${plan.workout_plan_id}?memberId=${memberId}`;
    };

    const handleDelete = async () => {
      setIsProcessing(true);
      try {
        const result = await deleteWorkoutPlan({
          plan_id: plan.workout_plan_id,
        });

        if (result.deleted) {
          // Call the parent component's delete handler
          await onDelete(plan.workout_plan_id);
          setIsDeleteDialogOpen(false);
          toast({
            title: "ลบแผนสำเร็จ",
            description: "ลบแผนออกกำลังกายเรียบร้อยแล้ว",
          });
        } else {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบแผนได้",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดในการลบแผน",
          variant: "destructive",
        });
        console.error("Error deleting plan:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={isProcessing}
            >
              {plan.plan_status === "active" ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  ทำเครื่องหมายเสร็จสิ้น
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  ทำเครื่องหมายมอบหมาย
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600"
              disabled={plan.plan_status === "active"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบแผนออกกำลังกาย</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบแผนออกกำลังกายนี้ใช่หรือไม่?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "กำลังลบ..." : "ลบ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  // Workout Plan List Item Component
  const WorkoutPlanListItem = ({ plan, onStatusChange, onDelete }) => {
    return (
      <div 
        className="flex items-center justify-between py-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          window.location.href = `/trainer/${trainerId}/workout-plan-editor/${plan.workout_plan_id}?memberId=${memberId}`;
        }}
      >
        {/* Plan Name */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {plan.plan_name || `แผนออกกำลังกาย #${plan.workout_plan_id}`}
          </div>
        </div>
        
        {/* Start Date */}
        <div className="flex-1 min-w-0 text-sm text-gray-600">
          {formatPlanDate(plan.start_date || plan.plan_startdate)}
        </div>
        
        {/* Duration */}
        <div className="flex-1 min-w-0 text-sm text-gray-600">
          {formatDuration(plan.duration_weeks || plan.plan_duration)}
        </div>
        
        {/* Program Count */}
        <div className="flex-1 min-w-0 text-sm text-gray-600">
          {plan.program_count || 0} โปรแกรม
        </div>
        
        {/* Status */}
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className={getStatusColor(plan.plan_status)}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {getStatusText(plan.plan_status)}
          </Badge>
        </div>
        
        {/* Actions */}
        <div className="ml-4" onClick={(e) => e.stopPropagation()}>
          <WorkoutPlanActionsMenu 
            plan={plan} 
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  };

  // Workout Plans List Component
  const WorkoutPlansList = ({ plans, onStatusChange, onDelete }) => {
    if (plans.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Apple className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p>ไม่มีแผนออกกำลังกาย</p>
        </div>
      );
    }

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-1 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex-1">ชื่อแผนออกกำลังกาย</div>
          <div className="flex-1">วันที่เริ่ม</div>
          <div className="flex-1">ระยะเวลา</div>
          <div className="flex-1">โปรแกรม</div>
          <div className="flex-1">สถานะ</div>
          <div className="w-10"></div>
        </div>
        
        {/* List Items */}
        <div>
          {plans.map((plan) => (
            <WorkoutPlanListItem
              key={plan.workout_plan_id}
              plan={plan}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-6">
        <WorkoutPlansList
          plans={plans}
          onStatusChange={onStatusChange}
          onDelete={async (planId) => {
            // Handle deletion in parent component if needed
            // This could trigger a refresh of the plans list
            if (onStatusChange) {
              // Refresh the list by calling the parent's refresh function
              window.location.reload();
            }
          }}
        />
      </div>
    </div>
  );
}
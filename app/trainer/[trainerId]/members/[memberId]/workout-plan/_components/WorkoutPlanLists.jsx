"use client";

import { useState } from "react";
import WorkoutPlanTable from "./WorkoutPlanTable";
import EmptyState from "./EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { changePlanStatus } from "@/actions/trainer/workout/workout_plan/changePlanStatus";
import { useToast } from "@/components/ui/use-toast";

export default function WorkoutPlanLists({
  trainerId,
  memberId,
  plans = [],
  activePlan,
  hasError = false,
  errorMessage = null,
}) {
  const [plansList, setPlansList] = useState(plans);
  const [active, setActive] = useState(activePlan);
  const { toast } = useToast();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด");

  // จัดการเปลี่ยนสถานะแผนการออกกำลังกาย
  const handleStatusChange = async (planId, newStatus) => {
    try {
      const result = await changePlanStatus({
        plan_id: planId,
        status: newStatus,
      });

      if (result.updated) {
        // อัพเดตข้อมูลใน state
        const updatedPlans = plansList.map((plan) =>
          plan.workout_plan_id === planId
            ? { ...plan, plan_status: newStatus }
            : plan
        );

        // ถ้าเปลี่ยนเป็น active ให้ inactive แผนอื่นที่ active อยู่
        if (newStatus === "active") {
          const updatedPlansWithOneActive = updatedPlans.map((plan) =>
            plan.workout_plan_id !== planId && plan.plan_status === "active"
              ? { ...plan, plan_status: "inactive" }
              : plan
          );
          setPlansList(updatedPlansWithOneActive);

          // อัพเดต active plan
          setActive(
            updatedPlansWithOneActive.find(
              (plan) => plan.workout_plan_id === planId
            )
          );
        } else {
          setPlansList(updatedPlans);

          // ถ้าแผนที่เปลี่ยนสถานะเป็นแผนที่ active อยู่และไม่ได้เปลี่ยนเป็น active
          if (active && active.workout_plan_id === planId) {
            setActive(null);
          }
        }

        toast({
          title: "อัพเดตสถานะสำเร็จ",
          description: "เปลี่ยนสถานะแผนการออกกำลังกายเรียบร้อย",
        });
      }
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive",
      });
      console.error("Error updating status:", err);
    }
  };

  // Handle create plan
  const handleCreatePlan = () => {
    window.location.href = `/trainer/${trainerId}/workout-plan-editor/create?memberId=${memberId}`;
  };

  // Filter plans based on search and status
  const filteredPlans = plansList.filter((plan) => {
    const matchesSearch = searchQuery === "" || 
      (plan.plan_name && plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      plan.workout_plan_id.toString().includes(searchQuery);
    
    let matchesStatus = true;
    if (selectedStatus !== "ทั้งหมด") {
      if (selectedStatus === "มอบหมาย") {
        matchesStatus = plan.plan_status === "active";
      } else if (selectedStatus === "เสร็จสิ้น") {
        matchesStatus = plan.plan_status !== "active";
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  if (hasError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">
              {errorMessage || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ค้นหา
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาแผนออกกำลังกาย"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานะแผนออกกำลังกาย
          </label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              <SelectItem value="มอบหมาย">มอบหมาย</SelectItem>
              <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Action Button */}
        <div className="flex gap-2 ml-auto">
          <Button onClick={handleCreatePlan} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
            สร้างแผนออกกำลังกาย
          </Button>
        </div>
      </div>

      {/* Plans Content */}
      {filteredPlans.length > 0 ? (
        <WorkoutPlanTable
          plans={filteredPlans}
          trainerId={trainerId}
          memberId={memberId}
          onStatusChange={handleStatusChange}
        />
      ) : (
        searchQuery || selectedStatus !== "ทั้งหมด" ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>ไม่พบแผนออกกำลังกายที่ตรงกับการค้นหา</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState trainerId={trainerId} memberId={memberId} />
        )
      )}
    </div>
  );
}

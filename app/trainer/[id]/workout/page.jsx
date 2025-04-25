"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTrainerWorkoutPlans } from "@/actions/trainer/workout/workoutv1/workoutPlanActions";
import { toast } from "@/components/ui/use-toast";
import WorkoutPlanList from "@/app/trainer/_components/workout/WorkoutPlanList";
import { FilterIcon } from "lucide-react";
import CreateWorkoutButton from "@/app/trainer/_components/workout/CreateWorkoutButton";

export default function TrainerWorkoutsPage({ params }) {
  const { id: trainerId } = React.use(params);
  const router = useRouter();

  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // สถิติ
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    completed: 0,
  });

  // ดึงข้อมูลโปรแกรมการฝึก
  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      const result = await getTrainerWorkoutPlans(trainerId);

      if (result.success) {
        setWorkoutPlans(result.plans);

        // คำนวณสถิติ
        const total = result.plans.length;
        const active = result.plans.filter(
          (plan) => plan.plan_status === "active"
        ).length;
        const completed = result.plans.filter(
          (plan) => plan.plan_status === "completed"
        ).length;
        const inactive = result.plans.filter(
          (plan) => plan.plan_status === "inactive"
        ).length;

        setStats({ total, active, inactive, completed });
      } else {
        setError(result.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้");
        setWorkoutPlans([]);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(error);
      setWorkoutPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    fetchWorkoutPlans();
  }, [trainerId]);

  // ฟังก์ชันค้นหา
  const handleSearch = (e) => {
    e.preventDefault();
    // ทำการค้นหาในข้อมูลที่มีอยู่แล้ว (client-side filtering)
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredPlans = workoutPlans.filter((plan) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      plan.plan_name.toLowerCase().includes(searchTermLower) ||
      plan.member_name.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          โปรแกรมการฝึก
        </h1>
        <p className="text-muted-foreground">
          จัดการโปรแกรมการออกกำลังกายสำหรับสมาชิกของคุณ
        </p>
      </div>

      {/* การ์ดสรุปข้อมูล */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              โปรแกรมทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                ใช้งาน
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                เสร็จสิ้น
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                ไม่ใช้งาน
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* ปุ่มและการค้นหา */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            placeholder="ค้นหาตามชื่อโปรแกรมหรือสมาชิก"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">ค้นหา</Button>
        </form>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/trainer/${trainerId}/workout/templates`)
            }
          >
            <FilterIcon className="h-4 w-4 mr-2" /> เทมเพลต
          </Button>
          <CreateWorkoutButton trainerId={trainerId} />
        </div>
      </div>

      {/* แสดงข้อความค้นหา */}
      {searchTerm && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ผลการค้นหาสำหรับ:{" "}
            <span className="font-medium">"{searchTerm}"</span>
          </p>
          <Button
            variant="ghost"
            onClick={() => setSearchTerm("")}
            className="h-auto p-0 text-sm text-muted-foreground"
          >
            ล้างการค้นหา
          </Button>
        </div>
      )}

      {/* แสดงข้อผิดพลาด */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* แสดงรายการโปรแกรมการฝึก */}
      {loading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WorkoutPlanList
          plans={filteredPlans}
          trainerId={trainerId}
          onRefresh={fetchWorkoutPlans}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getWorkoutPlanById } from "@/actions/trainer/(workout)/workoutPlanActions";
import { getPlanExercises } from "@/actions/trainer/(workout)/workoutExerciseActions";
import { formatDate } from "@/utils/utils";
import ExerciseList from "@/app/trainer/_components/(workout)/ExerciseList";
import { toast } from "@/components/ui/use-toast";
import { Edit, ChevronLeft, Calendar, Users, Dumbbell } from "lucide-react";

export default function WorkoutPlanDetailsPage({ params }) {
  const { id: trainerId, planId } = React.use(params);
  const router = useRouter();

  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [groupedByDay, setGroupedByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPlanData = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลโปรแกรมการฝึก
      const planResult = await getWorkoutPlanById(planId, trainerId);
      
      if (!planResult.success) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: planResult.message || "ไม่สามารถดึงข้อมูลโปรแกรมการฝึกได้",
          variant: "destructive",
        });
        router.back();
        return;
      }
      
      setPlan(planResult.plan);
      
      // ดึงข้อมูลท่าออกกำลังกาย
      const exercisesResult = await getPlanExercises(planId);
      
      if (exercisesResult.success) {
        setExercises(exercisesResult.exercises || []);
        setGroupedByDay(exercisesResult.groupedByDay || {});
      }
    } catch (error) {
      console.error("Error fetching plan data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, [trainerId, planId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">กำลังโหลดข้อมูล...</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">ไม่พบข้อมูล</h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">ไม่พบข้อมูลโปรแกรมการฝึก</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // แปลงวันออกกำลังกาย
  const getDayNames = (daysString) => {
    if (!daysString) return "-";
    
    const dayMap = {
      "1": "จันทร์",
      "2": "อังคาร",
      "3": "พุธ",
      "4": "พฤหัสบดี",
      "5": "ศุกร์",
      "6": "เสาร์",
      "7": "อาทิตย์",
    };
    
    return daysString.split(",").map(day => dayMap[day] || day).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{plan.plan_name}</h1>
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground">
              สำหรับ: {plan.member_name}
            </p>
            {plan.plan_status === "active" ? (
              <Badge className="bg-green-500">ใช้งาน</Badge>
            ) : plan.plan_status === "completed" ? (
              <Badge className="bg-blue-500">เสร็จสิ้น</Badge>
            ) : (
              <Badge variant="outline">ไม่ใช้งาน</Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
          <Button 
            onClick={() => router.push(`/trainer/${trainerId}/workouts/edit/${planId}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> แก้ไข
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Calendar className="h-4 w-4 mr-2" /> ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <Dumbbell className="h-4 w-4 mr-2" /> ท่าออกกำลังกาย
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดโปรแกรม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ข้อมูลโปรแกรม</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">ชื่อโปรแกรม:</span>
                      <span>{plan.plan_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">ระดับความยาก:</span>
                      <span>{plan.difficulty_level === "beginner" ? "เริ่มต้น" : 
                             plan.difficulty_level === "intermediate" ? "ปานกลาง" : 
                             plan.difficulty_level === "advanced" ? "ขั้นสูง" : plan.difficulty_level}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">วันออกกำลังกาย:</span>
                      <span>{getDayNames(plan.workout_days)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">ความถี่:</span>
                      <span>{plan.workout_frequency} วันต่อสัปดาห์</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">วันที่เริ่มต้น:</span>
                      <span>{plan.plan_startdate ? formatDate(plan.plan_startdate) : "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">วันที่สิ้นสุด:</span>
                      <span>{plan.plan_enddate ? formatDate(plan.plan_enddate) : "ไม่มีกำหนด"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">จำนวนท่าออกกำลังกาย:</span>
                      <span>{exercises.length} ท่า</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ข้อมูลสมาชิก</h3>
                  <div className="mt-2 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {plan.member_profileimage ? (
                        <img 
                          src={plan.member_profileimage} 
                          alt={plan.member_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-400">
                          {plan.member_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-medium">{plan.member_name}</h3>
                    <p className="text-muted-foreground">{plan.member_gender || "-"}</p>
                  </div>
                </div>
              </div>
              
              {plan.plan_description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">รายละเอียดเพิ่มเติม</h3>
                  <p className="mt-2 whitespace-pre-line">{plan.plan_description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => setActiveTab("exercises")}
              >
                <Dumbbell className="mr-2 h-4 w-4" /> ดูท่าออกกำลังกาย
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="exercises" className="mt-4">
          <ExerciseList 
            exercises={exercises}
            groupedByDay={groupedByDay}
            planId={planId}
            trainerId={trainerId}
            workoutDays={plan.workout_days}
            onRefresh={fetchPlanData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getWorkoutTemplateById,
  createWorkoutFromTemplate,
} from "@/actions/trainer/workout/workoutTemplateActions";
import { getPlanExercises } from "@/actions/trainer/workout/workoutExerciseActions";
import { formatDate } from "@/utils/utils";
import ExerciseList from "@/app/trainer/_components/workout/ExerciseList";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Calendar,
  Users,
  Dumbbell,
  Copy,
  Edit,
  Clock,
  BookOpen,
  User,
} from "lucide-react";

export default function TemplateDetailsPage({ params }) {
  const { id: trainerId, templateId } = React.use(params);
  const router = useRouter();

  const [template, setTemplate] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [groupedByDay, setGroupedByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchTemplateData = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลเทมเพลต
      const templateResult = await getWorkoutTemplateById(templateId);

      if (!templateResult.success) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: templateResult.message || "ไม่สามารถดึงข้อมูลเทมเพลตได้",
          variant: "destructive",
        });
        router.back();
        return;
      }

      setTemplate(templateResult.template);

      // ดึงข้อมูลท่าออกกำลังกาย
      const exercisesResult = await getPlanExercises(templateId);

      if (exercisesResult.success) {
        setExercises(exercisesResult.exercises || []);
        setGroupedByDay(exercisesResult.groupedByDay || {});
      }
    } catch (error) {
      console.error("Error fetching template data:", error);
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
    fetchTemplateData();
  }, [trainerId, templateId]);

  const handleUseTemplate = async () => {
    router.push(`/trainer/${trainerId}/workout/templates/${templateId}/use`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            กำลังโหลดข้อมูล...
          </h1>
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

  if (!template) {
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
              <p className="text-muted-foreground">
                ไม่พบข้อมูลเทมเพลตโปรแกรมการฝึก
              </p>
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
      1: "จันทร์",
      2: "อังคาร",
      3: "พุธ",
      4: "พฤหัสบดี",
      5: "ศุกร์",
      6: "เสาร์",
      7: "อาทิตย์",
    };

    return daysString
      .split(",")
      .map((day) => dayMap[day] || day)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {template.template_name}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-1" />
              {template.trainer_id.toString() === trainerId.toString()
                ? "สร้างโดยคุณ"
                : `สร้างโดย ${template.trainer_name}`}
            </span>
            {template.is_public === 1 && (
              <Badge className="bg-green-500">สาธารณะ</Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
          {template.trainer_id.toString() === trainerId.toString() && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/trainer/${trainerId}/workout/templates/edit/${templateId}`
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" /> แก้ไข
            </Button>
          )}
          <Button onClick={handleUseTemplate} disabled={submitting}>
            <Copy className="mr-2 h-4 w-4" /> ใช้เทมเพลตนี้
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
              <CardTitle>รายละเอียดเทมเพลต</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    ข้อมูลเทมเพลต
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">ชื่อเทมเพลต:</span>
                      <span>{template.template_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">ระดับความยาก:</span>
                      <span>
                        {template.difficulty_level === "beginner"
                          ? "เริ่มต้น"
                          : template.difficulty_level === "intermediate"
                          ? "ปานกลาง"
                          : template.difficulty_level === "advanced"
                          ? "ขั้นสูง"
                          : template.difficulty_level || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">วันออกกำลังกาย:</span>
                      <span>{getDayNames(template.workout_days)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">
                        กลุ่มกล้ามเนื้อเป้าหมาย:
                      </span>
                      <span>{template.target_muscles || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">สถานะ:</span>
                      <span>
                        {template.is_public === 1 ? "สาธารณะ" : "ส่วนตัว"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">วันที่สร้าง:</span>
                      <span>{formatDate(template.created_at)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">จำนวนท่าออกกำลังกาย:</span>
                      <span>{exercises.length} ท่า</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    รายละเอียดเพิ่มเติม
                  </h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md border">
                    <p className="whitespace-pre-line">
                      {template.template_description ||
                        "ไม่มีรายละเอียดเพิ่มเติม"}
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    เทมเพลตโปรแกรมการฝึกนี้เป็นโปรแกรมสำเร็จรูปที่สามารถนำไปใช้กับสมาชิกได้ทันที
                  </AlertDescription>
                </div>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setActiveTab("exercises")}>
                <Dumbbell className="mr-2 h-4 w-4" /> ดูท่าออกกำลังกาย
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="mt-4">
          <ExerciseList
            exercises={exercises}
            groupedByDay={groupedByDay}
            planId={templateId}
            trainerId={trainerId}
            workoutDays={template.workout_days}
            onRefresh={fetchTemplateData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

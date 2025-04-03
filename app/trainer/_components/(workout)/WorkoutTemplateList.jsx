"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, Eye, Copy, ArrowDownToLine, 
  LucideSave, Clock, BookOpen, User 
} from "lucide-react";
import { createWorkoutFromTemplate } from "@/actions/trainer/(workout)/workoutTemplateActions";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/utils";

export default function WorkoutTemplateList({ templates, trainerId, onSelect, memberId, showCreateButton = true }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  const handleView = (templateId) => {
    if (onSelect) {
      onSelect(templateId);
    } else {
      router.push(`/trainer/${trainerId}/workouts/templates/${templateId}`);
    }
  };

  const handleUseTemplate = async (templateId, memberIdParam) => {
    if (!memberIdParam) {
      router.push(`/trainer/${trainerId}/workouts/templates/${templateId}/use`);
      return;
    }

    setLoading(templateId);
    try {
      const result = await createWorkoutFromTemplate(templateId, trainerId, memberIdParam);
      
      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });
        router.push(`/trainer/${trainerId}/workouts/${result.workout_plan_id}`);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error using template:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างโปรแกรมการฝึกจากเทมเพลตได้",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (!templates || templates.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>เทมเพลตโปรแกรมการฝึก</CardTitle>
          <CardDescription>ยังไม่มีเทมเพลต</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">ยังไม่มีเทมเพลตโปรแกรมการฝึก</p>
          {showCreateButton && (
            <Button 
              onClick={() => router.push(`/trainer/${trainerId}/workouts/templates/create`)}
            >
              สร้างเทมเพลตใหม่
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">เทมเพลตโปรแกรมการฝึก</h2>
        {showCreateButton && (
          <Button 
            onClick={() => router.push(`/trainer/${trainerId}/workouts/templates/create`)}
          >
            สร้างเทมเพลตใหม่
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.template_id} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="w-3.5 h-3.5 mr-1 inline" /> 
                    {template.trainer_id.toString() === trainerId.toString() 
                      ? "โดยคุณ" 
                      : `โดย ${template.trainer_name}`}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(template.template_id)}>
                      <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleUseTemplate(template.template_id, memberId)}
                      disabled={loading === template.template_id}
                    >
                      <Copy className="mr-2 h-4 w-4" /> ใช้เทมเพลตนี้
                    </DropdownMenuItem>
                    {template.trainer_id.toString() === trainerId.toString() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => router.push(`/trainer/${trainerId}/workouts/templates/edit/${template.template_id}`)}
                        >
                          <LucideSave className="mr-2 h-4 w-4" /> แก้ไขเทมเพลต
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pb-2">
              <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {template.template_description || "ไม่มีคำอธิบาย"}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.difficulty_level && (
                  <Badge variant="outline" className="bg-blue-50">
                    {template.difficulty_level === "beginner" ? "เริ่มต้น" : 
                     template.difficulty_level === "intermediate" ? "ปานกลาง" : 
                     template.difficulty_level === "advanced" ? "ขั้นสูง" : 
                     template.difficulty_level}
                  </Badge>
                )}
                {template.is_public === 1 && (
                  <Badge variant="outline" className="bg-green-50">
                    สาธารณะ
                  </Badge>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-auto">
                <div className="flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 inline" />
                  {template.exercise_count || 0} ท่า
                </div>
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 inline" />
                  {formatDate(template.created_at)}
                </div>
              </div>
            </CardContent>
            <div className="p-3 pt-0 mt-auto">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => handleUseTemplate(template.template_id, memberId)}
                disabled={loading === template.template_id}
              >
                {loading === template.template_id ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังสร้างโปรแกรม...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> ใช้เทมเพลตนี้
                  </span>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
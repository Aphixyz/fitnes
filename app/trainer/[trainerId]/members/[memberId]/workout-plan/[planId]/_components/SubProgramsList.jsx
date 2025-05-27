"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  ChevronRight,
  Dumbbell
} from "lucide-react";

// เอา action ที่ยังไม่มีออก
// import { deleteWorkoutProgram } from "@/actions/trainer/workout/workout_program/deleteWorkoutProgram";

export default function SubProgramsList({ 
  programs, 
  onSelectProgram, 
  trainerId, 
  memberId, 
  planId,
  onRefresh 
}) {
  const [deleting, setDeleting] = useState(false);
  
  if (!programs || programs.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground">ยังไม่มีโปรแกรมย่อย กรุณาเพิ่มโปรแกรม</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleDeleteProgram = async (programId) => {
    if (!confirm("คุณต้องการลบโปรแกรมย่อยนี้ใช่หรือไม่?")) {
      return;
    }
    
    // แทนด้วยการแจ้งเตือนว่ายังไม่พร้อมใช้งาน
    toast({
      title: "ขออภัย",
      description: "ฟังก์ชันการลบโปรแกรมย่อยยังไม่พร้อมใช้งาน",
      variant: "destructive",
    });
    
    // เราจะเรียกใช้ onRefresh เมื่อฟังก์ชันพร้อมใช้งาน
  };
  
  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <Card key={program.workout_program_id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{program.program_name}</CardTitle>
                {program.program_note && (
                  <CardDescription>{program.program_note}</CardDescription>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteProgram(program.workout_program_id)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onSelectProgram(program.workout_program_id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {program.exercises && program.exercises.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">ท่าออกกำลังกายในโปรแกรมนี้:</p>
                <div className="text-sm text-muted-foreground">
                  {program.exercises.map((ex, index) => (
                    <div key={ex.program_exercise_id || index} className="flex items-center py-1">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      <span>{ex.exercise_name || `ท่าที่ ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้</p>
            )}
            <div className="mt-4">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => onSelectProgram(program.workout_program_id)}
              >
                <span>เพิ่มและแก้ไขท่าออกกำลังกาย</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
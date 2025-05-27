"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProgramList({ programs, trainerId, memberId, planId }) {
  const router = useRouter();

  // ฟังก์ชันจัดการคลิก (สำหรับการเชื่อมต่อในอนาคต)
  const handleProgramClick = (programId) => {
    console.log("Program clicked:", programId);
    // ทำงานเมื่อคลิกที่การ์ด (จะเพิ่มฟังก์ชันในอนาคต)
  };

  // ฟังก์ชันสำหรับการนำทางไปยังหน้าเพิ่มโปรแกรม
  const handleAddProgram = () => {
    router.push(
      `/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/add-program`
    );
  };

  if (!programs || programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="mb-4 text-muted-foreground text-center">
          <p className="mb-2">ยังไม่มีโปรแกรมย่อยในแผนนี้</p>
          <p className="text-sm">
            เพิ่มโปรแกรมย่อยเพื่อสร้างแผนการออกกำลังกายแบบเต็มรูปแบบ
          </p>
        </div>
        <Button onClick={handleAddProgram} className="gap-1">
          <Plus className="h-4 w-4" />
          เพิ่มโปรแกรมย่อย
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {programs.map((program) => (
        <ProgramCard
          key={program.workout_program_id}
          program={program}
          trainerId={trainerId}
          memberId={memberId}
          planId={planId}
          onClick={() => handleProgramClick(program.workout_program_id)}
        />
      ))}
    </div>
  );
}

function ProgramCard({ program, trainerId, memberId, planId, onClick }) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="p-4 flex flex-row justify-between items-start space-y-0">
        <CardTitle className="text-lg font-medium">
          {program.program_name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">เมนู</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              <span>แก้ไขโปรแกรม</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>ทำสำเนาโปรแกรม</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>ลบโปรแกรม</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {program.exercises && program.exercises.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {program.exercises.map((exercise) => (
              <li
                key={exercise.exercise_id}
                className="flex items-center space-x-2"
              >
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <span>{exercise.exercise_name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">ไม่มีท่าออกกำลังกาย</p>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          จำนวนท่า: {program.exercises?.length || 0} ท่า
        </div>
      </CardContent>
    </Card>
  );
}

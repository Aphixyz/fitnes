"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { fetchWorkoutProgramId } from "@/lib/db/fetchWorkoutProgramId";
import { updateWorkoutProgram } from "@/actions/trainer/workout/workout_program/updateWorkoutProgram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, Save, Dumbbell } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProgramPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const trainerId = params.id;
  const memberId = params.memberId;
  const planId = params.planId;
  const programId = params.programId;
  const isNew = searchParams.get('isNewProgram') === 'true';
  
  const [program, setProgram] = useState({
    program_name: "",
    program_note: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadProgramData() {
      try {
        setLoading(true);
        const result = await fetchWorkoutProgramId(programId, trainerId);
        
        if (result.success) {
          setProgram({
            program_name: result.program.program_name,
            program_note: result.program.program_note || "",
          });
          setError(null);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Failed to load program data:", err);
        setError("ไม่สามารถโหลดข้อมูลโปรแกรมได้");
      } finally {
        setLoading(false);
      }
    }
    
    loadProgramData();
  }, [programId, trainerId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!program.program_name.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุชื่อโปรแกรม",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const result = await updateWorkoutProgram({
        workout_program_id: Number(programId),
        program_name: program.program_name,
        program_note: program.program_note
      });
      
      if (result.updated) {
        toast({
          title: "บันทึกสำเร็จ",
          description: "ข้อมูลโปรแกรมถูกบันทึกเรียบร้อยแล้ว",
        });
        
        // ถ้าเป็นโหมดสร้างใหม่ ให้เปลี่ยนเป็นโหมดแก้ไขหลังบันทึก
        if (isNew) {
          router.replace(`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}/programs/${programId}`);
        }
      } else {
        throw new Error("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      console.error("Error saving program:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลโปรแกรม",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-red-600">{error}</p>
        <div className="mt-4">
          <Link href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังหน้าแผนการออกกำลังกาย
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "สร้างโปรแกรมย่อยใหม่" : "แก้ไขโปรแกรมย่อย"}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? "กรอกข้อมูลโปรแกรมย่อยใหม่"
              : "แก้ไขรายละเอียดโปรแกรมย่อย"}
          </p>
        </div>
        
        <Link href={`/trainer/${trainerId}/members/${memberId}/workout-plan/${planId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลโปรแกรมย่อย</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program_name">ชื่อโปรแกรม</Label>
              <Input
                id="program_name"
                name="program_name"
                placeholder="ชื่อโปรแกรมย่อย เช่น วันจันทร์ - อก/ไหล่, วันพุธ - ขา, Full Body, ฯลฯ"
                value={program.program_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="program_note">บันทึกเพิ่มเติม</Label>
              <Textarea
                id="program_note"
                name="program_note"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมนี้"
                value={program.program_note}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2" />
            ท่าออกกำลังกายในโปรแกรม
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            เพิ่มท่าออกกำลังกาย
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-10">
            ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
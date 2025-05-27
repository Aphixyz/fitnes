"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Plus,
  Save,
  X, 
  Trash2 
} from "lucide-react";

// เอา actions ที่ยังไม่มีออกก่อน
// import { updateWorkoutProgram } from "@/actions/trainer/workout/workout_program/updateWorkoutProgram";
// import { addProgramExercise } from "@/actions/trainer/workout/program_exercise/addProgramExercise";
// import { updateProgramExercise } from "@/actions/trainer/workout/program_exercise/updateProgramExercise"; 
// import { deleteProgramExercise } from "@/actions/trainer/workout/program_exercise/deleteProgramExercise";
// import { upsertProgramExerciseSet } from "@/actions/trainer/workout/program_exercise/upsertProgramExerciseSet";

export default function SubProgramForm({ 
  programId, 
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  trainerId
}) {
  const [programData, setProgramData] = useState({
    program_name: "",
    program_note: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  
  // Load initial data
  useEffect(() => {
    if (isEdit && initialData) {
      setProgramData({
        program_name: initialData.program_name || "",
        program_note: initialData.program_note || ""
      });
      
      if (initialData.exercises) {
        setExercises(initialData.exercises);
      }
    }
    
    // เอาข้อมูลตัวอย่างออก และไม่ใช้ข้อมูลตัวอย่าง
    setAvailableExercises([]);
    
  }, [isEdit, initialData]);
  
  const handleChange = (field, value) => {
    setProgramData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async () => {
    // Validate
    if (!programData.program_name) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุชื่อโปรแกรม",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      if (isEdit) {
        // ปรับให้เรียกใช้ onSubmit แทนการใช้ action
        if (onSubmit) {
          onSubmit(programData);
        }
      } else {
        // Create new program
        if (onSubmit) {
          onSubmit(programData);
        }
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูล",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddExercise = async () => {
    if (!selectedExercise) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกท่าออกกำลังกาย",
        variant: "destructive",
      });
      return;
    }
    
    // เพิ่ม mock function ชั่วคราว
    toast({
      title: "ขออภัย",
      description: "ฟังก์ชันการเพิ่มท่าออกกำลังกายยังไม่พร้อมใช้งาน",
      variant: "destructive",
    });
  };
  
  const handleDeleteExercise = async (exerciseId) => {
    if (!confirm("คุณต้องการลบท่าออกกำลังกายนี้ใช่หรือไม่?")) {
      return;
    }
    
    // เพิ่ม mock function ชั่วคราว
    toast({
      title: "ขออภัย",
      description: "ฟังก์ชันการลบท่าออกกำลังกายยังไม่พร้อมใช้งาน",
      variant: "destructive",
    });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{isEdit ? "แก้ไขโปรแกรมย่อย" : "เพิ่มโปรแกรมย่อย"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="program_name">ชื่อโปรแกรมย่อย</Label>
          <Input
            id="program_name"
            placeholder="เช่น วันจันทร์ - อก/ไหล่, วันพุธ - ขา, Full Body, ฯลฯ"
            value={programData.program_name}
            onChange={(e) => handleChange("program_name", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="program_note">หมายเหตุ (ถ้ามี)</Label>
          <Textarea
            id="program_note"
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับโปรแกรมย่อยนี้"
            value={programData.program_note}
            onChange={(e) => handleChange("program_note", e.target.value)}
            rows={3}
          />
        </div>
        
        {isEdit && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">ท่าออกกำลังกาย</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddExercise(prev => !prev)}
              >
                {showAddExercise ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {showAddExercise ? "ยกเลิก" : "เพิ่มท่าออกกำลังกาย"}
              </Button>
            </div>
            
            {showAddExercise && (
              <Card className="border border-muted p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exercise">เลือกท่าออกกำลังกาย</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                    >
                      <option value="">-- เลือกท่าออกกำลังกาย --</option>
                      {availableExercises.map(exercise => (
                        <option key={exercise.exercise_id} value={exercise.exercise_id}>
                          {exercise.exercise_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddExercise} disabled={!selectedExercise || loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มท่าออกกำลังกาย
                  </Button>
                </div>
              </Card>
            )}
            
            {exercises.length > 0 ? (
              <div className="space-y-4 mt-4">
                {exercises.map((exercise, index) => (
                  <Card key={exercise.program_exercise_id || index} className="border border-muted">
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{exercise.exercise_name || `ท่าที่ ${index + 1}`}</h4>
                          {exercise.notes && <p className="text-sm text-muted-foreground">{exercise.notes}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteExercise(exercise.program_exercise_id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 bg-muted/50 py-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          ยกเลิก
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </CardFooter>
    </Card>
  );
}
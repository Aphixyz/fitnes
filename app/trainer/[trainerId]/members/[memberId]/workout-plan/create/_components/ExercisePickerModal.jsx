"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercises,
  initialExercises = [],
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [exerciseList, setExerciseList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState([]);

  // โหลดข้อมูลท่าออกกำลังกาย
  useEffect(() => {
    const loadExercises = async () => {
      try {
        // โหลดข้อมูลจากไฟล์ JSON
        const exercisesResponse = await fetch("/data/exercises/exercises.json");
        const categoriesResponse = await fetch(
          "/data/exercises/categories.json"
        );
        const muscleGroupsResponse = await fetch(
          "/data/exercises/muscle-groups.json"
        );
        const equipmentResponse = await fetch("/data/exercises/equipment.json");

        const exercises = await exercisesResponse.json();
        const categories = await categoriesResponse.json();
        const muscleGroups = await muscleGroupsResponse.json();
        const equipment = await equipmentResponse.json();

        setExerciseList(exercises);
        setCategories([
          { id: "all", name: "ทั้งหมด", thai_name: "ทั้งหมด" },
          ...categories,
        ]);
        setMuscleGroups(muscleGroups);
        setEquipment(equipment);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load exercises:", error);
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  // ฟังก์ชันหาชื่อกล้ามเนื้อจาก ID
  const getMuscleGroupNames = (muscleGroupIds) => {
    if (!muscleGroupIds || muscleGroupIds.length === 0) return "ไม่ระบุ";

    return muscleGroupIds
      .map((id) => {
        const group = muscleGroups.find((mg) => mg.id === id);
        return group ? group.thai_name : id;
      })
      .join(", ");
  };

  // ฟังก์ชันหาชื่ออุปกรณ์จาก ID
  const getEquipmentNames = (equipmentIds) => {
    if (!equipmentIds || equipmentIds.length === 0) return "ไม่ใช้อุปกรณ์";

    return equipmentIds
      .map((id) => {
        const equip = equipment.find((eq) => eq.id === id);
        return equip ? equip.thai_name : id;
      })
      .join(", ");
  };

  // ฟังก์ชันหาชื่อหมวดหมู่จาก ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.thai_name : categoryId;
  };

  // กรองข้อมูลตามหมวดหมู่และคำค้นหา
  const filteredExercises = exerciseList.filter((exercise) => {
    const matchesCategory =
      activeTab === "all" || exercise.category === activeTab;

    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.thai_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // ตรวจสอบว่าท่านี้ถูกเลือกไปแล้วหรือไม่
    const isSelected = initialExercises.some(
      (e) => e.exercise_id === exercise.id
    );

    return matchesCategory && matchesSearch && !isSelected;
  });

  // แก้ไขฟังก์ชัน handleSelectExercise
  const handleSelectExercise = (exercise) => {
    // ใช้ ID จริงจากข้อมูล exercise.json แทนที่จะสร้าง ID ชั่วคราว
    const exerciseWithType = {
      ...exercise,

      // แต่ใช้ exercise_id ที่เป็น id จริงจากไฟล์ exercise.json
      exercise_id: exercise.id,
      // Map category to exercise_type
      exercise_type: mapCategoryToType(exercise.category),
    };

    setSelectedExercises([...selectedExercises, exerciseWithType]);
  };

  // Helper to map category to exercise type
  const mapCategoryToType = (category) => {
    switch (category) {
      case "strength":
        return "strength";
      case "cardio":
        return "cardio";
      case "hiit":
        return "hiit";
      case "mobility":
        return "mobility";
      default:
        return "strength";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="w-full max-w-4xl">
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>เลือกท่าออกกำลังกาย</DialogTitle>
          <DialogDescription>
            เลือกท่าออกกำลังกายที่ต้องการเพิ่มลงในโปรแกรม
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาท่าออกกำลังกาย..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full overflow-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.thai_name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                {filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      selectedExercises.some(
                        (e) => e.exercise_id === exercise.id
                      )
                        ? "border-primary"
                        : ""
                    }`}
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">
                        {exercise.name}
                        <span className="text-xs bg-muted px-1 py-0.5 rounded ml-2">
                          {exercise.id}
                        </span>
                      </CardTitle>
                      <CardDescription>{exercise.thai_name}</CardDescription>
                    </CardHeader>
                    {/* {exercise.image && (
                      <div className="px-4 pb-2">
                        <img
                          src={exercise.image}
                          alt={exercise.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )} */}
                    <CardContent className="p-4 pt-0 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="font-medium">ประเภท:</span>
                        {getCategoryName(exercise.category)}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="font-medium">กล้ามเนื้อ:</span>
                        {getMuscleGroupNames(exercise.muscle_groups)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p>ไม่พบท่าออกกำลังกาย</p>
                <p className="text-sm text-muted-foreground">
                  ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="mr-2"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={() => {
              onSelectExercises(selectedExercises);
              onClose(false);
            }}
            disabled={selectedExercises.length === 0}
          >
            เพิ่มท่าที่เลือก ({selectedExercises.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

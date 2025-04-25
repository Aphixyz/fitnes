"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAllExercises } from "@/actions/trainer/workout/workoutv1/workoutExerciseActions";
import { toast } from "@/components/ui/use-toast";
import { Search, Filter, Dumbbell, ChevronRight } from "lucide-react";

export default function ExercisePicker({ onSelect }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [equipment, setEquipment] = useState("all");

  // ข้อมูลสำหรับตัวกรอง
  const [categories, setCategories] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([
    { value: "all", label: "ทุกระดับ" },
    { value: "beginner", label: "เริ่มต้น" },
    { value: "intermediate", label: "ปานกลาง" },
    { value: "advanced", label: "ขั้นสูง" },
  ]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const result = await getAllExercises();

      if (result.success) {
        setExercises(result.exercises || []);

        // สร้างรายการกรอง
        extractFilterOptions(result.exercises);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message || "ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // สร้างรายการกรอง
  const extractFilterOptions = (exercisesList) => {
    const categorySet = new Set();
    const muscleGroupSet = new Set();
    const equipmentSet = new Set();

    exercisesList.forEach((exercise) => {
      if (exercise.category) categorySet.add(exercise.category);

      if (exercise.muscle_groups) {
        exercise.muscle_groups.forEach((muscle) => muscleGroupSet.add(muscle));
      }

      if (exercise.equipment) {
        exercise.equipment.forEach((equip) => equipmentSet.add(equip));
      }
    });

    // เรียงลำดับและแปลงเป็นรูปแบบที่ใช้งานได้
    setCategories([
      { value: "all", label: "ทั้งหมด" },
      ...Array.from(categorySet)
        .sort()
        .map((cat) => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1), // แปลงเป็นตัวใหญ่ตัวแรก
        })),
    ]);

    setMuscleGroups([
      { value: "all", label: "ทั้งหมด" },
      ...Array.from(muscleGroupSet)
        .sort()
        .map((muscle) => ({
          value: muscle,
          label: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        })),
    ]);

    setEquipmentList([
      { value: "all", label: "ทั้งหมด" },
      ...Array.from(equipmentSet)
        .sort()
        .map((equip) => ({
          value: equip,
          label: equip.charAt(0).toUpperCase() + equip.slice(1),
        })),
    ]);
  };

  // กรองท่าออกกำลังกาย
  const filteredExercises = exercises.filter((exercise) => {
    // กรองตามคำค้นหา
    const searchMatch =
      searchTerm === "" ||
      exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.thai_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // กรองตามหมวดหมู่
    const categoryMatch = category === "all" || exercise.category === category;

    // กรองตามกลุ่มกล้ามเนื้อ
    const muscleMatch =
      muscleGroup === "all" ||
      (exercise.muscle_groups && exercise.muscle_groups.includes(muscleGroup));

    // กรองตามความยาก
    const difficultyMatch =
      difficulty === "all" || exercise.difficulty === difficulty;

    // กรองตามอุปกรณ์
    const equipmentMatch =
      equipment === "all" ||
      (exercise.equipment && exercise.equipment.includes(equipment));

    return (
      searchMatch &&
      categoryMatch &&
      muscleMatch &&
      difficultyMatch &&
      equipmentMatch
    );
  });

  // จัดการการค้นหา
  const handleSearch = (e) => {
    e.preventDefault();
    // ค้นหาจากค่าใน state แล้ว
  };

  // จัดการการเลือกท่าออกกำลังกาย
  const handleSelectExercise = (exercise) => {
    if (onSelect) {
      onSelect(exercise);
    }
  };

  return (
    <div className="space-y-4">
      {/* ส่วนการค้นหาและตัวกรอง */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาท่าออกกำลังกาย</CardTitle>
          <CardDescription>
            เลือกท่าออกกำลังกายที่ต้องการเพิ่มในโปรแกรม
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาท่าออกกำลังกาย"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit">ค้นหา</Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle-group">กลุ่มกล้ามเนื้อ</Label>
              <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                <SelectTrigger id="muscle-group">
                  <SelectValue placeholder="เลือกกลุ่มกล้ามเนื้อ" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((muscle) => (
                    <SelectItem key={muscle.value} value={muscle.value}>
                      {muscle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">ระดับความยาก</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="เลือกระดับความยาก" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">อุปกรณ์</Label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="เลือกอุปกรณ์" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((equip) => (
                    <SelectItem key={equip.value} value={equip.value}>
                      {equip.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* แสดงจำนวนผลลัพธ์ */}
          <div className="text-sm text-muted-foreground">
            พบ {filteredExercises.length} ท่าจากทั้งหมด {exercises.length} ท่า
          </div>
        </CardContent>
      </Card>

      {/* รายการท่าออกกำลังกาย */}
      <Card>
        <CardHeader>
          <CardTitle>ท่าออกกำลังกาย</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              ไม่พบท่าออกกำลังกายที่ตรงกับเงื่อนไข
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="font-medium mb-1">
                        {exercise.thai_name || exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscle_groups &&
                          exercise.muscle_groups.map((muscle) => (
                            <Badge
                              key={muscle}
                              variant="outline"
                              className="bg-blue-50"
                            >
                              {muscle}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="ml-2 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectExercise(exercise);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center mr-3">
                      <Dumbbell className="h-3 w-3 mr-1" />
                      <span className="capitalize">
                        {exercise.difficulty || "beginner"}
                      </span>
                    </div>
                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <div>อุปกรณ์: {exercise.equipment.join(", ")}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

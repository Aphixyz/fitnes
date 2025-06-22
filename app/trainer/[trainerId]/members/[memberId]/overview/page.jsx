import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Apple,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Trophy,
  Flame,
} from "lucide-react";
import Link from "next/link";

// Mock Data
const mockWorkoutPlan = {
  name: "แผนลดน้ำหนัก 8 สัปดาห์",
  status: "active",
  startDate: "2024-01-15",
  endDate: "2024-03-15",
  progress: 65,
  totalPrograms: 12,
  completedPrograms: 8,
  currentWeek: 5,
  totalWeeks: 8,
  nextSession: "2024-02-20",
  recentWorkouts: [
    { name: "Full Body Strength", date: "2024-02-18", duration: 45 },
    { name: "Cardio HIIT", date: "2024-02-16", duration: 30 },
    { name: "Upper Body Focus", date: "2024-02-14", duration: 50 },
  ],
};

const mockNutritionPlan = {
  name: "แผนโภชนาการลดน้ำหนัก",
  dailyCalories: 1800,
  targetCalories: 2000,
  protein: 120,
  carbs: 180,
  fat: 60,
  waterIntake: 2.5,
  targetWater: 3.0,
  mealsCompleted: 3,
  totalMeals: 5,
  lastUpdated: "2024-02-19",
  weeklyProgress: 85,
};

const mockFitnessGoals = {
  primaryGoal: "ลดน้ำหนัก",
  targetWeight: 65,
  currentWeight: 72,
  startWeight: 78,
  targetDate: "2024-04-15",
  progress: 77, // (78-72)/(78-65) * 100
  weeklyGoals: [
    { goal: "ออกกำลังกาย 4 ครั้ง", completed: 3, target: 4 },
    { goal: "ดื่มน้ำ 3 ลิตร/วัน", completed: 6, target: 7 },
    { goal: "เดิน 8,000 ก้าว/วัน", completed: 5, target: 7 },
  ],
  milestones: [
    { title: "ลดน้ำหนักได้ 3 กก.", achieved: true, date: "2024-02-01" },
    {
      title: "ออกกำลังกายต่อเนื่อง 4 สัปดาห์",
      achieved: true,
      date: "2024-02-10",
    },
    { title: "ลดน้ำหนักได้ 6 กก.", achieved: false, date: null },
  ],
};

// Workout Plan Card Component
function WorkoutPlanCard({ data, trainerId, memberId }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            แผนออกกำลังกาย
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">
            {data.status === "active" ? "กำลังใช้งาน" : "ไม่ได้ใช้งาน"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <p className="text-sm text-muted-foreground">
            สัปดาห์ที่ {data.currentWeek}/{data.totalWeeks}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>ความคืบหน้า</span>
            <span>{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">โปรแกรมที่เสร็จ</p>
            <p className="font-semibold">
              {data.completedPrograms}/{data.totalPrograms}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">เซสชันต่อไป</p>
            <p className="font-semibold">
              {new Date(data.nextSession).toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">การออกกำลังกายล่าสุด</h4>
          <div className="space-y-2">
            {data.recentWorkouts.map((workout, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate">{workout.name}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{workout.duration} นาที</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href={`/trainer/${trainerId}/members/${memberId}/workout-plan`}>
          <Button variant="outline" className="w-full mt-4" size="sm">
            ดูรายละเอียด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Nutrition Plan Card Component
function NutritionPlanCard({ data, trainerId, memberId }) {
  const calorieProgress = (data.dailyCalories / data.targetCalories) * 100;
  const waterProgress = (data.waterIntake / data.targetWater) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-600" />
            แผนโภชนาการ
          </CardTitle>
          <Badge variant="outline">
            อัปเดตล่าสุด:{" "}
            {new Date(data.lastUpdated).toLocaleDateString("th-TH")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <p className="text-sm text-muted-foreground">
            ความคืบหน้าสัปดาห์นี้: {data.weeklyProgress}%
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>แคลอรี่วันนี้</span>
              <span>
                {data.dailyCalories}/{data.targetCalories} kcal
              </span>
            </div>
            <Progress value={calorieProgress} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>การดื่มน้ำ</span>
              <span>
                {data.waterIntake}/{data.targetWater} ลิตร
              </span>
            </div>
            <Progress value={waterProgress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-muted-foreground">โปรตีน</p>
            <p className="font-semibold">{data.protein}g</p>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <p className="text-muted-foreground">คาร์บ</p>
            <p className="font-semibold">{data.carbs}g</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <p className="text-muted-foreground">ไขมัน</p>
            <p className="font-semibold">{data.fat}g</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>มื้ออาหารวันนี้</span>
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">
              {data.mealsCompleted}/{data.totalMeals}
            </span>
          </div>
        </div>

        <Link href={`/trainer/${trainerId}/members/${memberId}/nutrition`}>
          <Button variant="outline" className="w-full mt-4" size="sm">
            ดูรายละเอียด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Fitness Goals Card Component
function FitnessGoalsCard({ data, trainerId, memberId }) {
  const weightLoss = data.startWeight - data.currentWeight;
  const targetWeightLoss = data.startWeight - data.targetWeight;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            เป้าหมายออกกำลังกาย
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-800">
            {data.primaryGoal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold">{weightLoss} กก.</span>
          </div>
          <p className="text-sm text-muted-foreground">ลดน้ำหนักได้แล้ว</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>ความคืบหน้า</span>
              <span>{data.progress}%</span>
            </div>
            <Progress value={data.progress} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            เป้าหมาย: {data.targetWeight} กก. (อีก{" "}
            {data.currentWeight - data.targetWeight} กก.)
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">เป้าหมายสัปดาห์นี้</h4>
          <div className="space-y-2">
            {data.weeklyGoals.map((goal, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate">{goal.goal}</span>
                <div className="flex items-center gap-1">
                  {goal.completed >= goal.target ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span>
                    {goal.completed}/{goal.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">ความสำเร็จ</h4>
          <div className="space-y-1">
            {data.milestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {milestone.achieved ? (
                  <Trophy className="h-3 w-3 text-yellow-500" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-gray-300" />
                )}
                <span
                  className={
                    milestone.achieved
                      ? "text-green-700"
                      : "text-muted-foreground"
                  }
                >
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link href={`/trainer/${trainerId}/members/${memberId}/goals`}>
          <Button variant="outline" className="w-full mt-4" size="sm">
            ดูรายละเอียด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Main Overview Page
export default async function OverviewPage({ params }) {
  const { trainerId, memberId } = await params;

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkoutPlanCard
          data={mockWorkoutPlan}
          trainerId={trainerId}
          memberId={memberId}
        />
        <NutritionPlanCard
          data={mockNutritionPlan}
          trainerId={trainerId}
          memberId={memberId}
        />
        <FitnessGoalsCard
          data={mockFitnessGoals}
          trainerId={trainerId}
          memberId={memberId}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">วันที่เข้าร่วม</p>
                <p className="font-semibold">45 วัน</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">เซสชันทั้งหมด</p>
                <p className="font-semibold">28 ครั้ง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">แคลอรี่เผาผลาญ</p>
                <p className="font-semibold">12,560 kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  เฉลี่ยต่อสัปดาห์
                </p>
                <p className="font-semibold">4.2 ครั้ง</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

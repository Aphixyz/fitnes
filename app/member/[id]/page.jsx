import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { getMemberById } from "@/actions/member/getMemberData";
import { getActivePlans } from "@/actions/member/dashboard";
import {
  formatDate,
  calculateAge,
  getInitials,
  getDayNameThai,
} from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Dumbbell, UtensilsCrossed, CalendarDays } from "lucide-react";

/**
 * EmptyState component - แสดงเมื่อไม่มีข้อมูล
 */
const EmptyState = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default async function MemberDashboard({ params }) {
  // ดึงข้อมูลสมาชิกโดยใช้ ID จาก params
  const { id } = params;
  const memberId = parseInt(id, 10);

  // ดึงข้อมูลสมาชิกและแผนที่กำลังใช้งาน
  const member = await getMemberById(memberId);
  const { workoutPlan, nutritionPlan } = await getActivePlans(memberId);

  // หากไม่พบข้อมูลสมาชิก
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ไม่พบข้อมูลสมาชิก
          </h2>
          <p className="text-gray-600">ไม่พบข้อมูลสมาชิกที่มี ID: {memberId}</p>
        </div>
      </div>
    );
  }

  // ดึงข้อมูลวันที่เป็นวันนี้
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = วันอาทิตย์, 1 = วันจันทร์, ...
  const dayMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }; // แปลง 0 (วันอาทิตย์) เป็น 7
  const todayNumber = dayMap[dayOfWeek];
  const thaiDayName = getDayNameThai(todayNumber);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          สวัสดี, คุณ {member.firstName}
        </h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับกลับมาสู่ระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card แผนการฝึก */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5" />
                โปรแกรมฝึก{thaiDayName}
              </CardTitle>
              {workoutPlan && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {workoutPlan.todayExercises.length} ท่า
                </Badge>
              )}
            </div>
            {workoutPlan && (
              <CardDescription>จาก {workoutPlan.trainer_name}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="pb-2">
            {workoutPlan ? (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {workoutPlan.plan_name}
                </h3>
                {workoutPlan.todayExercises.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {workoutPlan.todayExercises
                      .slice(0, 3)
                      .map((exercise, index) => (
                        <div
                          key={exercise.workout_exercise_id}
                          className="flex justify-between py-1 px-2 bg-gray-50 rounded"
                        >
                          <span>
                            {index + 1}. {exercise.exercise_id}
                          </span>
                          <span className="text-gray-600">
                            {exercise.sets} x {exercise.repetitions}
                          </span>
                        </div>
                      ))}
                    {workoutPlan.todayExercises.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{workoutPlan.todayExercises.length - 3} ท่า
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mb-4 text-gray-500">ไม่มีการฝึกวันนี้</p>
                )}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีโปรแกรมฝึก"
                description="กรุณาติดต่อผู้ฝึกสอนของคุณเพื่อสร้างโปรแกรมการฝึก"
                icon={<CalendarDays className="h-12 w-12" />}
              />
            )}
          </CardContent>

          <CardFooter>
            {workoutPlan && (
              <Link href={`/member/${memberId}/workout`} className="w-full">
                <Button variant="default" className="w-full">
                  ไปยังแผนฝึก
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* Card แผนโภชนาการ */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                แผนโภชนาการวันนี้
              </CardTitle>
              {nutritionPlan && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {nutritionPlan.meals.length} มื้อ
                </Badge>
              )}
            </div>
            {nutritionPlan && (
              <CardDescription>
                จาก {nutritionPlan.trainer_name}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pb-2">
            {nutritionPlan ? (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {nutritionPlan.plan_name}
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">แคลอรี่</p>
                    <p className="font-semibold">
                      {nutritionPlan.daily_calories} kcal
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">โปรตีน</p>
                    <p className="font-semibold">
                      {nutritionPlan.protein_target}g
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">คาร์บ</p>
                    <p className="font-semibold">
                      {nutritionPlan.carbs_target}g
                    </p>
                  </div>
                </div>
                {nutritionPlan.meals.length > 0 ? (
                  <div className="space-y-2">
                    {nutritionPlan.meals.slice(0, 3).map((meal) => (
                      <div
                        key={meal.meal_plan_id}
                        className="flex justify-between py-1 px-2 bg-gray-50 rounded"
                      >
                        <span>{meal.meal_name}</span>
                        <span className="text-gray-600">
                          {meal.meal_time || "-"}
                        </span>
                      </div>
                    ))}
                    {nutritionPlan.meals.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{nutritionPlan.meals.length - 3} มื้อ
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">ยังไม่มีการกำหนดมื้ออาหาร</p>
                )}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีแผนโภชนาการ"
                description="กรุณาติดต่อผู้ฝึกสอนของคุณเพื่อสร้างแผนโภชนาการ"
                icon={<UtensilsCrossed className="h-12 w-12" />}
              />
            )}
          </CardContent>

          <CardFooter>
            {nutritionPlan && (
              <Link href={`/member/${memberId}/nutrition`} className="w-full">
                <Button variant="default" className="w-full">
                  ไปยังแผนโภชนาการ
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* ข้อมูลส่วนตัว */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 text-2xl font-bold">
                  {member.member_firstname
                    ? member.member_firstname.charAt(0)
                    : ""}
                  {member.member_lastname
                    ? member.member_lastname.charAt(0)
                    : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ชื่อผู้ใช้:</p>
                <p className="font-medium">{member.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล:</p>
                <p className="font-medium">
                  {member.firstName} {member.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">อีเมล:</p>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เบอร์โทรศัพท์:</p>
                <p className="font-medium">{member.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เพศ:</p>
                <p className="font-medium">{member.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันเกิด:</p>
                <p className="font-medium">{formatDate(member.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">อายุ:</p>
                <p className="font-medium">
                  {calculateAge(member.dateOfBirth)} ปี
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID สมาชิก:</p>
                <p className="font-medium">{member.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

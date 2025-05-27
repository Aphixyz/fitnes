import { Suspense } from "react";
import { getWorkoutTemplateByTrainerId } from "@/schemas/workoutv2/Workout-Template-Management/getWorkoutTemplateByTrainerId";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Activity,
  Users,
  ChevronLeft,
  Dumbbell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WorkoutTemplateList from "@/app/trainer/_components/workout/WorkoutTemplateList";
import TemplateSearchForm from "./_components/TemplateSearchForm";

// SkeletonComponent สำหรับแสดงระหว่างโหลดข้อมูล
function TemplateListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-[240px]">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 mt-auto">
              <div className="h-10 w-full bg-blue-100 rounded animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Server Component หลัก
export default async function WorkoutTemplatesPage({ params, searchParams }) {
  const { id: trainerId } = params;
  const query = searchParams.q || "";
  const includePublic = true; // ตั้งค่าว่าต้องการดึงข้อมูลเทมเพลตสาธารณะด้วยหรือไม่

  // ดึงข้อมูลเทมเพลตทั้งหมดของเทรนเนอร์
  const result = await getWorkoutTemplateByTrainerId(trainerId, includePublic);

  if (!result.success) {
    notFound();
  }

  let templates = result.templates || [];

  // กรองเทมเพลตตามคำค้นหา (ถ้ามี)
  if (query) {
    templates = templates.filter((template) =>
      template.template_name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // จัดกลุ่มเทมเพลต
  const ownTemplates = templates.filter(
    (t) => t.trainer_id.toString() === trainerId.toString()
  );
  const publicTemplates = templates.filter(
    (t) => t.trainer_id.toString() !== trainerId.toString()
  );

  // คำนวณสถิติ
  const totalTemplates = templates.length;
  const totalSessions = templates.reduce(
    (sum, t) => sum + (t.session_count || 0),
    0
  );
  const totalExercises = templates.reduce(
    (sum, t) => sum + (t.exercise_count || 0),
    0
  );
  const uniqueMuscleGroups = new Set();
  templates.forEach((t) => {
    (t.target_muscles || []).forEach((muscle) =>
      uniqueMuscleGroups.add(muscle)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link
            href={`/trainer/${trainerId}/workout`}
            className="text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> กลับไปยังโปรแกรมการฝึก
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            เทมเพลตโปรแกรมการฝึก
          </h1>
          <p className="text-muted-foreground">
            สร้างและจัดการเทมเพลตโปรแกรมการออกกำลังกายสำหรับสมาชิกของคุณ
          </p>
        </div>

        <div className="flex space-x-2 w-full md:w-auto">
          <Suspense
            fallback={
              <div className="h-10 w-[300px] bg-gray-100 rounded animate-pulse"></div>
            }
          >
            <TemplateSearchForm initialQuery={query} />
          </Suspense>

          <Button className="flex items-center whitespace-nowrap" asChild>
            <Link href={`/trainer/${trainerId}/workout/templates/create`}>
              <Plus className="h-4 w-4 mr-2" /> สร้างเทมเพลต
            </Link>
          </Button>
        </div>
      </div>

      {/* สถิติเกี่ยวกับเทมเพลต */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 opacity-70" />
              เทมเพลตทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTemplates}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <Activity className="h-4 w-4 mr-2 opacity-70" />
              เซสชันทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
              <Dumbbell className="h-4 w-4 mr-2 opacity-70" />
              ท่าออกกำลังกายทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalExercises}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center">
              <Users className="h-4 w-4 mr-2 opacity-70" />
              กลุ่มกล้ามเนื้อที่มี
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueMuscleGroups.size}</div>
          </CardContent>
        </Card>
      </div>

      {/* รายการเทมเพลตของฉัน */}
      <Suspense fallback={<TemplateListSkeleton />}>
        {query && templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold">ไม่พบเทมเพลตที่ค้นหา</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                ไม่พบผลลัพธ์สำหรับ "{query}"
              </p>
              <Link
                href={`/trainer/${trainerId}/workout/templates`}
                className="text-blue-600 hover:underline"
              >
                ล้างการค้นหา
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* เทมเพลตของฉัน */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">เทมเพลตของฉัน</h2>
                <Badge variant="outline" className="text-sm">
                  {ownTemplates.length} รายการ
                </Badge>
              </div>

              {ownTemplates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      ไม่พบเทมเพลตของคุณ
                    </h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                      คุณยังไม่ได้สร้างเทมเพลตโปรแกรมใดๆ
                    </p>
                    <Button className="flex items-center" asChild>
                      <Link
                        href={`/trainer/${trainerId}/workout/templates/create`}
                      >
                        <Plus className="h-4 w-4 mr-2" /> สร้างเทมเพลตใหม่
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <WorkoutTemplateList
                  templates={ownTemplates}
                  trainerId={trainerId}
                  onRefresh={null}
                  showCreateButton={false}
                />
              )}
            </section>

            {/* เทมเพลตสาธารณะ */}
            {publicTemplates.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">เทมเพลตสาธารณะ</h2>
                  <Badge variant="outline" className="text-sm">
                    {publicTemplates.length} รายการ
                  </Badge>
                </div>

                <WorkoutTemplateList
                  templates={publicTemplates}
                  trainerId={trainerId}
                  onRefresh={null}
                  showCreateButton={false}
                />
              </section>
            )}
          </div>
        )}
      </Suspense>
    </div>
  );
}

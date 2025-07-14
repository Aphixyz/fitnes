import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Weight,
  Timer,
  Flame,
} from "lucide-react";

// ===== Server Actions =====
import { fetchProgress } from "@/actions/trainer/progress/fetchProgress";
import { getGoal } from "@/actions/member/progression/goal/getGoal";
import { getTotalVolume } from "@/actions/member/progression/total/getTotalVolume";
import { getTotalSessions } from "@/actions/member/progression/total/getTotalSessions";
import { getProgressPhotos } from "@/actions/member/quick-add/getProgressPhoto";

// ===== Helper Functions =====
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}ช ${minutes}น`;
  }
  return `${minutes}น`;
}

function calculateGoalProgress(currentWeight, startWeight, targetWeight) {
  if (!currentWeight || !startWeight || !targetWeight) return 0;

  const totalChange = Math.abs(startWeight - targetWeight);
  const currentChange = Math.abs(startWeight - currentWeight);

  if (totalChange === 0) return 100;

  const progress = (currentChange / totalChange) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// ===== Main Page Component =====
export default async function ProgressPage({ params }) {
  const memberId = parseInt(params.id);

  // ดึงข้อมูล progress 30 วันล่าสุด
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [progressData, goalData, volumeData, sessionsData, photosData] =
    await Promise.all([
      fetchProgress(
        memberId,
        "1M",
        thirtyDaysAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      ),
      getGoal(
        memberId,
        thirtyDaysAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      ),
      getTotalVolume(
        memberId,
        thirtyDaysAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      ),
      getTotalSessions(
        memberId,
        thirtyDaysAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      ),
      getProgressPhotos(memberId),
    ]);

  // ดึงข้อมูลล่าสุดสำหรับเปรียบเทียบ
  const latestPhoto =
    photosData.success && photosData.data.length > 0
      ? photosData.data[0]
      : null;
  const activeGoal =
    goalData.success && goalData.data.length > 0 ? goalData.data[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== Header Section ===== */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            ความคืบหน้าของฉัน
          </h1>
          <p className="text-slate-600">ดูภาพรวมการพัฒนาตลอด 30 วันที่ผ่านมา</p>
        </div>

        {/* ===== Hero Metrics Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Volume Card */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(progressData?.workout?.totals?.volume || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">กิโลกรัม</p>
            </CardContent>
          </Card>

          {/* Total Sessions Card */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {progressData?.workout?.totals?.sessions || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">ครั้ง</p>
            </CardContent>
          </Card>

          {/* Average Duration Card */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Timer className="h-4 w-4 text-purple-500" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatDuration(
                  progressData?.workout?.averages?.durationPerSession || 0
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">ต่อครั้ง</p>
            </CardContent>
          </Card>

          {/* Goal Progress Card */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {activeGoal
                  ? `${Math.round(activeGoal.progressPercentage)}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-slate-500 mt-1">เป้าหมาย</p>
            </CardContent>
          </Card>
        </div>

        {/* ===== Progress Overview Section ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Weight className="h-5 w-5 text-blue-600" />
                ความคืบหน้าน้ำหนัก
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGoal ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      เป้าหมาย: {activeGoal.targetWeight} kg
                    </span>
                    <Badge
                      variant={activeGoal.isCompleted ? "default" : "secondary"}
                    >
                      {activeGoal.isCompleted ? "สำเร็จ" : "กำลังดำเนินการ"}
                    </Badge>
                  </div>
                  <Progress
                    value={activeGoal.progressPercentage}
                    className="h-2"
                  />
                  <div className="text-sm text-slate-500">
                    {activeGoal.daysElapsed} วัน จาก {activeGoal.durationDays}{" "}
                    วัน
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีเป้าหมายที่กำหนด</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Frequency */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                ความถี่การออกกำลังกาย
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {progressData?.workout?.averages?.workoutFrequency || 0}
                </div>
                <p className="text-sm text-slate-500">ครั้งต่อสัปดาห์</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-900">
                    {progressData?.workout?.totals?.sessions || 0}
                  </div>
                  <div className="text-slate-500">ครั้งรวม</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-900">
                    {formatNumber(
                      progressData?.workout?.averages?.volumePerSession || 0
                    )}
                  </div>
                  <div className="text-slate-500">kg/ครั้ง</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Nutrition Overview ===== */}
        {progressData?.nutrition?.summary?.hasData && (
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-600" />
                สรุปโภชนาการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {progressData.nutrition.summary.averageCalories || 0}
                  </div>
                  <div className="text-xs text-slate-500">แคลอรี่/วัน</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {progressData.nutrition.summary.averageProtein || 0}g
                  </div>
                  <div className="text-xs text-slate-500">โปรตีน/วัน</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {progressData.nutrition.summary.averageCarb || 0}g
                  </div>
                  <div className="text-xs text-slate-500">คาร์บ/วัน</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {progressData.nutrition.summary.averageFat || 0}g
                  </div>
                  <div className="text-xs text-slate-500">ไขมัน/วัน</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== Progress Photos Section ===== */}
        {latestPhoto && (
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">รูปภาพความคืบหน้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-500">
                <p>
                  รูปภาพล่าสุด:{" "}
                  {new Date(
                    latestPhoto.member_health_measurementdate
                  ).toLocaleDateString("th-TH")}
                </p>
                <p className="text-sm mt-2">(จะแสดงรูปภาพเมื่อมีการอัปโหลด)</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== Call to Action ===== */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">
              ต้องการดูรายละเอียดเพิ่มเติม?
            </h3>
            <p className="text-blue-100 mb-4">
              ดูกราฟแนวโน้ม แนวทางเป้าหมาย และสถิติรายละเอียด
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                กราฟแนวโน้ม
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                แนวทางเป้าหมาย
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                สถิติรายละเอียด
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

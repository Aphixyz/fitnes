import { getTrainerById } from "@/actions/trainer/getTrainerData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Users,
  Activity,
  Award,
  Clock,
} from "lucide-react";
import { notFound } from "next/navigation";

// ===== Trainer Dashboard Page =====
export default async function TrainerDashboardPage({ params }) {
  const { trainerId } = params;

  try {
    // ดึงข้อมูลเทรนเนอร์
    const trainer = await getTrainerById(parseInt(trainerId));

    if (!trainer) {
      notFound();
    }

    // คำนวณอายุจาก dateOfBirth
    const calculateAge = (birthDate) => {
      if (!birthDate) return "ไม่ระบุ";
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }
      return `${age} ปี`;
    };

    // ฟอร์แมตวันที่
    const formatDate = (date) => {
      if (!date) return "ไม่ระบุ";
      return new Date(date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Card */}
          <Card className="lg:w-1/3">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={trainer.profileImage || "/default-avatar.png"}
                    alt={`${trainer.firstName} ${trainer.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {trainer.firstName?.charAt(0)}
                    {trainer.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {trainer.firstName} {trainer.lastName}
              </CardTitle>
              <CardDescription>
                {trainer.nickname && `(${trainer.nickname})`}
              </CardDescription>
              <div className="flex justify-center mt-2">
                <Badge
                  variant={
                    trainer.status === "active" ? "default" : "secondary"
                  }
                >
                  {trainer.status === "active" ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>@{trainer.username}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{trainer.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{trainer.phone || "ไม่ระบุ"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>อายุ {calculateAge(trainer.dateOfBirth)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>ประสบการณ์ {trainer.experience || 0} ปี</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Members Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  สมาชิกทั้งหมด
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  +0 คนจากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>

            {/* Active Plans Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  แผนการออกกำลังกาย
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  แผนที่ใช้งานอยู่
                </p>
              </CardContent>
            </Card>

            {/* Experience Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  วันเริ่มงาน
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {formatDate(trainer.startDate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ประสบการณ์ {trainer.experience || 0} ปี
                </p>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">สถานะ</CardTitle>
                <Badge
                  variant={
                    trainer.status === "active" ? "default" : "secondary"
                  }
                >
                  {trainer.status === "active" ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {trainer.status === "active"
                    ? "พร้อมให้บริการ"
                    : "ไม่พร้อมให้บริการ"}
                </div>
                <p className="text-xs text-muted-foreground">
                  อัปเดตล่าสุด: วันนี้
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bio & Specialization */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>
                ประวัติและความเชี่ยวชาญของเทรนเนอร์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainer.bio && (
                <div>
                  <h4 className="font-medium text-sm mb-2">เกี่ยวกับฉัน</h4>
                  <p className="text-sm text-muted-foreground">{trainer.bio}</p>
                </div>
              )}

              {trainer.specialization && (
                <div>
                  <h4 className="font-medium text-sm mb-2">ความเชี่ยวชาญ</h4>
                  <p className="text-sm text-muted-foreground">
                    {trainer.specialization}
                  </p>
                </div>
              )}

              {trainer.certification && (
                <div>
                  <h4 className="font-medium text-sm mb-2">ใบรับรอง</h4>
                  <p className="text-sm text-muted-foreground">
                    {trainer.certification}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>เมนูด่วน</CardTitle>
              <CardDescription>การดำเนินการที่ใช้บ่อย</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`/trainer/${trainerId}/members`}
                  className="p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>จัดการสมาชิก</span>
                  </div>
                </a>

                <a
                  href={`/trainer/${trainerId}/registration`}
                  className="p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>ลิงก์ลงทะเบียน</span>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading trainer dashboard:", error);
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

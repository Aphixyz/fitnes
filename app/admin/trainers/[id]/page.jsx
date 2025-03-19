import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getTrainerById } from "@/actions/admin/getTrainerById";
import { formatDate, calculateAge, getInitials } from "@/utils/utils";

export default async function TrainerDashboard({ params }) {
  // ต้องใช้ await ก่อนเข้าถึง params ใน Next.js 15
  const { id } = await params;

  // ดึงข้อมูลผู้ฝึกสอนโดยใช้ ID
  const trainer = await getTrainerById(id);

  // หากไม่พบข้อมูลผู้ฝึกสอน
  if (!trainer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ไม่พบข้อมูลผู้ฝึกสอน
          </h2>
          <p className="text-gray-600">ไม่พบข้อมูลผู้ฝึกสอนที่มี ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          สวัสดี, คุณ {trainer.firstName} ID : {trainer.id}
        </h1>
        <p className="text-muted-foreground">
          หน้าทดสอบการแสดงข้อมูลจาก Server Action
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2 flex justify-center mb-4">
              {trainer.profileImage ? (
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img
                    src={trainer.profileImage}
                    alt={`${trainer.firstName} ${trainer.lastName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 text-3xl font-bold">
                    {getInitials(trainer.firstName, trainer.lastName)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อผู้ใช้:
              </p>
              <p className="text-lg">{trainer.username}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อ-นามสกุล:
              </p>
              <p className="text-lg">
                {trainer.firstName} {trainer.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อเล่น:
              </p>
              <p className="text-lg">{trainer.nickname || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                อีเมล:
              </p>
              <p className="text-lg">{trainer.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                เบอร์โทรศัพท์:
              </p>
              <p className="text-lg">{trainer.phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">เพศ:</p>
              <p className="text-lg">{trainer.gender || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                วันเกิด:
              </p>
              <p className="text-lg">
                {trainer.dateOfBirth ? formatDate(trainer.dateOfBirth) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">อายุ:</p>
              <p className="text-lg">
                {trainer.dateOfBirth
                  ? `${calculateAge(trainer.dateOfBirth)} ปี`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ประสบการณ์:
              </p>
              <p className="text-lg">
                {trainer.experience ? `${trainer.experience} ปี` : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                สถานะ:
              </p>
              <p className="text-lg">
                <span
                  className={`inline-block px-2 py-1 rounded-md text-sm ${
                    trainer.status === "active"
                      ? "bg-green-100 text-green-800"
                      : trainer.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trainer.status || "-"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลวิชาชีพ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ความเชี่ยวชาญ:
                </p>
                <p className="text-lg">{trainer.specialization || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ใบรับรอง/วุฒิบัตร:
                </p>
                <p className="text-lg">{trainer.certification || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  วันที่เริ่มงาน:
                </p>
                <p className="text-lg">
                  {trainer.startDate ? formatDate(trainer.startDate) : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  วันที่สิ้นสุด:
                </p>
                <p className="text-lg">
                  {trainer.endDate ? formatDate(trainer.endDate) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ประวัติโดยย่อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose">
              {trainer.bio ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: trainer.bio.replace(/\n/g, "<br>"),
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  ไม่มีข้อมูลประวัติโดยย่อ
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 bg-indigo-50 p-4 rounded-md">
        <p className="text-indigo-800 text-center font-medium">
          ข้อมูลถูกดึงมาจาก Server Action getTrainerById เรียบร้อย
        </p>
      </div>
    </div>
  );
}

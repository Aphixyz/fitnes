import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getMemberById } from "@/actions/member/getMemberData";
import { formatDate, calculateAge, getInitials } from "@/utils/utils";
import { Button } from "@/components/ui/button";

export default async function MemberDashboard({ params }) {
  // ดึงข้อมูลสมาชิกโดยใช้ ID จาก params

  // const memberId = params.id;
  const { id } = await params;

  // const member = await getMemberById(memberId);
  const member = await getMemberById(id);

  // หากไม่พบข้อมูลสมาชิก
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ไม่พบข้อมูลสมาชิก
          </h2>
          <p className="text-gray-600">ไม่พบข้อมูลสมาชิกที่มี ID: {member}</p>
        </div>
      </div>
    );
  }
  console.log(member);

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
                    {member.firstName ? member.firstName.charAt(0) : ""}
                    {member.lastName ? member.lastName.charAt(0) : ""}
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
                  <p className="text-sm text-muted-foreground">
                    เบอร์โทรศัพท์:
                  </p>
                  <p className="font-medium">{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เพศ:</p>
                  <p className="font-medium">{member.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันเกิด:</p>
                  <p className="font-medium">
                    {formatDate(member.dateOfBirth)}
                  </p>
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

        {/* การ์ดข้อความต้อนรับ */}
        {/* <Card>
          <CardHeader>
            <CardTitle>แนะนำระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                ยินดีต้อนรับสู่ FitTrack -
                ระบบติดตามการออกกำลังกายและโภชนาการส่วนบุคคล
              </p>
              <p>
                คุณสามารถดูแผนการออกกำลังกาย บันทึกมื้ออาหาร ติดตามความก้าวหน้า
                และเข้าร่วมความท้าทายต่างๆ ได้ที่นี่
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    ></path>
                  </svg>
                  แผนออกกำลังกาย
                </button>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    ></path>
                  </svg>
                  โภชนาการ
                </button>
              </div>
            </div>
          </CardContent>
        </Card> */}

      {/* <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>เริ่มต้นใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                นี่คือขั้นตอนแรกในการเริ่มต้นใช้งานระบบ FitTrack ของเรา:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">อัพเดทข้อมูลสุขภาพของคุณ</p>
                    <p className="text-sm text-muted-foreground">
                      กรอกข้อมูลน้ำหนัก ส่วนสูง และเป้าหมายของคุณ
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">ตรวจสอบแผนการออกกำลังกาย</p>
                    <p className="text-sm text-muted-foreground">
                      ดูแผนการออกกำลังกายที่ผู้ฝึกสอนจัดเตรียมไว้ให้คุณ
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">ทำความเข้าใจแผนโภชนาการ</p>
                    <p className="text-sm text-muted-foreground">
                      ตรวจสอบแผนโภชนาการและเริ่มบันทึกมื้ออาหารประจำวัน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

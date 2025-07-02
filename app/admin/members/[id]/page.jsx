// app/admin/members/[id]/page.tsx

import { getMemberById } from "@/actions/admin/member/getMemberById";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, calculateAge, getInitials } from "@/utils/utils";



export default async function MemberPage({ params }) {
  const { id } = params;
  const member = await getMemberById(id);

  if (!member) {
    return <div className="text-center py-10">ไม่พบข้อมูลสมาชิก</div>;
  }

  return (
    <div>
      <h1 className="text-2xl mx-5 my-5 font-bold mb-4">
        ข้อมูลสมาชิกของ: {member.firstname} {member.lastname}
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="col-span-2 flex justify-center mb-4">
            {member.profileimage ? (
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={member.profileimage}
                  alt={`${member.firstname} ${member.lastname}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 text-3xl font-bold">
                  {getInitials(member.firstname, member.lastname)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ชื่อผู้ใช้:</p>
            <p className="text-lg">{member.username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">อีเมล:</p>
            <p className="text-lg">{member.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">เบอร์โทร:</p>
            <p className="text-lg">{member.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">เพศ:</p>
            <p className="text-lg">{member.gender}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">วันเกิด:</p>
            <p className="text-lg">
              {member.dob ? formatDate(member.dob) : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">อายุ:</p>
            <p className="text-lg">
              {member.dob ? `${calculateAge(member.dob)} ปี` : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ผู้ฝึกสอนที่ดูแล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.isArray(member.trainers) && member.trainers.length > 0 ? (
            member.trainers.map((t) => (
              <div key={t.id} className="border p-2 rounded">
                {t.firstname} {t.lastname}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">ยังไม่มีผู้ฝึกสอนที่ดูแล</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

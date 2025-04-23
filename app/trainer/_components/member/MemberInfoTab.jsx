"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, calculateAge } from "@/utils/utils";

/**
 * คอมโพเนนต์แสดงข้อมูลทั่วไปของสมาชิก
 * 
 * @param {Object} props
 * @param {Object} props.memberData - ข้อมูลสมาชิก
 */
export default function MemberInfoTab({ memberData }) {
  if (!memberData) return <MemberInfoSkeleton />;

  const age = calculateAge(memberData.member_dob);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="space-y-4">
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">ชื่อ-นามสกุล</dt>
                  <dd className="text-base">
                    {memberData.member_firstname} {memberData.member_lastname}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">อีเมล</dt>
                  <dd className="text-base">{memberData.member_email || "-"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">เบอร์โทรศัพท์</dt>
                  <dd className="text-base">{memberData.member_phone || "-"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">เพศ</dt>
                  <dd className="text-base">{memberData.member_gender || "-"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">วันเกิด</dt>
                  <dd className="text-base">
                    {memberData.member_dob
                      ? `${formatDate(memberData.member_dob)} (${age} ปี)`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-4">
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">วันที่ลงทะเบียน</dt>
                  <dd className="text-base">
                    {memberData.registration_startdate
                      ? formatDate(memberData.registration_startdate)
                      : "-"}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">วันหมดอายุ</dt>
                  <dd className="text-base">
                    {memberData.registration_enddate
                      ? formatDate(memberData.registration_enddate)
                      : "-"}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">สถานะสมาชิก</dt>
                  <dd className="text-base flex items-center mt-1">
                    <Badge
                      className={
                        memberData.is_expired 
                          ? "bg-red-500" 
                          : memberData.registration_status === 1
                            ? "bg-green-500"
                            : "bg-yellow-500"
                      }
                    >
                      {memberData.is_expired 
                        ? "หมดอายุ" 
                        : memberData.registration_status === 1 
                          ? "ใช้งาน" 
                          : "รอการยืนยัน"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>การเข้าร่วมกิจกรรม</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ยังไม่มีข้อมูลการเข้าร่วมกิจกรรม หรือรอการพัฒนาในเฟสต่อไป
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>บันทึกเพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ยังไม่มีบันทึกสำหรับสมาชิกท่านนี้
            </p>
            <Button className="mt-4" variant="outline" size="sm">
              เพิ่มบันทึก
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * คอมโพเนนต์ Skeleton แสดงขณะโหลดข้อมูล
 */
function MemberInfoSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
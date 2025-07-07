import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMemberData } from "@/actions/trainer/member/fetchMemberData";
import MembersDataTable from "@/app/trainer/[trainerId]/members/_components/MembersDataTable";
import ServerPagination from "@/app/trainer/[trainerId]/members/_components/ServerPagination";

export default async function TrainerMembersPage({ params, searchParams }) {
  // Extract params และ searchParams
  const { trainerId } = await params;
  const page = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = parseInt((await searchParams)?.pageSize || "10", 10);
  const sortBy = (await searchParams)?.sortBy || "member_firstname";
  const sortOrder = (await searchParams)?.sortOrder || "asc";
  const searchTerm = (await searchParams)?.search || "";

  // ดึงข้อมูลสมาชิกจาก server
  const result = await fetchMemberData({
    trainerId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchTerm,
  });

  // จัดการกรณีเกิดข้อผิดพลาด
  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            ลูกค้าของฉัน
          </h1>
          <p className="text-muted-foreground">
            รายชื่อลูกค้าทั้งหมดที่อยู่ภายใต้การดูแลของคุณ
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-2">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
              <p className="text-sm text-gray-500">{result.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">ลูกค้าของฉัน</h1>
        <p className="text-muted-foreground">
          จัดการลูกค้าที่อยู่ภายใต้การดูแลของ
        </p>
      </div>

      {/* Data Table */}
      <CardContent className="p-0 pt-4">
        <MembersDataTable initialData={data} trainerId={trainerId} />

        {/* Pagination Info */}
        {data.pagination.totalItems > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div>
                {(data.pagination.page - 1) * data.pagination.pageSize + 1} ถึง{" "}
                {Math.min(
                  data.pagination.page * data.pagination.pageSize,
                  data.pagination.totalItems
                )}{" "}
                จากทั้งหมด {data.pagination.totalItems} รายการ
              </div>
              {/* Server Pagination Component */}
              <ServerPagination
                pagination={data.pagination}
                trainerId={trainerId}
              />
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

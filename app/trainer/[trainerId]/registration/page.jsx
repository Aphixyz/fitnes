import { Card, CardContent } from "@/components/ui/card";
import { fetchRegistrationData } from "@/actions/trainer/registration/fetchRegistrationData";
import RegistrationDataTable from "./_components/RegistrationDataTable";
import ServerPagination from "./_components/ServerPagination";

export default async function TrainerRegistrationPage({
  params,
  searchParams,
}) {
  // Extract params และ searchParams
  const { trainerId } = await params;
  const page = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = parseInt((await searchParams)?.pageSize || "10", 10);
  const sortBy = (await searchParams)?.sortBy || "registration_id";
  const sortOrder = (await searchParams)?.sortOrder || "desc";
  const searchTerm = (await searchParams)?.search || "";
  const status = (await searchParams)?.status || "";

  // ดึงข้อมูลการลงทะเบียนจาก server
  const result = await fetchRegistrationData({
    trainerId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchTerm,
    status,
  });

  // จัดการกรณีเกิดข้อผิดพลาด
  if (!result.success) {
    return (
      <div className="space-y-6">
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
      {/* Data Table  */}
      <CardContent className="p-0 pt-4">
        <RegistrationDataTable initialData={data} trainerId={trainerId} />
      </CardContent>

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
    </div>
  );
}

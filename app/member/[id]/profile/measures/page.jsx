// SECTION: Server Component - ดึงข้อมูลสุขภาพสมาชิกและเตรียม prop สำหรับ client component
import { fetchAllHealthData } from "@/actions/member/metric/fetchAllHealthData";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription";
import ProgressPhotos from "./_components/progressPhotos";
import MeasuresProgress from "./_components/MeasuresProgress";

/**
 * Server Component สำหรับแสดงข้อมูลสุขภาพย้อนหลังของสมาชิก
 * - รับ memberId จาก dynamic route
 * - รับ period (3m, 6m, all) จาก searchParams (default: all)
 * - ดึงข้อมูลด้วย fetchAllHealthData
 * - เตรียม prop สำหรับ client component (UI/interactive แยก logic ภายหลัง)
 */
export default async function MeasuresPage({ params, searchParams }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // รับช่วงเวลา filter (default: all)
  const searchParamsData = await searchParams;
  const period = searchParamsData?.period || "all";
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionCheck.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">สิทธิ์การใช้งานถูกปิดไปแล้ว</p>
          </div>
        </div>
      </div>
    );
  }

  const healthData = await fetchAllHealthData(memberId, period);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ประวัติข้อมูลสุขภาพ</h1>
      <ProgressPhotos data={healthData} memberId={memberId} />
      <MeasuresProgress data={healthData} memberId={memberId} />
    </div>
  );
}

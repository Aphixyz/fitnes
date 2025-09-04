import { fetchHealthId } from "@/actions/member/metric/fetchHealthId";
import { isActiveSubscription } from "@/actions/member/isActiveSubscription";
import EditHealthForm from "./_components/EditHealthForm";
import EditHealthPageClient from "./_components/EditHealthPageClient";

/**
 * Server Component สำหรับหน้าแก้ไขข้อมูลสุขภาพ
 * - รับ memberId และ healthId จาก dynamic route
 * - ดึงข้อมูลสุขภาพด้วย loadDailyHealthRecord
 * - ตรวจสอบสิทธิ์การใช้งาน
 * - ส่งข้อมูลให้ Client Component
 */
export default async function EditHealthPage({ params }) {
  const { id, healthId } = await params;
  const memberId = parseInt(id);
  const healthRecordId = parseInt(healthId);

  // ตรวจสอบสิทธิ์การใช้งาน
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">สิทธิ์การใช้งานถูกปิดไปแล้ว</p>
          </div>
        </div>
      </div>
    );
  }

  // ดึงข้อมูลสุขภาพจาก healthId
  let healthData = null;
  try {
    healthData = await fetchHealthId(memberId, healthRecordId);
  } catch (error) {
    console.error("Error loading health data:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              ไม่สามารถโหลดข้อมูลสุขภาพได้: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">ไม่พบข้อมูลสุขภาพที่ต้องการแก้ไข</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditHealthPageClient
      memberId={memberId}
      healthData={healthData}
      healthRecordId={healthRecordId}
    />
  );
}

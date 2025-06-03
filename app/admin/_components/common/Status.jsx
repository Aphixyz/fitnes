export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
        status === "active"
          ? "text-green-600 border-green-600"
          : status === "expired"
          ? "text-red-600 border-red-600"
          : status === "paid"
          ? "text-blue-600 border-blue-600" // หรือใช้ "text-yellow-600 border-yellow-600" ถ้าต้องการ
          : "text-yellow-600 border-yellow-600" // Default สำหรับ 'pending'
      }`}
    >
      {status === "active"
        ? "ใช้งาน"
        : status === "expired"
        ? "หมดอายุ"
        : status === "paid"
        ? "ชำระเงินแล้ว"
        : "ยังไม่จ่าย"}
    </span>
  );
}
export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
        status === "active"
          ? "text-white bg-green-500"
          : status === "expired"
          ? "text-white bg-red-500"
          : status === "paid"
          ? "text-white bg-blue-500" // หรือใช้ "text-yellow-500 bg-yellow-500" ถ้าต้องการ
          : "text-white bg-yellow-500" 
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
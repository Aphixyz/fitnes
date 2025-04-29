// File: /app/admin/finance/page.jsx

// ใช้ข้อมูล mock แทนการเรียกจาก DB จริง
const mockSummary = {
  totalRevenue: 25000,
  totalFee: 3750,
  totalNet: 21250
}

const mockPayments = [
  {
    id: 1,
    date: '2025-04-28',
    member: 'สมชาย ใจดี',
    trainer: 'โค้ชต้น',
    amount: 2000,
    fee: 300,
    net: 1700,
    status: 'Paid'
  },
  {
    id: 2,
    date: '2025-04-27',
    member: 'สายฟ้า เร็วแรง',
    trainer: 'โค้ชแชมป์',
    amount: 3000,
    fee: 450,
    net: 2550,
    status: 'Paid'
  },
  {
    id: 3,
    date: '2025-04-26',
    member: 'น้ำหนึ่ง สดใส',
    trainer: 'โค้ชต้น',
    amount: 1000,
    fee: 150,
    net: 850,
    status: 'Pending'
  }
]

const mockTrainerEarnings = [
  {
    id: 1,
    name: 'โค้ชต้น',
    memberCount: 10,
    monthEarnings: 5400,
    totalEarnings: 15400,
    paid: 14000,
    unpaid: 1400
  },
  {
    id: 2,
    name: 'โค้ชแชมป์',
    memberCount: 8,
    monthEarnings: 3000,
    totalEarnings: 9300,
    paid: 8000,
    unpaid: 1300
  }
]

export default async function AdminFinancePage() {
  // mock แทน fetch จริง
  const summary = mockSummary
  const payments = mockPayments
  const trainers = mockTrainerEarnings

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">แดชบอร์ดการเงิน (Admin)</h1>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="รายรับรวมจากสมาชิก" value={`฿${summary.totalRevenue}`} />
        <Card title="ค่าธรรมเนียมระบบ" value={`฿${summary.totalFee}`} />
        <Card title="จ่ายให้เทรนเนอร์" value={`฿${summary.totalNet}`} />
      </div>

      {/* Payment Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">รายการชำระเงินล่าสุด</h2>
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">วันที่</th>
                <th className="border p-2">Member</th>
                <th className="border p-2">Trainer</th>
                <th className="border p-2">จำนวน</th>
                <th className="border p-2">ค่าธรรมเนียม</th>
                <th className="border p-2">สุทธิ</th>
                <th className="border p-2">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.date}</td>
                  <td className="border p-2">{p.member}</td>
                  <td className="border p-2">{p.trainer}</td>
                  <td className="border p-2">฿{p.amount}</td>
                  <td className="border p-2">฿{p.fee}</td>
                  <td className="border p-2">฿{p.net}</td>
                  <td className="border p-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainer Earnings */}
      <div>
        <h2 className="text-xl font-semibold mb-2">รายได้เทรนเนอร์</h2>
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">เทรนเนอร์</th>
                <th className="border p-2">สมาชิก</th>
                <th className="border p-2">เดือนนี้</th>
                <th className="border p-2">รวม</th>
                <th className="border p-2">จ่ายแล้ว</th>
                <th className="border p-2">ค้างจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t.id}>
                  <td className="border p-2">{t.name}</td>
                  <td className="border p-2">{t.memberCount}</td>
                  <td className="border p-2">฿{t.monthEarnings}</td>
                  <td className="border p-2">฿{t.totalEarnings}</td>
                  <td className="border p-2">฿{t.paid}</td>
                  <td className="border p-2 text-red-600">฿{t.unpaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  )
}
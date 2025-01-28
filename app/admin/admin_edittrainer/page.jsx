"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function TrainerEditPage() {
  const searchParams = useSearchParams();
  const [trainer, setTrainer] = useState(null);

  // รับข้อมูลที่ส่งมาจาก query
  useEffect(() => {
    const trainerData = searchParams.get("trainerData");
    if (trainerData) {
      setTrainer(JSON.parse(decodeURIComponent(trainerData))); // ถอดรหัสข้อมูล
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrainer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving trainer:", trainer);
    // เพิ่ม logic สำหรับบันทึก
  };

  if (!trainer) {
    return <p>Loading trainer data...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Edit Trainer</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium">Trainer ID:</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            value={trainer.trainer_id}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Name:</label>
          <input
            type="text"
            className="border rounded w-full px-2 py-1"
            name="trainer_name"
            value={trainer.trainer_name}
            onChange={handleChange}
          />
        </div>
        {/* เพิ่มฟิลด์อื่นๆ ตามต้องการ */}
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default TrainerEditPage;

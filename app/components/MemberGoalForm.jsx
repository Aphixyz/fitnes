import { useState } from "react";
import Swal from "sweetalert2";

export default function MemberGoalForm({ memberId }) {
  const [goalType, setGoalType] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/member/${memberId}/goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitness_goal_type: goalType,
          fitness_goal_description: description,
          fitness_goal_startdate: startDate,
          fitness_goal_enddate: endDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit goal");
      Swal.fire("✅ สำเร็จ", "เพิ่มเป้าหมายใหม่เรียบร้อย!", "success");
    } catch (error) {
      Swal.fire("❌ ล้มเหลว", "ไม่สามารถเพิ่มเป้าหมายได้", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mt-6 text-black">
      <h2 className="text-xl font-semibold">➕ เพิ่มเป้าหมายใหม่</h2>
      <input
        type="text"
        placeholder="ประเภทเป้าหมาย"
        value={goalType}
        onChange={(e) => setGoalType(e.target.value)}
        className="w-full p-2 border rounded-lg mt-2"
        required
      />
      <textarea
        placeholder="คำอธิบาย"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded-lg mt-2"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 border rounded-lg mt-2"
        required
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 border rounded-lg mt-2"
      />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4">
        บันทึกเป้าหมาย
      </button>
    </form>
  );
}
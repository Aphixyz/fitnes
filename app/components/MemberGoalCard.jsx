"use client";

import { useEffect, useState } from "react";

export default function MemberGoalCard({ memberId }) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // console.log("Debug: memberId =", memberId);

    if (!memberId) {
      setError("Member ID is missing");
      setLoading(false);
      return;
    }

    async function fetchGoal() {
      try {
        setLoading(true);
        // Directly use memberId in the API URL
        const res = await fetch(`/api/member/${memberId}/goal`);

        if (!res.ok) {
          throw new Error("No goals found");
        }

        const data = await res.json();

        if (!data.goals || data.goals.length === 0) {
          throw new Error("No goals found");
        }

        setGoal(data.goals[0]); // Get the latest goal
      } catch (err) {
        console.error("Error fetching goal:", err);
        setError(err.message);
        setGoal(null);
      } finally {
        setLoading(false);
      }
    }

    fetchGoal();
  }, [memberId]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg text-black">
      <h2 className="text-xl font-semibold mb-3">🎯 เป้าหมายล่าสุด</h2>

      {loading && <p className="text-gray-500">กำลังโหลดข้อมูล...</p>}
      {error && !loading && <p className="text-red-500">{error}</p>}

      {goal && !error ? (
        <>
          <p><strong>ประเภท:</strong> {goal?.fitness_goal_type}</p>
          <p><strong>รายละเอียด:</strong> {goal?.fitness_goal_description}</p>
          <p><strong>เริ่ม:</strong> {goal?.fitness_goal_startdate}</p>
          <p><strong>สิ้นสุด:</strong> {goal?.fitness_goal_enddate || "ไม่ระบุ"}</p>
        </>
      ) : (
        !loading && !error && <p className="text-gray-500">ยังไม่มีเป้าหมาย</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function MemberGoalCard({ memberId }) {
  const [goal, setGoal] = useState(null);

  useEffect(() => {
    async function fetchGoal() {
      try {
        const res = await fetch(`/api/member/${memberId}/goal`);
        if (!res.ok) throw new Error("No goals found");
        const data = await res.json();
        setGoal(data.goals[0]); // Get latest goal
      } catch (error) {
        console.error("Error fetching goal:", error);
      }
    }
    fetchGoal();
  }, [memberId]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-3">🎯 เป้าหมายล่าสุด</h2>
      {goal ? (
        <>
          <p><strong>ประเภท:</strong> {goal.fitness_goal_type}</p>
          <p><strong>รายละเอียด:</strong> {goal.fitness_goal_description}</p>
          <p><strong>เริ่ม:</strong> {goal.fitness_goal_startdate}</p>
          <p><strong>สิ้นสุด:</strong> {goal.fitness_goal_enddate || "ไม่ระบุ"}</p>
        </>
      ) : (
        <p className="text-gray-500">ยังไม่มีเป้าหมาย</p>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MemberGoalForm from "../../../components/MemberGoalForm";
import MemberGoalList from "../../../components/MemberGoalList";
import MemberGoalCard from "../../../components/MemberGoalCard";

export default function MemberGoalPage() {
  const { id } = useParams();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch(`/api/member/${id}/goal`);
        if (!res.ok) throw new Error("Failed to fetch goals");
        const data = await res.json();
        setGoals(data.goals || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, [id]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">เป้าหมายการออกกำลังกาย</h1>

      {/* Show Latest Goal */}
      <MemberGoalCard latestGoal={goals[0]} />

      {/* Goal List */}
      <MemberGoalList goals={goals} />

      {/* Add New Goal */}
      <MemberGoalForm memberId={id} />
    </div>
  );
}
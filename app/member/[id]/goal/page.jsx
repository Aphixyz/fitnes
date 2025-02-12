"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MemberGoalForm from "../../../components/MemberGoalForm";
import MemberGoalList from "../../../components/MemberGoalList";
import MemberGoalCard from "../../../components/MemberGoalCard";

export default function MemberGoalPage() {
  const { id } = useParams();
  console.log("Debug: id =", id);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      if (!id) {
        console.warn("Warning: Member ID is undefined");
        setGoals([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/member/${id}/goal`);

        if (!res.ok) {
          console.warn("No goals found or API request failed.");
          setGoals([]);
          return;
        }

        const data = await res.json();

        if (!data.goals || data.goals.length === 0) {
          console.log("No goals found for this member.");
          setGoals([]);
        } else {
          setGoals(data.goals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error.message);
        setGoals([]); 
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, [id]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">
        เป้าหมายการออกกำลังกาย
      </h1>

      {/* Show Latest Goal if Available */}
      {loading ? (
        <p className="text-center text-gray-600">กำลังโหลดข้อมูล...</p>
      ) : goals.length > 0 ? (
        <>
          <MemberGoalCard latestGoal={goals[0]} memberId={id} />
          <MemberGoalList goals={goals} memberId={id} />
        </>
      ) : (
        <p className="text-center text-gray-500 mb-4">
          ยังไม่มีเป้าหมาย กรุณาเพิ่มเป้าหมายใหม่
        </p>
      )}

      {/* Always Show Add New Goal Form */}
      <MemberGoalForm memberId={id} />
    </div>
  );
}
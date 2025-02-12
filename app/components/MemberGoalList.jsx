import { useState } from "react";
import Swal from "sweetalert2";

export default function MemberGoalList({ goals, memberId, refreshGoals }) {
  if (!goals || goals.length === 0)
    return <p className="text-center text-red-500">ไม่มีประวัติเป้าหมาย</p>;

  // ✅ ฟังก์ชันแก้ไขเป้าหมาย
  const handleEdit = async (goal) => {
    const { value: updatedGoal } = await Swal.fire({
      title: "แก้ไขเป้าหมาย",
      html: `
        <input id="goalType" class="swal2-input" placeholder="ประเภทเป้าหมาย" value="${goal.fitness_goal_type || ""}">
        <input id="goalDesc" class="swal2-input" placeholder="คำอธิบาย" value="${goal.fitness_goal_description || ""}">
        <input id="goalStart" type="date" class="swal2-input" value="${
          goal.fitness_goal_startdate ? goal.fitness_goal_startdate.split("T")[0] : ""
        }">
        <input id="goalEnd" type="date" class="swal2-input" value="${
          goal.fitness_goal_enddate ? goal.fitness_goal_enddate.split("T")[0] : ""
        }">
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      preConfirm: () => {
        return {
          fitness_goal_type: document.getElementById("goalType").value.trim(),
          fitness_goal_description: document.getElementById("goalDesc").value.trim(),
          fitness_goal_startdate: document.getElementById("goalStart").value,
          fitness_goal_enddate: document.getElementById("goalEnd").value || null,
        };
      },
    });

    if (updatedGoal) {
      try {
        const res = await fetch(`/api/member/${memberId}/goal/${goal.fitness_goal_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedGoal),
        });

        if (!res.ok) throw new Error("Failed to update goal");

        Swal.fire("✅ สำเร็จ!", "แก้ไขเป้าหมายเรียบร้อย", "success");
        
        if (typeof refreshGoals === "function") {
          refreshGoals(); // ตรวจสอบก่อนเรียก
        } else {
          console.warn("refreshGoals is not a function");
        }

      } catch (error) {
        console.error("Update error:", error);
        Swal.fire("❌ ล้มเหลว!", "ไม่สามารถแก้ไขเป้าหมายได้", "error");
      }
    }
  };

  // ✅ ฟังก์ชันลบเป้าหมาย
  const handleDelete = async (goalId) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "เป้าหมายนี้จะถูกลบถาวร",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/member/${memberId}/goal/${goalId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete goal");

        Swal.fire("✅ ลบสำเร็จ!", "เป้าหมายถูกลบแล้ว", "success");

        if (typeof refreshGoals === "function") {
          refreshGoals();
        } else {
          console.warn("refreshGoals is not a function");
        }

      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("❌ ล้มเหลว!", "ไม่สามารถลบเป้าหมายได้", "error");
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4 text-black">
      <h2 className="text-xl font-semibold">📜 เป้าหมายที่ผ่านมา</h2>
      <ul>
        {goals.map((goal) => (
          <li key={goal.fitness_goal_id} className="border-b py-2 flex justify-between items-center">
            <p>
              <strong>{goal.fitness_goal_type}</strong> - {goal.fitness_goal_startdate.split("T")[0]}
            </p>
            <div>
              <button onClick={() => handleEdit(goal)} className="text-blue-500 mr-4">
                แก้ไข
              </button>
              <button onClick={() => handleDelete(goal.fitness_goal_id)} className="text-red-500">
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
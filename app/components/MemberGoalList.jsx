export default function MemberGoalList({ goals }) {
    if (goals.length === 0) return <p className="text-center">ไม่มีประวัติเป้าหมาย</p>;
  
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4 text-black">
        <h2 className="text-xl font-semibold">📜 เป้าหมายที่ผ่านมา</h2>
        <ul>
          {goals.map((goal) => (
            <li key={goal.fitness_goal_id} className="border-b py-2">
              <p><strong>{goal.fitness_goal_type}</strong> - {goal.fitness_goal_startdate}</p>
              <button className="text-blue-500">แก้ไข</button>
              <button className="text-red-500 ml-4">ลบ</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
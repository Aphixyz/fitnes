import React, { useEffect, useState } from "react";

const MemberDetailModal = ({ member, onClose }) => {
  const [healthData, setHealthData] = useState(null);
  const [latestGoal, setLatestGoal] = useState(null); // ✅ Add State for latest fitness goal

  useEffect(() => {
    if (member?.member_id) {
      // ✅ Fetch Health Data
      fetch(`/api/member/${member.member_id}/health`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.data) {
            setHealthData(data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching health data:", error);
        });

      // ✅ Fetch Latest Fitness Goal
      fetch(`/api/member/${member.member_id}/goal`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.goals && data.goals.length > 0) {
            setLatestGoal(data.goals[0]); // 🏆 Set Latest Goal
          }
        })
        .catch((error) => {
          console.error("Error fetching fitness goal:", error);
        });
    }
  }, [member]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">รายละเอียดลูกค้า</h2>
        <p><strong>รหัส:</strong> {member.member_id}</p>
        <p><strong>ชื่อ-นามสกุล:</strong> {member.firstname} {member.lastname}</p>
        <p><strong>อีเมล:</strong> {member.email}</p>
        <p><strong>เบอร์โทร:</strong> {member.phone}</p>
        <p><strong>สถานะ:</strong> {member.status === 1 ? "ยืนยันแล้ว" : "รอการยืนยัน"}</p>

        {/* 🏥 Health Information */}
        <h3 className="text-lg font-semibold mt-4">ข้อมูลสุขภาพล่าสุด</h3>
        {healthData ? (
          <div>
            <p><strong>วันที่บันทึก:</strong> {new Date(healthData.member_health_record_date).toLocaleDateString()}</p>
            <p><strong>น้ำหนัก:</strong> {healthData.member_health_weight} kg</p>
            <p><strong>ส่วนสูง:</strong> {healthData.member_health_height} cm</p>
            <p><strong>BMI:</strong> {healthData.member_health_bmi}</p>
            <p><strong>เงื่อนไขทางการแพทย์:</strong> {healthData.member_health_medical_condition}</p>
            <p><strong>การบาดเจ็บ:</strong> {healthData.member_health_injury}</p>
          </div>
        ) : (
          <p className="text-gray-500">ไม่มีข้อมูลสุขภาพ</p>
        )}

        {/* 🎯 Fitness Goal Information */}
        <h3 className="text-lg font-semibold mt-4">🎯 เป้าหมายการออกกำลังกาย</h3>
        {latestGoal ? (
          <div className="bg-gray-100 p-3 rounded-lg shadow">
            <p><strong>ประเภท:</strong> {latestGoal.fitness_goal_type}</p>
            <p><strong>คำอธิบาย:</strong> {latestGoal.fitness_goal_description}</p>
            <p><strong>วันที่เริ่มต้น:</strong> {new Date(latestGoal.fitness_goal_startdate).toLocaleDateString()}</p>
            <p><strong>วันที่สิ้นสุด:</strong> {latestGoal.fitness_goal_enddate ? new Date(latestGoal.fitness_goal_enddate).toLocaleDateString() : "ไม่ระบุ"}</p>
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีเป้าหมาย</p>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
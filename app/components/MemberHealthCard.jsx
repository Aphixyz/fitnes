"use client";

import { useEffect, useState } from "react";

export default function MemberHealthCard({ memberId }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`/api/member/${memberId}/health`);
        if (!res.ok) throw new Error("No health data found");
        const data = await res.json();
        setHealth(data.healthRecords[0]); // Get latest record
      } catch (error) {
        console.error("Error fetching health data:", error);
      }
    }
    fetchHealth();
  }, [memberId]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-3">📊 ข้อมูลสุขภาพล่าสุด</h2>
      {health ? (
        <>
          <p><strong>น้ำหนัก:</strong> {health.member_health_weight} กก.</p>
          <p><strong>ส่วนสูง:</strong> {health.member_health_height} ซม.</p>
          <p><strong>BMI:</strong> {health.member_health_bmi}</p>
          <p><strong>วันที่บันทึก:</strong> {health.member_health_record_date}</p>
        </>
      ) : (
        <p className="text-gray-500">ยังไม่มีข้อมูลสุขภาพ</p>
      )}
    </div>
  );
}
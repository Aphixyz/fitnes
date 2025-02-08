"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function MemberHealth() {
  const { id } = useParams(); // รับ `member_id` จาก URL
  const [healthRecords, setHealthRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    member_health_weight: "",
    member_health_height: "",
    member_health_bmi: "",
    member_health_medical_condition: "",
    member_health_injury: "",
  });

  // ✅ ดึงข้อมูล Health Data ถ้ามี
  useEffect(() => {
    async function fetchHealthData() {
      try {
        const res = await fetch(`/api/member/${id}/health`);
        const data = await res.json();

        if (!res.ok) {
          console.warn("No health records found or error:", data.error);
          setHealthRecords(null); // ไม่มีข้อมูล
        } else {
          setHealthRecords(data.healthRecords);
        }
      } catch (error) {
        console.error("Failed to fetch health data:", error);
        setHealthRecords(null);
      } finally {
        setLoading(false);
      }
    }
    fetchHealthData();
  }, [id]);

  // ✅ จัดการค่าที่ผู้ใช้กรอก
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ คำนวณ BMI อัตโนมัติ
  useEffect(() => {
    if (formData.member_health_weight && formData.member_health_height) {
      const heightM = formData.member_health_height / 100;
      const bmi = (formData.member_health_weight / (heightM * heightM)).toFixed(2);
      setFormData((prev) => ({ ...prev, member_health_bmi: bmi }));
    }
  }, [formData.member_health_weight, formData.member_health_height]);

  // ✅ ส่งข้อมูลสุขภาพ
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/member/${id}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save health data");

      Swal.fire("✅ Success!", "Health data saved successfully", "success");
      setHealthRecords((prev) => [...(prev || []), formData]); // อัปเดต UI
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Health {id} Information</h1>

      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-2xl">
        {/* ✅ แสดงข้อมูลสุขภาพถ้ามี */}

        {/* ✅ แบบฟอร์มกรอกข้อมูลสุขภาพ */}
        <h2 className="text-xl font-semibold mt-6 mb-4">Enter Health Data</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              name="member_health_weight"
              value={formData.member_health_weight}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Height (cm)</label>
            <input
              type="number"
              name="member_health_height"
              value={formData.member_health_height}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">BMI</label>
            <input
              type="text"
              name="member_health_bmi"
              value={formData.member_health_bmi}
              readOnly
              className="w-full border p-2 rounded bg-gray-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Medical Condition</label>
            <input
              type="text"
              name="member_health_medical_condition"
              value={formData.member_health_medical_condition}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Injury</label>
            <input
              type="text"
              name="member_health_injury"
              value={formData.member_health_injury}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="col-span-2 mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Save Health Data
          </button>
        </form>

        {healthRecords ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Health Records</h2>
            <ul className="list-disc ml-6">
              {healthRecords.map((record, index) => (
                <li key={index} className="mb-2">
                  <strong>Date:</strong> {record.member_health_record_date} <br />
                  <strong>Weight:</strong> {record.member_health_weight} kg <br />
                  <strong>Height:</strong> {record.member_health_height} cm <br />
                  <strong>BMI:</strong> {record.member_health_bmi} <br />
                  <strong>Medical Condition:</strong> {record.member_health_medical_condition || "None"} <br />
                  <strong>Injury:</strong> {record.member_health_injury || "None"}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500">ยังไม่มีข้อมูลสุขภาพ กรุณาเพิ่มข้อมูล</p>
        )}
        
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function MemberHealth() {
  const { id } = useParams();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    member_health_weight: "",
    member_health_height: "",
    member_health_bmi: "",
    member_health_medical_condition: "",
    member_health_injury: "",
  });

  // ✅ Fetch Health Data
  const fetchHealthData = async () => {
    try {
      console.log("Fetching health data for ID:", id);
      const res = await fetch(`/api/member/${id}/health`);
      const data = await res.json();

      if (!res.ok || !data.healthRecords || data.healthRecords.length === 0) {
        console.warn("⚠️ No health records found");
        setHealthRecords([]);
      } else {
        setHealthRecords(data.healthRecords);
        console.log("✅ Fetched Health Records:", data.healthRecords);
      }
    } catch (error) {
      console.error("❌ Failed to fetch health data:", error);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHealthData();
  }, [id]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Calculate BMI
  useEffect(() => {
    if (formData.member_health_weight && formData.member_health_height) {
      const heightM = formData.member_health_height / 100;
      const bmi = (formData.member_health_weight / (heightM * heightM)).toFixed(2);
      setFormData((prev) => ({ ...prev, member_health_bmi: bmi }));
    }
  }, [formData.member_health_weight, formData.member_health_height]);

  // ✅ Submit Health Data
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

      // Refresh health records after adding new data
      fetchHealthData();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Health Information</h1>

      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-2xl">
        {/* ✅ Show Latest Health Record */}
        {healthRecords.length > 0 ? (
          <div className="bg-green-100 p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-lg font-semibold">📌 ข้อมูลสุขภาพล่าสุด</h2>
            <p><strong>วันที่บันทึก:</strong> {new Date(healthRecords[0].member_health_record_date).toLocaleDateString()}</p>
            <p><strong>น้ำหนัก:</strong> {healthRecords[0].member_health_weight} kg</p>
            <p><strong>ส่วนสูง:</strong> {healthRecords[0].member_health_height} cm</p>
            <p><strong>BMI:</strong> {healthRecords[0].member_health_bmi}</p>
            <p><strong>เงื่อนไขทางการแพทย์:</strong> {healthRecords[0].member_health_medical_condition || "None"}</p>
            <p><strong>การบาดเจ็บ:</strong> {healthRecords[0].member_health_injury || "None"}</p>
          </div>
        ) : (
          <p className="text-center text-gray-500">ยังไม่มีข้อมูลสุขภาพ กรุณาเพิ่มข้อมูล</p>
        )}

        {/* ✅ Health Information Form */}
        <h2 className="text-xl font-semibold mt-6 mb-4">➕ เพิ่มข้อมูลสุขภาพ</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">น้ำหนัก (kg)</label>
            <input
              type="number"
              name="member_health_weight"
              value={formData.member_health_weight}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">ส่วนสูง (cm)</label>
            <input
              type="number"
              name="member_health_height"
              value={formData.member_health_height}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              min="0"
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
            <label className="block text-sm font-medium">เงื่อนไขทางการแพทย์</label>
            <input
              type="text"
              name="member_health_medical_condition"
              value={formData.member_health_medical_condition}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">การบาดเจ็บ</label>
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
            บันทึกข้อมูลสุขภาพ
          </button>
        </form>

        {/* ✅ Show Health History */}
        {healthRecords.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">📜 ประวัติข้อมูลสุขภาพ</h2>
            <ul className="list-disc ml-6">
              {healthRecords.map((record, index) => (
                <li key={index} className="mb-2">
                  <strong>วันที่:</strong> {new Date(record.member_health_record_date).toLocaleDateString()} <br />
                  <strong>น้ำหนัก:</strong> {record.member_health_weight} kg <br />
                  <strong>ส่วนสูง:</strong> {record.member_health_height} cm <br />
                  <strong>BMI:</strong> {record.member_health_bmi} <br />
                  <strong>เงื่อนไขทางการแพทย์:</strong> {record.member_health_medical_condition || "None"} <br />
                  <strong>การบาดเจ็บ:</strong> {record.member_health_injury || "None"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
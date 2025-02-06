"use client";

import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";

// Trainer Form Modal Component
const TrainerFormModal = ({ isOpen, onClose, refreshTrainers }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    trainer_username: "",
      trainer_password: "",
      trainer_firstname: "",
      trainer_lastname: "",
      trainer_nickname: "",
      trainer_email: "",
      trainer_phone: "",
      trainer_dob: "",
      trainer_gender: "male",
      trainer_exp: 0,
      trainer_startdate: today,
      trainer_enddate: formattedEndDate
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");

      Swal.fire("สำเร็จ!", "เพิ่มผู้ฝึกสอนเรียบร้อยแล้ว", "success");
      refreshTrainers();
      onClose();
    } catch (error) {
      Swal.fire("ผิดพลาด!", error.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">
          {editData ? "Edit Trainer" : "Add Trainer"}
        </h1>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            name="trainer_username"
            placeholder="Username"
            value={formData.trainer_username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            name="trainer_password"
            placeholder="Password"
            value={formData.trainer_password}
            onChange={handleChange}
            required={!editData}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="trainer_firstname"
            placeholder="First Name"
            value={formData.trainer_firstname}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="trainer_lastname"
            placeholder="Last Name"
            value={formData.trainer_lastname}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="email"
            name="trainer_email"
            placeholder="Email"
            value={formData.trainer_email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="tel"
            name="trainer_phone"
            placeholder="Phone"
            value={formData.trainer_phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          {/* <input
            type="date"
            name="trainer_dob"
            value={formData.trainer_dob}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          /> */}
          <select
            name="trainer_gender"
            value={formData.trainer_gender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="number"
            name="trainer_exp"
            placeholder="Experience (Years)"
            value={formData.trainer_exp}
            onChange={handleChange}
            required
            min="0"
            className="w-full p-2 border rounded-lg"
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              {editData ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
      {showSuccessModal && (
        <SuccessModal
          message={`✅ ${editData ? 'แก้ไข' : 'เพิ่ม'} Trainer สำเร็จ!`}
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

// Main Page Component
function Page() {
  const [trainers, setTrainers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrainers = async () => {
    try {
      const response = await fetch("/api/trainer");
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      const data = await response.json();
      setTrainers(data.trainers);
    } catch (error) {
      Swal.fire("ผิดพลาด!", error.message, "error");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          เพิ่มผู้ฝึกสอน
        </button>
      </div>
      {isModalOpen && (
        <TrainerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshTrainers={fetchTrainers}
        />
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">รายชื่อผู้ฝึกสอน</h1>
      <table className="min-w-full border border-gray-300 bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2 text-center">รหัส</th>
            <th className="border px-4 py-2 text-center">ชื่อ-นามสกุล</th>
            <th className="border px-4 py-2 text-center">อีเมล</th>
            <th className="border px-4 py-2 text-center">เบอร์โทร</th>
            <th className="border px-4 py-2 text-center">ประสบการณ์ (ปี)</th>
          </tr>
        </thead>
        <tbody>
          {trainers.length > 0 ? (
            trainers.map((trainer) => (
              <tr key={trainer.trainer_id} className="border-b">
                <td className="border px-4 py-2">{trainer.trainer_id}</td>
                <td className="border px-4 py-2">
                  {trainer.trainer_firstname} {trainer.trainer_lastname}
                </td>
                <td className="border px-4 py-2">{trainer.trainer_email}</td>
                <td className="border px-4 py-2">{trainer.trainer_phone}</td>
                <td className="border px-4 py-2">{trainer.trainer_exp} ปี</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Page;





"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Trainer Form Modal Component
// const TrainerFormModal = ({ isOpen, onClose, refreshTrainers }) => {
//   if (!isOpen) return null;

//   const today = new Date().toISOString().split("T")[0];
//   const formattedEndDate = new Date(
//     new Date().setDate(new Date().getDate() + 30)
//   )
//     .toISOString()
//     .split("T")[0]; // วันที่สิ้นสุด 30 วันหลังจากวันนี้

//   const [formData, setFormData] = useState({
//     trainer_username: "",
//     trainer_password: "",
//     trainer_firstname: "",
//     trainer_lastname: "",
//     trainer_nickname: "",
//     trainer_email: "",
//     trainer_phone: "",
//     trainer_dob: "",
//     trainer_gender: "male",
//     trainer_exp: 0,
//     trainer_startdate: today,
//     trainer_enddate: formattedEndDate,
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("/api/trainer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");

//       Swal.fire("สำเร็จ!", "เพิ่มผู้ฝึกสอนเรียบร้อยแล้ว", "success");
//       refreshTrainers();
//       onClose();
//     } catch (error) {
//       Swal.fire("ผิดพลาด!", error.message, "error");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
//       <div className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg">
//         <h1 className="text-2xl font-bold mb-4">เพิ่มผู้ฝึกสอน</h1>
//         <form onSubmit={handleSubmit} className="grid gap-4">
//           <input
//             type="text"
//             name="trainer_username"
//             placeholder="ชื่อผู้ใช้"
//             value={formData.trainer_username}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="password"
//             name="trainer_password"
//             placeholder="รหัสผ่าน"
//             value={formData.trainer_password}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="text"
//             name="trainer_firstname"
//             placeholder="ชื่อ"
//             value={formData.trainer_firstname}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="text"
//             name="trainer_lastname"
//             placeholder="นามสกุล"
//             value={formData.trainer_lastname}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="text"
//             name="trainer_nickname"
//             placeholder="ชื่อเล่น"
//             value={formData.trainer_nickame}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="email"
//             name="trainer_email"
//             placeholder="อีเมลล์"
//             value={formData.trainer_email}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="tel"
//             name="trainer_phone"
//             placeholder="เบอร์โทรศัพท์"
//             value={formData.trainer_phone}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="date"
//             name="trainer_dob"
//             placeholder="วันเกิด"
//             value={formData.trainer_dob}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           />
//           <select
//             name="trainer_gender"
//             value={formData.trainer_gender}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded-lg"
//           >
//             <option value="male">ผู้ชาย</option>
//             <option value="female">ผู้หญิง</option>
//           </select>
//           <input
//             type="number"
//             name="trainer_exp"
//             placeholder="ประสบการณ์(ปี)"
//             value={formData.trainer_exp}
//             onChange={handleChange}
//             required
//             min="0"
//             className="w-full p-2 border rounded-lg"
//           />
//           <div className="flex justify-end mt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
//             >
//               ยกเลิก
//             </button>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
//             >
//               ยืนยัน
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// Main Page Component
function Page() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrainers = async () => {
    try {
      const response = await fetch("/api/trainer");
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      const data = await response.json();
      setTrainers(data.trainers);
      setFilteredTrainers(data.trainers); // Set filtered list initially
    } catch (error) {
      Swal.fire("ผิดพลาด!", error.message, "error");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredTrainers(trainers); // Show all if query is empty
    } else {
      setFilteredTrainers(
        trainers.filter(
          (trainer) =>
            trainer.trainer_firstname.toLowerCase().includes(query) ||
            trainer.trainer_lastname.toLowerCase().includes(query) ||
            trainer.trainer_email.toLowerCase().includes(query)
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      {/* <div className="flex justify-end mb-4">
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
      )} */}

      {/* Search Bar (Right, below the button) */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="ค้นหาผู้ฝึกสอน (ชื่อ-สกุล หรือ อีเมลล์)"
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/4 p-2 border rounded-lg"
        />
      </div>

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
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer) => (
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

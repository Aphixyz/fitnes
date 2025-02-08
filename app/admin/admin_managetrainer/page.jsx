"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Modal สำหรับยืนยันการลบเทรนเนอร์
const ConfirmDeleteModal = ({ trainer, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <p className="text-xl font-bold text-gray-800">
          คุณแน่ใจหรือไม่ที่จะลบเทรนเนอร์ {trainer.trainer_firstname}{" "}
          {trainer.trainer_lastname}?
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => onConfirm(trainer)}
          >
            ใช่
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            onClick={onCancel}
          >
            ไม่
          </button>
        </div>
      </div>
    </div>
  );
};

const convertToDateFormat = (dateString) => {
  const month = dateString.substring(0, 2);
  const day = dateString.substring(2, 4);
  const year = dateString.substring(4, 8);
  return `${year}-${month}-${day}`;
};

const TrainerFormModal = ({ isOpen, onClose, refreshTrainers, trainer }) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];
  const formattedEndDate = new Date(
    new Date().setDate(new Date().getDate() + 30)
  )
    .toISOString()
    .split("T")[0]; // วันที่สิ้นสุด 30 วันหลังจากวันนี้

  const [formData, setFormData] = useState({
    trainer_username: trainer?.trainer_username || "",
    trainer_password: trainer ? "" : "", // ถ้าเป็นการแก้ไขไม่ต้องกรอกรหัสผ่าน
    trainer_firstname: trainer?.trainer_firstname || "",
    trainer_lastname: trainer?.trainer_lastname || "",
    trainer_nickname: trainer?.trainer_nickname || "",
    trainer_email: trainer?.trainer_email || "",
    trainer_phone: trainer?.trainer_phone || "",
    trainer_dob: trainer?.trainer_dob || "",
    trainer_gender: trainer?.trainer_gender || "male",
    trainer_exp: trainer?.trainer_exp || 0,
    trainer_startdate: today,
    trainer_enddate: formattedEndDate,
    trainer_id: trainer?.trainer_id || null, // ถ้าเป็นการแก้ไขให้มี trainer_id
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (formData.trainer_id) {
        // ถ้ามี trainer_id หมายความว่าเป็นการแก้ไขข้อมูล (PATCH)
        response = await fetch(`/api/trainer/${formData.trainer_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // ถ้าไม่มี trainer_id หมายความว่าเป็นการเพิ่มข้อมูล (POST)
        response = await fetch("/api/trainer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");

      const successMessage = formData.trainer_id
        ? "แก้ไขข้อมูลผู้ฝึกสอนเรียบร้อยแล้ว"
        : "เพิ่มผู้ฝึกสอนเรียบร้อยแล้ว";
      Swal.fire("สำเร็จ!", successMessage, "success");

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
          {trainer ? "แก้ไขผู้ฝึกสอน" : "เพิ่มผู้ฝึกสอน"}
        </h1>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            name="trainer_username"
            placeholder="ชื่อผู้ใช้"
            value={formData.trainer_username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            name="trainer_password"
            placeholder="รหัสผ่าน"
            value={formData.trainer_password}
            onChange={handleChange}
            required={!trainer} // ถ้าเป็นการแก้ไขไม่จำเป็นต้องใส่รหัสผ่าน
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="trainer_firstname"
            placeholder="ชื่อ"
            value={formData.trainer_firstname}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="trainer_lastname"
            placeholder="นามสกุล"
            value={formData.trainer_lastname}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="trainer_nickname"
            placeholder="ชื่อเล่น"
            value={formData.trainer_nickname}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="email"
            name="trainer_email"
            placeholder="อีเมลล์"
            value={formData.trainer_email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="tel"
            name="trainer_phone"
            placeholder="เบอร์โทรศัพท์"
            value={formData.trainer_phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="date"
            name="trainer_dob"
            value={formData.trainer_dob}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
          <select
            name="trainer_gender"
            value={formData.trainer_gender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          >
            <option value="male">ผู้ชาย</option>
            <option value="female">ผู้หญิง</option>
          </select>
          <input
            type="number"
            name="trainer_exp"
            placeholder="ประสบการณ์(ปี)"
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
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              {trainer ? "บันทึกการแก้ไข" : "เพิ่มผู้ฝึกสอน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Page() {
  const [trainers, setTrainers] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [editTrainer, setEditTrainer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrainer = async () => {
    try {
      const response = await fetch("/api/trainer");
      const data = await response.json();
      console.log(data); // ตรวจสอบข้อมูลที่ได้รับจาก API
      setTrainers(data.trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };
  useEffect(() => {
    fetchTrainer();
  }, []);

  const handleDelete = async (trainer) => {
    try {
      const response = await fetch(`/api/trainer/${trainer.trainer_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire("สำเร็จ!", "ลบเทรนเนอร์สำเร็จ!", "success");
        fetchTrainer();
      } else {
        Swal.fire("ผิดพลาด!", "ลบเทรนเนอร์ไม่สำเร็จ", "error");
      }
    } catch (error) {
      Swal.fire("ผิดพลาด!", error.message, "error");
    }
  };

  const handleDeleteClick = (trainer) => {
    setSelectedTrainer(trainer);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    handleDelete(selectedTrainer);
    setShowConfirmDelete(false);
  };

  const handleEdit = (trainer) => {
    setEditTrainer(trainer); // ส่งข้อมูลทั้งหมดไปยัง `setEditTrainer`
  };

  const handleSaveEdit = async (trainer) => {
    try {
      // ตรวจสอบข้อมูล trainer ก่อนส่งไป
      console.log("Sending data to API:", trainer);

      const response = await fetch(`/api/trainer/${trainer.trainer_id}`, {
        method: "PATCH", // เปลี่ยนจาก PUT เป็น PATCH
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainer), // ส่งข้อมูลที่อัปเดตไป
      });

      if (response.ok) {
        Swal.fire("สำเร็จ!", "แก้ไขเทรนเนอร์สำเร็จ!", "success");
        fetchTrainer(); // รีเฟรชข้อมูลหลังจากแก้ไข
        setEditTrainer(null); // ปิดโมดัลหลังจากบันทึก
      } else {
        // ถ้าหากเกิดข้อผิดพลาดจาก API
        const errorData = await response.json(); // รับข้อมูล error ที่เซิร์ฟเวอร์ส่งกลับมา
        Swal.fire(
          "ผิดพลาด!",
          errorData.message || "ไม่สามารถแก้ไขข้อมูลได้",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire(
        "ผิดพลาด!",
        error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ",
        "error"
      );
    }
  };

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
          refreshTrainers={fetchTrainer}
        />
      )}
      <h1 className="text-2xl font-bold mb-4 flex justify-center">
        รายชื่อผู้ฝึกสอน
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg border-separate border-spacing-0 table-auto">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-400">
              <th className="pborder px-4 py-2 text-center">รหัส</th>
              <th className="pborder px-4 py-2 text-center">ชื่อ-นามสกุล</th>
              <th className="pborder px-4 py-2 text-center">อีเมล</th>
              <th className="pborder px-4 py-2 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {trainers.length > 0 ? (
              trainers.map((trainer) => (
                <tr
                  key={trainer.trainer_id}
                  className="border-b border-gray-400"
                >
                  <td className="border px-4 py-2">{trainer.trainer_id}</td>
                  <td className="border px-4 py-2">
                    {trainer.trainer_firstname} {trainer.trainer_lastname}
                  </td>
                  <td className="border px-4 py-2">{trainer.trainer_email}</td>
                  <td className="border px-4 py-2 flex justify-center">
                    <button
                      onClick={() => handleEdit(trainer)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteClick(trainer)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded ml-2"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-2 px-8 text-center text-sm">
                  กำลังโหลด...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* แสดงโมดัลการลบ */}
      {showConfirmDelete && selectedTrainer && (
        <ConfirmDeleteModal
          trainer={selectedTrainer}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}

      {/* แสดงโมดัลแก้ไข */}
      {editTrainer && (
        <TrainerFormModal
          trainer={editTrainer}
          isOpen={true}
          onClose={() => setEditTrainer(null)}
          refreshTrainers={fetchTrainer}
        />
      )}
    </div>
  );
}

export default Page;

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Success Modal Component
const SuccessModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <p className="text-xl font-bold text-gray-800 mb-4">{message}</p>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
};

// Confirm Delete Modal Component
const ConfirmDeleteModal = ({ trainer, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <p className="text-xl font-bold text-gray-800">
          คุณแน่ใจใช่ไหมที่จะลบเทรนเนอร์คนนี้ {trainer.trainer_name}?
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

// Confirm Status Change Modal
const ConfirmStatusModal = ({ trainer, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <p className="text-xl font-bold text-gray-800">
          คุณต้องการเปลี่ยนสถานะของเทรนเนอร์ {trainer.trainer_firstname}{" "}
          {trainer.trainer_lastname} เป็น{" "}
          <span
            className={
              trainer.trainer_status === 1 ? "text-red-600" : "text-green-600"
            }
          >
            {trainer.trainer_status === 1 ? "Inactive" : "Active"}
          </span>
          ใช่หรือไม่?
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={onConfirm}
          >
            ยืนยัน
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            onClick={onCancel}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

// Trainer Form Modal Component
const TrainerFormModal = ({ isOpen, onClose, refreshTrainers, editData = null }) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().slice(0, 10);
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 30);
  const formattedEndDate = defaultEndDate.toISOString().slice(0, 10);

  const [formData, setFormData] = useState(
    editData || {
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
      trainer_enddate: formattedEndDate,
    }
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editData 
        ? `/api/trainer/${editData.trainer_id}`
        : "/api/trainer";
      
      const method = editData ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        refreshTrainers();
      } else {
        const errorMessage = await response.text();
        alert(`❌ ${editData ? 'แก้ไข' : 'เพิ่ม'} Trainer ไม่สำเร็จ: ${errorMessage}`);
      }
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล: " + error.message);
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [editTrainer, setEditTrainer] = useState(null);
  const router = useRouter();

  const fetchTrainer = async () => {
    try {
      const response = await fetch("/api/trainer");
      const data = await response.json();
      setTrainers(data.trainers);
    } catch (error) {
      console.error("Error fetching trainer:", error);
    }
  };

  const handleEdit = (trainer) => {
    setEditTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleDelete = async (trainer) => {
    try {
      const response = await fetch(`/api/trainer/${trainer.trainer_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ ลบ Trainer สำเร็จ!");
        fetchTrainer();
      } else {
        alert("❌ ลบ Trainer ไม่สำเร็จ");
      }
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาดในการลบ: " + error.message);
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

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTrainer(null);
  };

  // Handle Status Change Click (Show Confirmation Modal)
  const handleStatusChangeClick = (trainer) => {
    setSelectedTrainer(trainer);
    setShowConfirmStatus(true);
  };

  // Handle Confirmed Status Change
  const confirmStatusChange = async () => {
    if (!selectedTrainer) return;
    try {
      const newStatus = selectedTrainer.trainer_status === 1 ? 0 : 1;
      const response = await fetch(`/api/trainer/${selectedTrainer.trainer_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainer_status: newStatus }),
      });

      if (response.ok) {
        setTrainers((prevTrainers) =>
          prevTrainers.map((trainer) =>
            trainer.trainer_id === selectedTrainer.trainer_id
              ? { ...trainer, trainer_status: newStatus }
              : trainer
          )
        );
      } else {
        alert("❌ เปลี่ยนสถานะไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error changing trainer status:", error);
    }
    setShowConfirmStatus(false);
  };

  useEffect(() => {
    fetchTrainer();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">
        Trainer List
      </h1>

      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Add Trainer
        </button>
      </div>

      {isModalOpen && (
        <TrainerFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          refreshTrainers={fetchTrainer}
          editData={editTrainer}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer.trainer_id}
              className="bg-white shadow rounded-lg p-4"
            >
              <h2 className="text-lg font-semibold">{trainer.trainer_name}</h2>
              <p>Id: {trainer.trainer_id}</p>
              <p>Username: {trainer.trainer_username}</p>
              <p>Password: {trainer.trainer_password}</p>
              <p>First Name: {trainer.trainer_firstname}</p>
              <p>Last Name: {trainer.trainer_lastname}</p>
              <p>Email: {trainer.trainer_email}</p>
              <p>
                Start Date:{" "}
                {trainer.trainer_status === 0
                  ? "0000-00-00"
                  : trainer.trainer_startdate}
              </p>
              <p>
                End Date:{" "}
                {trainer.trainer_status === 0
                  ? "0000-00-00"
                  : trainer.trainer_enddate}
              </p>
              <p>
                
              Status:{" "}
                <span
                  className={
                    trainer.trainer_status === 1
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {trainer.trainer_status === 1 ? "Active" : "Inactive"} 
                </span>
              </p>
              {/* Toggle Switch for Status */}
              <div className="flex justify-center mt-3">
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-3 text-gray-700">Status</span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={trainer.trainer_status === 1}
                    onChange={() => handleStatusChangeClick(trainer)}
                  />
                  <div
                    className={`relative w-12 h-6 rounded-full transition ${
                      trainer.trainer_status === 1 ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition ${
                        trainer.trainer_status === 1 ? "translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex justify-center mt-3">
                <button
                  onClick={() => handleEdit(trainer)}
                  className="bg-yellow-500 hover:bg-yellow-600 mr-4 text-white py-2 px-4 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(trainer)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="fixed inset-0 flex items-center justify-center font-bold text-2xl">
            <p>Loading . . .</p>
          </div>
        )}
      </div>

      {showConfirmDelete && selectedTrainer && (
        <ConfirmDeleteModal
          trainer={selectedTrainer}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showConfirmStatus && selectedTrainer && (
        <ConfirmStatusModal
          trainer={selectedTrainer}
          onConfirm={confirmStatusChange}
          onCancel={() => setShowConfirmStatus(false)}
        />
      )}
      
    </div>
  );
}

export default Page;
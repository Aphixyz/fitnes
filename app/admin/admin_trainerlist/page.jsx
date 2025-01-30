"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Modal Component
const AlertModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <p className="text-xl font-bold text-gray-800">{message}</p>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
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
          คุณไม่ใจใช่ไหมที่จะลบเทรนเนอร์คนนี้ {trainer.trainer_name}?
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

function Page() {
  const [trainers, setTrainers] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // For the delete confirmation modal
  const [selectedTrainer, setSelectedTrainer] = useState(null); // Store the trainer to be deleted
  const router = useRouter();

  const fetchTrainer = async () => {
    try {
      const response = await fetch("/api/trainer");
      const data = await response.json();

      const updatedTrainers = data.trainers.map((trainer) => {
        const today = new Date();
        const startDate = new Date(trainer.trainer_startdate);
        const endDate = new Date(trainer.trainer_enddate);

        const isActive = today >= startDate && today <= endDate ? 1 : 0;

        return { ...trainer, trainer_status: isActive };
      });

      setTrainers(updatedTrainers);
    } catch (error) {
      console.error("Error fetching trainer:", error);
    }
  };

  const handleAddtrainer = (trainer) => {
    
  };

  const handleEdit = (trainer) => {
    const trainerData = encodeURIComponent(JSON.stringify(trainer));
    router.push(`/trainer?trainerData=${trainerData}`);
  };

  const handleDelete = (trainer) => {
    setSelectedTrainer(trainer); // Set the trainer to be deleted
    setShowConfirmDelete(true); // Show confirmation modal
  };

  const confirmDelete = async (trainer) => {
    try {
      const response = await fetch(`/api/trainer/${trainer.trainer_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTrainers((prevTrainers) =>
          prevTrainers.filter((t) => t.trainer_id !== trainer.trainer_id)
        );
        setAlertMessage(
          `Trainer ${trainer.trainer_name} has been deleted successfully.`
        );
        setShowAlert(true);
      } else {
        console.error("Failed to delete trainer");
      }
    } catch (error) {
      console.error("Error deleting trainer:", error);
    } finally {
      setShowConfirmDelete(false); // Close the confirm modal
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false); // Close the confirm modal without deleting
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
          onClick={() => handleAddtrainer(trainer)}
        >
          เพิ่มเทรนเนอร์
        </button>
      </div>

      {showAlert && (
        <AlertModal
          message={alertMessage}
          onClose={() => setShowAlert(false)} // Close alert modal
        />
      )}

      {showConfirmDelete && (
        <ConfirmDeleteModal
          trainer={selectedTrainer}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
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

              <div className="flex space-x-4 mt-4">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleEdit(trainer)}
                >
                  แก้ไข
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDelete(trainer)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading trainers...</p>
        )}
      </div>
    </div>
  );
}

export default Page;

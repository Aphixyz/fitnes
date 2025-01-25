"use client";
import React, { useState, useEffect } from "react";

function Page() {
  const [trainers, setTrainers] = useState([]);

  // Fetch trainer data and calculate status
  const fetchTrainer = async () => {
    try {
      const response = await fetch("/api/trainer"); // Adjust URL if necessary
      const data = await response.json();

      const updatedTrainers = data.trainers.map((trainer) => {
        const today = new Date(); // Get current date
        const startDate = new Date(trainer.trainer_startdate); // Convert start date
        const endDate = new Date(trainer.trainer_enddate); // Convert end date

        // Determine if today is within startDate and endDate
        const isActive = today >= startDate && today <= endDate ? 1 : 0;

        return { ...trainer, trainer_status: isActive };
      });

      setTrainers(updatedTrainers);
    } catch (error) {
      console.error("Error fetching trainer:", error);
    }
  };

  // Fetch trainers when component loads
  useEffect(() => {
    fetchTrainer();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Trainer List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer.trainer_id} // Use trainer_id as the unique key
              className="bg-white shadow rounded-lg p-4"
            >
              <h2 className="text-lg font-semibold">{trainer.trainer_name}</h2>
              <p>Id: {trainer.trainer_id}</p>
              <p>Username: {trainer.trainer_username}</p>
              <p>Password: {trainer.trainer_password}</p>
              <p>First Name: {trainer.trainer_firstname}</p>
              <p>Last Name: {trainer.trainer_lastname}</p>
              <p>Nickname: {trainer.trainer_nickname}</p>
              <p>Email: {trainer.trainer_email}</p>
              <p>Phone: {trainer.trainer_phone}</p>
              <p>DOB: {trainer.trainer_dob}</p>
              <p>Gender: {trainer.trainer_gender}</p>
              <p>Exp: {trainer.trainer_exp}</p>
              <p>Start Date: {trainer.trainer_startdate}</p>
              <p>End Date: {trainer.trainer_enddate}</p>
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

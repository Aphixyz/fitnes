"use client";
import React, { useState } from "react";

function TrainerForm() {
  const today = new Date();
  const formattedToday = today.toISOString().slice(0, 10); // Format YYYY-MM-DD
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 30);
  const formattedEndDate = defaultEndDate.toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    trainer_username: "",
    trainer_password: "",
    trainer_firstname: "",
    trainer_lastname: "",
    trainer_nickname: "",
    trainer_email: "",
    trainer_phone: "",
    trainer_dob: "",
    trainer_gender: "male", // Default gender
    trainer_exp: 0, // Default experience
    trainer_startdate: formattedToday,
    trainer_enddate: formattedEndDate,
  });

  // ฟังก์ชัน handleChange สำหรับจัดการการเปลี่ยนค่าฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    try {
      const response = await fetch("/api/trainer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Data submitted successfully:", result);

        // รีเซ็ตฟอร์ม
        setFormData({
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
          trainer_startdate: formattedToday,
          trainer_enddate: formattedEndDate,
        });
      } else {
        const errorDetails = await response.text();
        console.error("Error submitting form:", response.statusText, errorDetails);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-4">Add Trainer</h1>
        <div className="grid gap-4">
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
            required
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
            type="text"
            name="trainer_nickname"
            placeholder="Nickname"
            value={formData.trainer_nickname}
            onChange={handleChange}
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
            placeholder="Date of Birth"
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
          <input
            type="date"
            name="trainer_startdate"
            value={formData.trainer_startdate}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="date"
            name="trainer_enddate"
            value={formData.trainer_enddate}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default TrainerForm;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function MemberDashboard() {
  const { id } = useParams(); // Get `member_id` from URL
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    member_username: "",
    member_email: "",
    member_phone: "",
    member_firstname: "",
    member_lastname: "",
    member_gender: "",
    member_dob: "",
  });

  // Fetch Member Details
  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch(`/api/member/${id}`);
        if (!res.ok) throw new Error("Member not found");
        const data = await res.json();
        setMember(data);
        setFormData(data); // Prefill form with existing data
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [id]);

  // Handle Form Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit (Update Profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/member/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      Swal.fire("Success", "Profile updated successfully!", "success");
      setEditMode(false);
      setMember(formData); // Update UI
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Member {id} Dashboard</h1>

      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-2xl">
        {!editMode ? (
          <>
            {/* View Mode */}
            <div className="text-center mb-4">
              <p><strong>Username:</strong> {member.member_username}</p>
              <p><strong>Email:</strong> {member.member_email}</p>
              <p><strong>Phone:</strong> {member.member_phone}</p>
              <p><strong>First Name:</strong> {member.member_firstname}</p>
              <p><strong>Last Name:</strong> {member.member_lastname}</p>
              <p><strong>Gender:</strong> {member.member_gender}</p>
              <p><strong>Date of Birth:</strong> {member.member_dob}</p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="member_username"
                placeholder="Username"
                value={formData.member_username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="email"
                name="member_email"
                placeholder="Email"
                value={formData.member_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                name="member_phone"
                placeholder="Phone"
                value={formData.member_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                name="member_firstname"
                placeholder="First Name"
                value={formData.member_firstname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                name="member_lastname"
                placeholder="Last Name"
                value={formData.member_lastname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
              <select
                name="member_gender"
                value={formData.member_gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                name="member_dob"
                value={formData.member_dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
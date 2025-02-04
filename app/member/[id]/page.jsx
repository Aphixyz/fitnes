"use client";

import Swal from "sweetalert2"; 
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

// Edit Profile Modal Component
const MemberEditModal = ({ isOpen, onClose, member, refreshProfile }) => {
    if (!isOpen || !member) return null;
  
    const [formData, setFormData] = useState({ ...member });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`/api/member/${member.member_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          Swal.fire({
            title: "แก้ไข member สำเร็จ!",
            text: "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#28a745",
          }).then(() => {
            refreshProfile(); // รีเฟรชข้อมูลโปรไฟล์
            onClose(); // ปิด modal
          });
        } else {
          Swal.fire({
            title: "แก้ไข member ไม่สำเร็จ!",
            text: "โปรดลองอีกครั้ง",
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: error.message,
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-4">Edit Member</h1>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              name="member_username"
              placeholder="Username"
              value={formData.member_username}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="password"
              name="member_password"
              placeholder="New Password"
              value={formData.member_password}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              name="member_firstname"
              placeholder="First Name"
              value={formData.member_firstname}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              name="member_lastname"
              placeholder="Last Name"
              value={formData.member_lastname}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="email"
              name="member_email"
              placeholder="Email"
              value={formData.member_email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="tel"
              name="member_phone"
              placeholder="Phone"
              value={formData.member_phone}
              onChange={handleChange}
              required
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
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

//member Profile Page
export default function memberProfile() {
  const { id } = useParams();
  const [member, setmember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchMember() {
      try {
        console.log(`Fetching member ID: ${id}`);
        const res = await fetch(`/api/member/${id}`);
        if (!res.ok) throw new Error("member not found");
        const data = await res.json();
        console.log("member data:", data);

        setmember(data.member ? data.member : null);
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [id]);

  if (loading)
    return <p className="fixed inset-0 flex items-center justify-center font-bold text-2xl">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center mb-4">Member Profile</h1>
        {member ? (
          <>
            <div className="grid gap-2">
              <p>
                <strong>Member ID:</strong> {member.member_id}
              </p>
              <p>
                <strong>Username:</strong> {member.member_username}
              </p>
              <p>
                <strong>First Name:</strong> {member.member_firstname}
              </p>
              <p>
                <strong>Last Name:</strong> {member.member_lastname}
              </p>
              <p>
                <strong>Nickname:</strong> {member.member_nickname}
              </p>
              <p>
                <strong>Email:</strong> {member.member_email}
              </p>
              <p>
                <strong>Phone:</strong> {member.member_phone}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {member.member_dob.split("T")[0]}
              </p>
              <p>
                <strong>Gender:</strong> {member.member_gender}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {member.member_status === 1 ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="mt-4 flex justify-between">
              <Link
                href={`/member/${id}/dashboard`}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <p className="text-red-500 text-center">Member not found</p>
        )}
      </div>

      {isEditModalOpen && (
        <MemberEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          member={member}
          refreshProfile={() => {
            setIsEditModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

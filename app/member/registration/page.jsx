"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function MemberRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ดึงค่าจาก URL
  const trainer_id = searchParams.get("trainer_id");
  const registration_id = searchParams.get("registration_id");
  const hash = searchParams.get("hash");

  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    member_username: "",
    member_password: "",
    member_firstname: "",
    member_lastname: "",
    member_email: "",
    member_phone: "",
    member_gender: "Male",
    member_dob: "",
  });

  useEffect(() => {
    async function validateLink() {
      try {
        const res = await fetch('/api/member/register/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trainer_id, registration_id, hash }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Invalid link');
        }

        setIsValid(true); // Link ถูกต้อง
      } catch (error) {
        console.error('Error validating link:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    validateLink();
  }, [trainer_id, registration_id, hash]);

  // ฟังก์ชันอัปเดตค่า input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันส่งข้อมูลไปที่ API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, trainer_id, registration_id, hash }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register");
      }

      alert("Registration successful!");
      router.push("/member/success"); // เปลี่ยนเส้นทางไปยังหน้าสำเร็จ
    } catch (error) {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Validating link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Register Member
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Username</label>
              <input type="text" name="member_username" value={formData.member_username} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input type="password" name="member_password" value={formData.member_password} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">First Name</label>
              <input type="text" name="member_firstname" value={formData.member_firstname} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Last Name</label>
              <input type="text" name="member_lastname" value={formData.member_lastname} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" name="member_email" value={formData.member_email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Phone</label>
              <input type="text" name="member_phone" value={formData.member_phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Gender</label>
              <select name="member_gender" value={formData.member_gender} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
              <input type="date" name="member_dob" value={formData.member_dob} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Register</button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
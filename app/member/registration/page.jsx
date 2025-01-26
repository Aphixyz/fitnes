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
        console.error('Error validating link:', error.message); // Debug ใน Console
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  
    validateLink();
  }, [trainer_id, registration_id, hash]);

  console.log('Trainer ID:', trainer_id);
    console.log('Registration ID:', registration_id);
console.log('Hash:', hash);
 
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Register Member
          </h1>
          <form action="/api/member/register" method="POST">
            <input type="hidden" name="trainer_id" value={trainer_id} />
            <input
              type="hidden"
              name="registration_id"
              value={registration_id}
            />
            <input type="hidden" name="hash" value={hash} />

            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                name="member_username"
                placeholder="Username"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                name="member_password"
                placeholder="Password"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="firstname"
                className="block text-gray-700 font-medium mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                name="member_firstname"
                placeholder="First Name"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="lastname"
                className="block text-gray-700 font-medium mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                name="member_lastname"
                placeholder="Last Name"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="member_email"
                placeholder="Email"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-gray-700 font-medium mb-2"
              >
                Phone
              </label>
              <input
                type="text"
                name="member_phone"
                placeholder="Phone"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="gender"
                className="block text-gray-700 font-medium mb-2"
              >
                Gender
              </label>
              <select
                name="member_gender"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="dob"
                className="block text-gray-700 font-medium mb-2"
              >
                Date of Birth
              </label>
              <input
                type="date"
                name="member_dob"
                placeholder="Date of Birth"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null; // กรณีที่ไม่มีข้อมูลใดแสดง
}

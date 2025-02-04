"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function MemberDashboard() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลสมาชิกไอดีที่ต้องการ
  useEffect(() => {
    async function fetchMember() {
      if (!id) return; // ถ้า id ยังไม่มีค่า ไม่ต้อง fetch
      try {
        const res = await fetch(`/api/member/${id}`);
        if (!res.ok) throw new Error("Member not found");
        const data = await res.json();
        console.log("Fetched member:", data);
        setMember(data.member || null);
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [id]);


  if (loading) return <p className="fixed inset-0 flex items-center justify-center font-bold text-2xl">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Member Dashboard</h1>

      {member ? (
        <div className="mt-6 text-center">
          <p>
            <strong>Member ID:</strong> {member?.member_id}
          </p>
          <p>
            <strong>Username:</strong> {member?.member_username}
          </p>
          <p>
            <strong>Email:</strong> {member?.member_email}
          </p>

          <Link
            href={`/member/${id}`}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 block"
          >
            View Profile
          </Link>
        </div>
      ) : (
        <p className="text-red-500">Member not found</p>
      )}

      {/* แสดงรายการสมาชิกที่เกี่ยวข้องกับไอดีนี้ */}
      {members.length > 0 ? (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Related Members</h2>
          <ul className="bg-white p-4 shadow-md rounded-lg">
            {members.map((m) => (
              <li key={m.member_id} className="border-b last:border-none py-2">
                <p>
                  <strong>ID:</strong> {m.member_id}
                </p>
                <p>
                  <strong>Username:</strong> {m.member_username}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No related members found.</p>
      )}
    </div>
  );
}

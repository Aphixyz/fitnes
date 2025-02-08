"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MemberDetailModal from "./MemberDetailModal";
import Swal from "sweetalert2";

export default function TrainerMemberPage() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  // ✅ Fetch Members under Trainer
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/trainer/${id}/members`);
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        console.log("🔍 API Response:", data);
        setMembers(data.members);
        setFilteredMembers(data.members); // Initialize filtered members
      } catch (error) {
        console.error("Error fetching members:", error);
        Swal.fire("ผิดพลาด!", error.message, "error");
      }
    };
    if (id) fetchMembers();
  }, [id]);

  // ✅ Search Handler
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  
    if (query === "") {
      setFilteredMembers(members); // Show all members when search is cleared
    } else {
      setFilteredMembers(
        members.filter((member) => {
          const id = String(member.member_id).toLowerCase();
          const firstname = member.firstname?.toLowerCase() || "";
          const lastname = member.lastname?.toLowerCase() || "";
          const email = member.email?.toLowerCase() || "";
  
          return (
            id.includes(query) ||
            firstname.includes(query) ||
            lastname.includes(query) ||
            email.includes(query)
          );
        })
      );
    }
  };

  const handleRowClick = (member) => {
    setSelectedMember(member);
  };

  if (!members.length) return <p className="text-center">ไม่มีสมาชิกในระบบ</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black">
      {/* Search Box */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="ค้นหาลูกค้า"
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/4 p-2 border rounded-lg"
        />
      </div>
      <p className="flex justify-end text-lg font-medium text-center mb-4 text-orange-500">
        จำนวนลูกค้าทั้งหมด: {members.length}
      </p>

      {/* Member Table */}
      <h1 className="text-2xl font-bold mb-4 text-center">รายชื่อลูกค้า</h1>
      <table className="min-w-full border border-gray-300 bg-white shadow-md text-black">
        <thead className="bg-gray-200">
          <tr className="bg-gray-200 border-gray-300">
            <th className="px-4 py-2 border border-gray-300">รหัส</th>
            <th className="px-4 py-2 border border-gray-300">ชื่อ-นามสกุล</th>
            <th className="px-4 py-2 border border-gray-300">อีเมล</th>
            <th className="px-4 py-2 border border-gray-300">เบอร์โทร</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <tr
                key={member.member_id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  index % 2 === 0 ? "bg-gray-100" : ""
                }`}
                onClick={() => handleRowClick(member)}
              >
                <td className="border px-4 py-2">{member.member_id}</td>
                <td className="border px-4 py-2">
                  {member.firstname} {member.lastname}
                </td>
                <td className="border px-4 py-2">{member.email}</td>
                <td className="border px-4 py-2">{member.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-red-500">
                ไม่พบข้อมูลสมาชิกที่ค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show Modal When a Member is Clicked */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

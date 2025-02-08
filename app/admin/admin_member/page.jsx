"use client";
import React, { useState, useEffect } from "react";

function MemberPage() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMember = async () => {
    try {
      const response = await fetch("/api/member");
      const data = await response.json();
      setMembers(data.members);
      setFilteredMembers(data.members);
    } catch (error) {
      console.error("Error fetching member:", error);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(
        members.filter((member) => {
          const id = member.member_id
            ? String(member.member_id).toLowerCase()
            : "";
          const firstname = member.member_firstname?.toLowerCase() || "";
          const lastname = member.member_lastname?.toLowerCase() || "";
          const email = member.member_email?.toLowerCase() || "";

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

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="ค้นหาลูกค้า"
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/4 p-2 border rounded-lg"
        />
      </div>
      <h1 className="text-2xl font-bold mb-4 flex justify-center">
        รายชื่อลูกค้า
      </h1>
      <p className="text-lg font-medium text-center mb-4 text-orange-500">
        จำนวนลูกค้าทั้งหมด: {members.length}
      </p>
      <table className="min-w-full border border-gray-300 bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2 text-center">รหัส</th>
            <th className="border px-4 py-2 text-center">ชื่อ-นามสกุล</th>
            <th className="border px-4 py-2 text-center">อีเมลล์</th>
            <th className="border px-4 py-2 text-center">เบอร์โทร</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <tr key={member.member_id} className="border-b">
                <td className="border px-4 py-2">{member.member_id}</td>
                <td className="border px-4 py-2">
                  {member.member_firstname} {member.member_lastname}
                </td>
                <td className="border px-4 py-2">{member.member_email}</td>
                <td className="border px-4 py-2">{member.member_phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MemberPage;

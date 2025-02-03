"use client";
import React, { useState, useEffect } from "react";

function MemberPage() {
  const [members, setMembers] = useState([]);

  const fetchMember = async () => {
    try {
      const response = await fetch("/api/member");
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error("Error fetching member:", error);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">
        Member List
      </h1>
      <p className="text-lg font-medium text-center mb-4 text-orange-500">
        Total Members: {members.length}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.member_id}
              className="bg-white shadow rounded-lg p-4"
            >
              <h2 className="text-lg font-semibold">{member.member_name}</h2>
              <p>Id: {member.member_id}</p>
              <p>Username: {member.member_username}</p>
              <p>Password: {member.member_password}</p>
              <p>First Name: {member.member_firstname}</p>
              <p>Last Name: {member.member_lastname}</p>
              <p>Email: {member.member_email}</p>
              <p>Phone: {member.member_phone}</p>
              <p>Gender: {member.member_gender}</p>
              <p>Date Of Birth: {member.member_dob}</p>
            </div>
          ))
        ) : (
          <div className="fixed inset-0 flex items-center justify-center font-bold text-2xl">
            <p>Loading . . .</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberPage;

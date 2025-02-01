"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function TrainerDashboard() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    async function fetchTrainer() {
      try {
        const res = await fetch(`/api/trainer/${id}`);
        if (!res.ok) throw new Error("Trainer not found");
        const data = await res.json();
        setTrainer(data.trainer || null);
      } catch (error) {
        console.error("Error fetching trainer:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainer();
  }, [id]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/trainer/${id}/members`);
        if (!res.ok) throw new Error("Trainer not found");
        const data = await res.json();
        setMembers(data.members);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
    fetchMembers();
  }, [id]);

  async function handleGenerateLink() {
    try {
      const res = await fetch("/api/registration/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trainer_id: id }),
      });

      if (!res.ok) throw new Error("Failed to generate link");

      const data = await res.json();
      setGeneratedLink(data.link);
      Swal.fire("✅ ลิงก์สร้างสำเร็จ!", `ลิงก์ที่สร้าง: ${data.link}`, "success");
    } catch (error) {
      Swal.fire("❌ ล้มเหลว", "ไม่สามารถสร้างลิงก์ได้", "error");
    }
  }

  async function handleApprove(registration_id) {
    Swal.fire({
      title: "ยืนยันการสมัครสมาชิก?",
      text: "คุณต้องการยืนยันสถานะการสมัครนี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/trainer/${id}/members`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registration_id }),
          });

          if (!res.ok) throw new Error("Failed to approve");

          setMembers((prev) =>
            prev.map((m) =>
              m.registration_id === registration_id ? { ...m, status: 1 } : m
            )
          );

          Swal.fire("✅ สำเร็จ!", "ยืนยันการสมัครสมาชิกเรียบร้อยแล้ว", "success");
        } catch (error) {
          Swal.fire("❌ ล้มเหลว", "ไม่สามารถยืนยันได้", "error");
        }
      }
    });
  }

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Trainer Dashboard</h1>

      {trainer ? (
        <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-5xl">
          {/* ปุ่ม Generate Link */}
          <div className="text-center mb-4">
            <button
              onClick={handleGenerateLink}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Generate Link
            </button>
          </div>
          {generatedLink && (
            <div className="text-center mt-2">
              <p className="text-green-600 font-semibold">ลิงก์ที่สร้าง:</p>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {generatedLink}
              </a>
            </div>
          )}

          {/* ตารางสมาชิก */}
          {members.length === 0 ? (
            <p className="text-center text-gray-500">
              ไม่มีสมาชิกในระบบสำหรับ Trainer คนนี้
            </p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300">ชื่อสมาชิก</th>
                    <th className="px-4 py-2 border border-gray-300">อีเมล</th>
                    <th className="px-4 py-2 border border-gray-300">เบอร์โทร</th>
                    <th className="px-4 py-2 border border-gray-300">สถานะ</th>
                    <th className="px-4 py-2 border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.member_id} className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-gray-100" : ""}`}>
                      <td className="px-4 py-2 border border-gray-300">
                        {member.firstname} {member.lastname}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">{member.email}</td>
                      <td className="px-4 py-2 border border-gray-300">{member.phone}</td>
                      <td className="px-4 py-2 border border-gray-300 font-semibold">
                        {member.status === 1 ? (
                          <span className="text-green-600">ยืนยันแล้ว</span>
                        ) : (
                          <span className="text-red-600">ยังไม่ยืนยัน</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {member.status === 0 && (
                          <button
                            onClick={() => handleApprove(member.registration_id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          >
                            ยืนยัน
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ข้อมูล Trainer */}
          <div className="mt-6 text-center">
            <p>
              <strong>Trainer ID:</strong> {trainer.trainer_id}
            </p>
            <p>
              <strong>Username:</strong> {trainer.trainer_username}
            </p>
            <p>
              <strong>Email:</strong> {trainer.trainer_email}
            </p>
            <p>
              <strong>Status:</strong> {trainer.trainer_status === 1 ? "Active" : "Inactive"}
            </p>
            <Link href={`/trainer/${id}/profile`} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 block">
              View Profile
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Trainer not found</p>
      )}
    </div>
  );
}
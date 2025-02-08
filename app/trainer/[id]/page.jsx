// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Swal from "sweetalert2";

// export default function TrainerDashboard() {
//   const { id } = useParams(); // รับ Trainer ID จาก URL
//   const router = useRouter();
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [generatedLink, setGeneratedLink] = useState(""); // เก็บลิงก์ที่ถูก Generate

//   useEffect(() => {
//     async function fetchMembers() {
//       try {
//         const res = await fetch(`/api/trainer/${id}/members`);
//         if (!res.ok) {
//           throw new Error("Trainer not found");
//         }
//         const data = await res.json();
//         setMembers(data.members);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchMembers();
//   }, [id]);

//   async function handleGenerateLink() {
//     try {
//       const res = await fetch("/api/registration/generate-link", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ trainer_id: id }), // ส่ง Trainer ID ไปยัง API
//       });

//       if (!res.ok) {
//         throw new Error("Failed to generate link");
//       }

//       const data = await res.json();
//       setGeneratedLink(data.link); // เก็บลิงก์ที่ได้จาก API
//     } catch (error) {
//       console.error("Error generating link:", error);
//     }
//   }

//   async function handleApprove(registration_id, index) {
//     Swal.fire({
//       title: "ยืนยันการสมัครสมาชิก?",
//       text: "คุณต้องการยืนยันสถานะการสมัครนี้หรือไม่",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#28a745",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "ยืนยัน",
//       cancelButtonText: "ยกเลิก",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const res = await fetch(`/api/trainer/${id}/members`, {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ registration_id }),
//           });

//           if (!res.ok) {
//             throw new Error("Failed to approve");
//           }

//           const data = await res.json();

//           // อัปเดตสถานะสมาชิกใน frontend
//           setMembers((prevMembers) =>
//             prevMembers.map((member) =>
//               member.registration_id === registration_id
//                 ? { ...member, status: 1 }
//                 : member
//             )
//           );

//           Swal.fire("สำเร็จ!", "ยืนยันการสมัครสมาชิกลูกค้าเรียบร้อยแล้ว", "success");
//         } catch (error) {
//           Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถยืนยันการสมัครได้", "error");
//           console.error("Error approving registration:", error);
//         }
//       }
//     });
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold text-red-500">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 text-black">
//       <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-center mb-6">
//           Dashboard ของ Trainer ID: {id}
//         </h1>

//         {/* ปุ่ม Generate Link */}
//         <div className="mb-6 text-center">
//           <button
//             onClick={handleGenerateLink}
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
//           >
//             Generate Link
//           </button>
//           {generatedLink && (
//             <div className="mt-4">
//               <p className="text-green-600 font-semibold">ลิงก์ที่สร้าง:</p>
//               <a
//                 href={generatedLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 underline"
//               >
//                 {generatedLink}
//               </a>
//             </div>
//           )}
//         </div>

//         {/* ตารางสมาชิก */}
//         {members.length === 0 ? (
//           <p className="text-center text-gray-500">
//             ไม่มีสมาชิกในระบบสำหรับ Trainer คนนี้
//           </p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left border border-gray-300">
//               <thead className="bg-gray-200">
//                 <tr>
//                   <th className="px-4 py-2 border border-gray-300">
//                     ชื่อสมาชิก
//                   </th>
//                   <th className="px-4 py-2 border border-gray-300">อีเมล</th>
//                   <th className="px-4 py-2 border border-gray-300">เบอร์โทร</th>
//                   <th className="px-4 py-2 border border-gray-300">สถานะ</th>
//                   <th className="px-4 py-2 border border-gray-300">  </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {members.map((member, index) => {
//                   console.log("🔍 Member Data:", member);
//                   return (
//                     <tr
//                       key={member.member_id}
//                       className={`hover:bg-gray-50 ${
//                         index % 2 === 0 ? "bg-gray-100" : ""
//                       }`}
//                     >
//                       <td className="px-4 py-2 border border-gray-300">
//                         {member.firstname} {member.lastname}
//                       </td>
//                       <td className="px-4 py-2 border border-gray-300">
//                         {member.email}
//                       </td>
//                       <td className="px-4 py-2 border border-gray-300">
//                         {member.phone}
//                       </td>
//                       <td className="px-4 py-2 border border-gray-300 font-semibold">
//                         {member.status === 1 ? (
//                           <span className="text-green-600">ยืนยันแล้ว</span>
//                         ) : (
//                           <span className="text-red-600">ยังไม่ยืนยัน</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-2 border border-gray-300">
//                         {member.status === 0 && (
//                           <button
//                             onClick={() => {
//                               console.log(
//                                 "🔹 Button Clicked - Registration ID:",
//                                 member.registration_id
//                               ); 
//                               handleApprove(member.registration_id, index);
//                             }}
//                             className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
//                           >
//                             ยืนยัน
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

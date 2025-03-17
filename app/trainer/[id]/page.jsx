// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// export default function TrainerDashboard() {
//   const { id } = useParams();
//   const [trainer, setTrainer] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchTrainer() {
//       try {
//         const res = await fetch(`/api/trainer/${id}`);
//         if (!res.ok) throw new Error("Trainer not found");
//         const data = await res.json();
//         setTrainer(data.trainer);
//       } catch (error) {
//         console.error("Error fetching trainer:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (id) fetchTrainer();
//   }, [id]);

//   if (loading) return <p className="text-center text-lg">Loading...</p>;
//   if (!trainer) return <p className="text-center text-red-500">Trainer not found</p>;

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Header */}
//       <div className="bg-orange-500 text-white py-6 px-8 rounded-lg shadow-md text-center">
//         <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
//         <p>Welcome {trainer.trainer_firstname}!</p>
//       </div>

//       {/* Trainer Info Card */}
//       <div className="mt-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 text-black">
//         <h2 className="text-2xl font-bold mb-4">ข้อมูลผู้ฝึกสอน</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <p><strong>รหัส:</strong> {trainer.trainer_id}</p>
//           <p><strong>ชื่อผู้ใช้:</strong> {trainer.trainer_username}</p>
//           <p><strong>อีเมล:</strong> {trainer.trainer_email}</p>
//           <p><strong>เบอร์โทร:</strong> {trainer.trainer_phone}</p>
//           <p><strong>วันเกิด:</strong> {trainer.trainer_dob}</p>
//           <p><strong>เพศ:</strong> {trainer.trainer_gender}</p>
//           <p><strong>ประสบการณ์:</strong> {trainer.trainer_exp} ปี</p>
//           <p><strong>สถานะ:</strong> {trainer.trainer_status === 1 ? "Active" : "Inactive"}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
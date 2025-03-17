// "use client";

// import Swal from "sweetalert2";
// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";

// // Success Modal Component
// const SuccessModal = ({ message, onClose }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white rounded-lg p-6 shadow-lg text-center">
//         <p className="text-xl font-bold text-gray-800 mb-4">{message}</p>
//         <button
//           className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
//           onClick={onClose}
//         >
//           ตกลง
//         </button>
//       </div>
//     </div>
//   );
// };

// // Edit Profile Modal Component
// const TrainerEditModal = ({ isOpen, onClose, trainer, refreshProfile }) => {
//     if (!isOpen || !trainer) return null;

//     const [formData, setFormData] = useState({ ...trainer });

//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       try {
//         const response = await fetch(`/api/trainer/${trainer.trainer_id}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         });

//         if (response.ok) {
//           Swal.fire({
//             title: "แก้ไข Trainer สำเร็จ!",
//             text: "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว",
//             icon: "success",
//             confirmButtonText: "ตกลง",
//             confirmButtonColor: "#28a745",
//           }).then(() => {
//             refreshProfile(); // รีเฟรชข้อมูลโปรไฟล์
//             onClose(); // ปิด modal
//           });
//         } else {
//           Swal.fire({
//             title: "แก้ไข Trainer ไม่สำเร็จ!",
//             text: "โปรดลองอีกครั้ง",
//             icon: "error",
//             confirmButtonText: "ตกลง",
//             confirmButtonColor: "#d33",
//           });
//         }
//       } catch (error) {
//         Swal.fire({
//           title: "เกิดข้อผิดพลาด",
//           text: error.message,
//           icon: "error",
//           confirmButtonText: "ตกลง",
//           confirmButtonColor: "#d33",
//         });
//       }
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg">
//           <h1 className="text-2xl font-bold mb-4">Edit Trainer</h1>
//           <form onSubmit={handleSubmit} className="grid gap-4">
//             <input
//               type="text"
//               name="trainer_username"
//               placeholder="Username"
//               value={formData.trainer_username}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//             <input
//               type="password"
//               name="trainer_password"
//               placeholder="New Password"
//               value={formData.trainer_password}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//             <input
//               type="text"
//               name="trainer_firstname"
//               placeholder="First Name"
//               value={formData.trainer_firstname}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//             <input
//               type="text"
//               name="trainer_lastname"
//               placeholder="Last Name"
//               value={formData.trainer_lastname}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//             <input
//               type="email"
//               name="trainer_email"
//               placeholder="Email"
//               value={formData.trainer_email}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//             <input
//               type="tel"
//               name="trainer_phone"
//               placeholder="Phone"
//               value={formData.trainer_phone}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//             <div className="flex justify-end mt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
//               >
//                 Update
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   };

// //Trainer Profile Page
// export default function TrainerProfile() {
//   const { id } = useParams();
//   const [trainer, setTrainer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchTrainer() {
//       try {
//         console.log(`Fetching trainer ID: ${id}`);
//         const res = await fetch(`/api/trainer/${id}`);
//         if (!res.ok) throw new Error("Trainer not found");
//         const data = await res.json();
//         console.log("Trainer data:", data);

//         setTrainer(data.trainer ? data.trainer : null);
//       } catch (error) {
//         console.error("Error fetching trainer:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTrainer();
//   }, [id]);

//   if (loading)
//     return <p className="text-center text-lg font-semibold">Loading...</p>;

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-gray-100 text-black p-6">
//       <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
//         <h1 className="text-2xl font-bold text-center mb-4">Trainer Profile</h1>
//         {trainer ? (
//           <>
//             <div className="grid gap-2">
//               <p>
//                 <strong>Trainer ID:</strong> {trainer.trainer_id}
//               </p>
//               <p>
//                 <strong>Username:</strong> {trainer.trainer_username}
//               </p>
//               <p>
//                 <strong>First Name:</strong> {trainer.trainer_firstname}
//               </p>
//               <p>
//                 <strong>Last Name:</strong> {trainer.trainer_lastname}
//               </p>
//               <p>
//                 <strong>Nickname:</strong> {trainer.trainer_nickname}
//               </p>
//               <p>
//                 <strong>Email:</strong> {trainer.trainer_email}
//               </p>
//               <p>
//                 <strong>Phone:</strong> {trainer.trainer_phone}
//               </p>
//               <p>
//                 <strong>Date of Birth:</strong>{" "}
//                 {trainer.trainer_dob.split("T")[0]}
//               </p>
//               <p>
//                 <strong>Gender:</strong> {trainer.trainer_gender}
//               </p>
//               <p>
//                 <strong>Experience (years):</strong> {trainer.trainer_exp}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 {trainer.trainer_status === 1 ? "Active" : "Inactive"}
//               </p>
//             </div>
//             <div className="mt-4 flex justify-between">
//               <Link
//                 href={`/trainer/${id}`}
//                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//               >
//                 Back to Dashboard
//               </Link>
//               <button
//                 onClick={() => setIsEditModalOpen(true)}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Edit Profile
//               </button>
//             </div>
//           </>
//         ) : (
//           <p className="text-red-500 text-center">Trainer not found</p>
//         )}
//       </div>

//       {isEditModalOpen && (
//         <TrainerEditModal
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           trainer={trainer}
//           refreshProfile={() => {
//             setIsEditModalOpen(false);
//             window.location.reload();
//           }}
//         />
//       )}
//     </div>
//   );
// }

// app/trainer/[id]/profile/page.jsx
// import { updateTrainerProfile } from "@/actions/trainer/profile";
// import { query } from "@/lib/db";
// import { TrainerProfileForm } from "@/components/profile/ProfileForm";

// // ฟังก์ชันสำหรับดึงข้อมูล trainer
// async function getTrainerData(trainerId) {
//   try {
//     const trainers = await query("SELECT * FROM trainer WHERE trainer_id = ?", [
//       trainerId,
//     ]);
//     return trainers[0] || null;
//   } catch (error) {
//     console.error("Error fetching trainer data:", error);
//     return null;
//   }
// }

// export default async function TrainerProfilePage({ params }) {
//   const trainerId = params.id;
//   const trainer = await getTrainerData(trainerId);

//   if (!trainer) {
//     return <div className="p-8">ไม่พบข้อมูลผู้ฝึกสอน</div>;
//   }

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลส่วนตัว</h1>
//       <TrainerProfileForm
//         trainer={trainer}
//         updateAction={updateTrainerProfile}
//       />
//     </div>
//   );
// }

// app/trainer/[id]/profile/page.jsx
import { query } from '@/lib/db';
import TrainerProfileManager from '@/app/trainer/_components/(profile)/TrainerProfileManager';

// ฟังก์ชันสำหรับดึงข้อมูล trainer
async function getTrainerData(trainerId) {
  try {
    const trainers = await query(
      'SELECT * FROM trainer WHERE trainer_id = ?',
      [trainerId]
    );
    return trainers[0] || null;
  } catch (error) {
    console.error('Error fetching trainer data:', error);
    return null;
  }
}

export default async function TrainerProfilePage({ params }) {
  const { id } = await params;
  const trainer = await getTrainerData(id);
  
  if (!trainer) {
    return <div className="p-8">ไม่พบข้อมูลผู้ฝึกสอน</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">ข้อมูลส่วนตัวผู้ฝึกสอน</h1>
      <TrainerProfileManager trainer={trainer} />
    </div>
  );
}
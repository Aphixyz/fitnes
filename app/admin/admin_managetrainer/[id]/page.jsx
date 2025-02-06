// "use client";

// import Swal from "sweetalert2";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function TrainerEditPage({ params }) {
//   const router = useRouter();
//   const [trainer, setTrainer] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrainer = async () => {
//       try {
//         const response = await fetch(`/api/trainer/${params.id}`);
//         if (!response.ok) throw new Error('Trainer not found');
//         const data = await response.json();
//         setTrainer(data);
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrainer();
//   }, [params.id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`/api/trainer/${editData ? editData.trainer_id : ""}`, {
//         method: editData ? "PUT" : "POST", // ใช้ PUT หากแก้ไขข้อมูล, POST หากเพิ่มข้อมูล
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
  
//       if (response.ok) {
//         Swal.fire({
//           title: `${editData ? "แก้ไข" : "เพิ่ม"} ผู้ฝึกสอน สำเร็จ!`,
//           text: "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว",
//           icon: "success",
//           confirmButtonText: "ตกลง",
//           confirmButtonColor: "#28a745",
//         }).then(() => {
//           refreshTrainers(); // รีเฟรชข้อมูล
//           onClose(); // ปิด modal
//         });
//       } else {
//         Swal.fire({
//           title: `${editData ? "แก้ไข" : "เพิ่ม"} ผู้ฝึกสอน ไม่สำเร็จ!`,
//           text: "โปรดลองอีกครั้ง",
//           icon: "error",
//           confirmButtonText: "ตกลง",
//           confirmButtonColor: "#d33",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "เกิดข้อผิดพลาด",
//         text: error.message,
//         icon: "error",
//         confirmButtonText: "ตกลง",
//         confirmButtonColor: "#d33",
//       });
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (!trainer) return <div>ไม่พบข้อมูลเทรนเนอร์</div>;

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
//         <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลเทรนเนอร์</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
//             <input
//               type="text"
//               value={trainer.trainer_firstname}
//               onChange={(e) => setTrainer({...trainer, trainer_firstname: e.target.value})}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
//             <input
//               type="text"
//               value={trainer.trainer_lastname}
//               onChange={(e) => setTrainer({...trainer, trainer_lastname: e.target.value})}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">อีเมล</label>
//             <input
//               type="email"
//               value={trainer.trainer_email}
//               onChange={(e) => setTrainer({...trainer, trainer_email: e.target.value})}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">เบอร์โทร</label>
//             <input
//               type="tel"
//               value={trainer.trainer_phone}
//               onChange={(e) => setTrainer({...trainer, trainer_phone: e.target.value})}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">ประสบการณ์ (ปี)</label>
//             <input
//               type="number"
//               value={trainer.trainer_exp}
//               onChange={(e) => setTrainer({...trainer, trainer_exp: e.target.value})}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={() => router.push('/trainer')}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               ยกเลิก
//             </button>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               บันทึก
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
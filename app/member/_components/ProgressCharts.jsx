// "use client";

// import React, { useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Line, Doughnut } from 'react-chartjs-2';
// import { motion } from 'framer-motion';
// import { 
//   Chart as ChartJS, 
//   CategoryScale, 
//   LinearScale, 
//   PointElement, 
//   LineElement, 
//   Title, 
//   Tooltip, 
//   Legend,
//   ArcElement 
// } from 'chart.js';

// // ลงทะเบียนคอมโพเนนต์ที่จำเป็นสำหรับ Chart.js
// ChartJS.register(
//   CategoryScale, 
//   LinearScale, 
//   PointElement, 
//   LineElement, 
//   Title, 
//   Tooltip, 
//   Legend,
//   ArcElement
// );

// /**
//  * คอมโพเนนต์แสดงกราฟน้ำหนักตัว
//  * @param {Object} props
//  * @param {Array} props.weightData - ข้อมูลน้ำหนักตามวันที่
//  * @param {number} props.targetWeight - เป้าหมายน้ำหนัก
//  * @param {number} props.initialWeight - น้ำหนักเริ่มต้น
//  */
// export const WeightChart = ({ weightData, targetWeight, initialWeight }) => {
//   if (!weightData || weightData.length === 0) {
//     return (
//       <Card className="w-full h-[300px] flex items-center justify-center">
//         <p className="text-gray-500">ไม่มีข้อมูลน้ำหนักในช่วงเวลานี้</p>
//       </Card>
//     );
//   }

//   const dates = weightData.map(entry => {
//     const date = new Date(entry.snapshot_date);
//     return `${date.getDate()}/${date.getMonth() + 1}`;
//   });
  
//   const weights = weightData.map(entry => entry.weight_kg);

//   // สร้างข้อมูลเส้นเป้าหมาย (ถ้ามีค่า targetWeight)
//   const targetLine = targetWeight ? Array(dates.length).fill(targetWeight) : null;
  
//   const chartData = {
//     labels: dates,
//     datasets: [
//       {
//         label: 'น้ำหนัก (กก.)',
//         data: weights,
//         borderColor: 'rgb(75, 192, 192)',
//         backgroundColor: 'rgba(75, 192, 192, 0.5)',
//         tension: 0.4,
//       }
//     ]
//   };
  
//   // ถ้ามีค่าเป้าหมายน้ำหนัก ให้เพิ่มเส้นเป้าหมาย
//   if (targetLine) {
//     chartData.datasets.push({
//       label: 'เป้าหมายน้ำหนัก (กก.)',
//       data: targetLine,
//       borderColor: 'rgba(255, 99, 132, 0.7)',
//       borderDash: [5, 5],
//       borderWidth: 2,
//       pointRadius: 0,
//       fill: false,
//     });
//   }
  
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: false,
//       },
//       tooltip: {
//         callbacks: {
//           title: function(context) {
//             const index = context[0].dataIndex;
//             const date = new Date(weightData[index].snapshot_date);
//             return date.toLocaleDateString('th-TH', {
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric'
//             });
//           }
//         }
//       }
//     },
//     scales: {
//       y: {
//         min: Math.min(...weights, targetWeight || Infinity) - 2,
//         max: Math.max(...weights, targetWeight || 0) + 2,
//       }
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>บันทึกน้ำหนัก</CardTitle>
//       </CardHeader>
//       <CardContent className="h-[300px]">
//         <motion.div 
//           className="w-full h-full"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Line data={chartData} options={options} />
//         </motion.div>
//         {initialWeight && (weights[weights.length - 1] !== initialWeight) && (
//           <div className="mt-4 text-center text-sm text-gray-500">
//             <p>
//               {weights[weights.length - 1] < initialWeight 
//                 ? `ลดลง ${(initialWeight - weights[weights.length - 1]).toFixed(1)} กก. จากน้ำหนักเริ่มต้น (${initialWeight} กก.)` 
//                 : `เพิ่มขึ้น ${(weights[weights.length - 1] - initialWeight).toFixed(1)} กก. จากน้ำหนักเริ่มต้น (${initialWeight} กก.)`}
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// /**
//  * คอมโพเนนต์แสดงกราฟวงกลม compliance
//  * @param {Object} props
//  * @param {Object} props.compliance - ข้อมูล compliance (workout, nutrition)
//  */
// export const ComplianceDonut = ({ compliance }) => {
//   const data = {
//     labels: ['ปฏิบัติตามแผน', 'ไม่ได้ปฏิบัติตาม'],
//     datasets: [
//       {
//         label: 'Workout',
//         data: [compliance.workout, 100 - compliance.workout],
//         backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(54, 162, 235, 0.2)'],
//         borderWidth: 0,
//       }
//     ]
//   };
  
//   const nutritionData = {
//     labels: ['ปฏิบัติตามแผน', 'ไม่ได้ปฏิบัติตาม'],
//     datasets: [
//       {
//         label: 'Nutrition',
//         data: [compliance.nutrition, 100 - compliance.nutrition],
//         backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(75, 192, 192, 0.2)'],
//         borderWidth: 0,
//       }
//     ]
//   };

//   const options = {
//     responsive: true,
//     cutout: '70%',
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: false,
//       },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             const value = context.raw;
//             return `${value}%`;
//           }
//         }
//       }
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>การปฏิบัติตามแผน</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <motion.div 
//               className="relative w-full h-[200px] flex items-center justify-center"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <Doughnut data={data} options={options} />
//               <div className="absolute text-center">
//                 <p className="text-3xl font-bold">{compliance.workout}%</p>
//                 <p className="text-sm text-gray-500">ออกกำลังกาย</p>
//               </div>
//             </motion.div>
//           </div>
          
//           <div>
//             <motion.div 
//               className="relative w-full h-[200px] flex items-center justify-center"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <Doughnut data={nutritionData} options={options} />
//               <div className="absolute text-center">
//                 <p className="text-3xl font-bold">{compliance.nutrition}%</p>
//                 <p className="text-sm text-gray-500">โภชนาการ</p>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// /**
//  * Skeleton component สำหรับแสดงขณะโหลดข้อมูล
//  */
// export const ProgressSkeleton = () => {
//   return (
//     <div className="space-y-6">
//       <div className="w-full h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="w-full h-[250px] bg-gray-200 animate-pulse rounded-lg"></div>
//         <div className="w-full h-[250px] bg-gray-200 animate-pulse rounded-lg"></div>
//       </div>
//     </div>
//   );
// };
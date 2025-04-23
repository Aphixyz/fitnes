// import React from 'react';
// import { getProgressSnapshot } from '@/actions/member/plans/getProgressSnapshot';
// import { WeightChart, ComplianceDonut, ProgressSkeleton } from '@/app/member/_components/ProgressCharts';
// import { Suspense } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// /**
//  * สร้าง component ที่แสดงข้อมูลความก้าวหน้า (มีการ fetch data)
//  */
// const ProgressData = async ({ memberId }) => {
//   // ดึงข้อมูลความก้าวหน้าย้อนหลัง 90 วัน
//   const progressData = await getProgressSnapshot(memberId, 90);
  
//   if (!progressData || progressData.error) {
//     return (
//       <div className="text-center p-6">
//         <p className="text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
//         <p className="text-sm text-gray-500">{progressData?.error || 'ไม่สามารถดึงข้อมูลความก้าวหน้าได้'}</p>
//       </div>
//     );
//   }
  
//   const { weightData, compliance, latestMetrics, targetWeight, initialWeight } = progressData;
  
//   // ถ้าไม่มีข้อมูลใดๆ
//   if (!weightData || weightData.length === 0) {
//     return (
//       <div className="text-center p-6">
//         <p>ไม่พบข้อมูลความก้าวหน้าในช่วง 90 วันที่ผ่านมา</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       {/* Weight Chart */}
//       <WeightChart 
//         weightData={weightData} 
//         targetWeight={targetWeight} 
//         initialWeight={initialWeight} 
//       />
      
//       {/* Compliance Donut */}
//       <ComplianceDonut compliance={compliance} />
      
//       {/* Latest Metrics */}
//       {latestMetrics && (
//         <Card>
//           <CardHeader>
//             <CardTitle>ข้อมูลล่าสุด</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-3 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-500">น้ำหนัก</p>
//                 <p className="text-xl font-bold">{latestMetrics.weight_kg} กก.</p>
//               </div>
              
//               {latestMetrics.body_fat_percentage && (
//                 <div className="text-center p-3 bg-gray-50 rounded-lg">
//                   <p className="text-sm text-gray-500">ไขมัน</p>
//                   <p className="text-xl font-bold">{latestMetrics.body_fat_percentage}%</p>
//                 </div>
//               )}
              
//               {latestMetrics.muscle_mass_kg && (
//                 <div className="text-center p-3 bg-gray-50 rounded-lg">
//                   <p className="text-sm text-gray-500">มวลกล้ามเนื้อ</p>
//                   <p className="text-xl font-bold">{latestMetrics.muscle_mass_kg} กก.</p>
//                 </div>
//               )}
              
//               {latestMetrics.bmi && (
//                 <div className="text-center p-3 bg-gray-50 rounded-lg">
//                   <p className="text-sm text-gray-500">BMI</p>
//                   <p className="text-xl font-bold">{latestMetrics.bmi.toFixed(1)}</p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// /**
//  * หน้าแสดงความก้าวหน้าของสมาชิก
//  */
// async function ProgressPage({ params }) {
//   const memberId = parseInt(params.id, 10);
  
//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">ความก้าวหน้า</h1>
      
//       <Suspense fallback={<ProgressSkeleton />}>
//         <ProgressData memberId={memberId} />
//       </Suspense>
//     </div>
//   );
// }

// export default ProgressPage;
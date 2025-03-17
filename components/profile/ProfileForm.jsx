// // components/profile/ProfileForm.jsx
// 'use client'

// import { useFormState } from 'react-dom';
// import { useFormStatus } from 'react-dom';

// // SubmitButton component ที่แสดงสถานะการกำลังส่งข้อมูล
// function SubmitButton() {
//   const { pending } = useFormStatus();
  
//   return (
//     <button
//       type="submit"
//       disabled={pending}
//       className={`py-2 px-4 rounded text-white ${
//         pending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
//       }`}
//     >
//       {pending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
//     </button>
//   );
// }

// export function TrainerProfileForm({ trainer, updateAction }) {
//   const initialState = { message: null, success: false };
//   const [state, formAction] = useFormState(updateAction, initialState);
  
//   return (
//     <div>
//       {state.message && (
//         <div className={`p-4 mb-4 rounded ${
//           state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {state.message}
//         </div>
//       )}
      
//       <form action={formAction}>
//         <input type="hidden" name="trainer_id" value={trainer.trainer_id} />
        
//         {/* ฟิลด์อื่นๆ เหมือนในตัวอย่างก่อนหน้า */}
        
//         <SubmitButton />
//       </form>
//     </div>
//   );
// }

// export function MemberProfileForm({ member, updateAction }) {
//   const initialState = { message: null, success: false };
//   const [state, formAction] = useFormState(updateAction, initialState);
  
//   return (
//     <div>
//       {state.message && (
//         <div className={`p-4 mb-4 rounded ${
//           state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {state.message}
//         </div>
//       )}
      
//       <form action={formAction}>
//         <input type="hidden" name="member_id" value={member.member_id} />
        
//         {/* ฟิลด์อื่นๆ เหมือนในตัวอย่างก่อนหน้า */}
        
//         <SubmitButton />
//       </form>
//     </div>
//   );
// }
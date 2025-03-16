// app/member/[id]/profile/page.jsx
import { updateMemberProfile } from '@/actions/member/profile';
import { query } from '@/lib/db';

// ฟังก์ชันสำหรับดึงข้อมูล member
async function getMemberData(memberId) {
  try {
    const members = await query(
      'SELECT * FROM member WHERE member_id = ?',
      [memberId]
    );
    return members[0] || null;
  } catch (error) {
    console.error('Error fetching member data:', error);
    return null;
  }
}

export default async function MemberProfilePage({ params }) {
  const memberId = params.id;
  const member = await getMemberData(memberId);
  
  if (!member) {
    return <div className="p-8">ไม่พบข้อมูลสมาชิก</div>;
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลส่วนตัว</h1>
      
      <form action={updateMemberProfile}>
        <input type="hidden" name="member_id" value={member.member_id} />
        
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-sm font-medium mb-1">ชื่อ</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            defaultValue={member.first_name}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="last_name" className="block text-sm font-medium mb-1">นามสกุล</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            defaultValue={member.last_name}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">อีเมล</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={member.email}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={member.phone || ''}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="date_of_birth" className="block text-sm font-medium mb-1">วันเกิด</label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            defaultValue={member.date_of_birth ? new Date(member.date_of_birth).toISOString().split('T')[0] : ''}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium mb-1">เพศ</label>
          <select
            id="gender"
            name="gender"
            defaultValue={member.gender || ''}
            className="w-full p-2 border rounded"
          >
            <option value="">-- เลือกเพศ --</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
}
// components/profile/TrainerProfileView.jsx
'use client'

export default function TrainerProfileView({ trainer, onEdit }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
            {trainer.trainer_firstname?.charAt(0) || ''}
            {trainer.trainer_lastname?.charAt(0) || ''}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {trainer.trainer_firstname} {trainer.trainer_lastname}
            </h2>
            <p className="text-gray-600">ผู้ฝึกสอน{trainer.trainer_exp ? ` • ${trainer.trainer_exp} ปีประสบการณ์` : ''}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          แก้ไขข้อมูลส่วนตัว
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">อีเมล</h3>
          <p className="text-gray-800">{trainer.trainer_email || '-'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</h3>
          <p className="text-gray-800">{trainer.trainer_phone || '-'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">ประสบการณ์ (ปี)</h3>
          <p className="text-gray-800">{trainer.trainer_exp || '-'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">สถานะ</h3>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trainer.trainer_status === 'active' ? 'bg-green-100 text-green-800' :
              trainer.trainer_status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {trainer.trainer_status === 'active' ? 'ใช้งาน' :
               trainer.trainer_status === 'inactive' ? 'ไม่ใช้งาน' :
               'ลาพัก'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">ประวัติโดยย่อ</h3>
        <p className="text-gray-800 whitespace-pre-line">{trainer.trainer_bio || '-'}</p>
      </div>
    </div>
  );
}
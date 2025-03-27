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
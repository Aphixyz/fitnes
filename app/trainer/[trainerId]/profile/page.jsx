import { getTrainerById } from "@/actions/trainer/profile/getTrainerData";
import ProfileForm from "./ProfileForm";
import ProfileImage from "./ProfileImage";
import PasswordForm from "./PasswordForm";

export default async function TrainerProfilePage({ params }) {
  const { trainerId } = await params;
  const trainer = await getTrainerById(trainerId);

  if (!trainer) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">
          ไม่พบข้อมูลผู้ฝึกสอน
        </h2>
        <p className="text-red-600">
          ไม่สามารถดึงข้อมูลผู้ฝึกสอนได้ กรุณาตรวจสอบและลองใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profile Image Section */}
        <div className="xl:col-span-1">
          <ProfileImage
            currentImage={trainer.trainer_profile_image}
            trainerId={trainer.trainer_id}
            trainerName={`${trainer.trainer_firstname} ${trainer.trainer_lastname}`}
          />

          {/* Password Section */}
          <div className="w-full mt-8">
            <PasswordForm trainerId={trainer.trainer_id} />
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="xl:col-span-2">
          <ProfileForm trainer={trainer} />
        </div>
      </div>
    </div>
  );
}

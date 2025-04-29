"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getTrainerById } from "@/actions/admin/getTrainerById";
import { formatDate, calculateAge, getInitials } from "@/utils/utils";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../_components/common/loadingSpinner";

export default function TrainerDashboard() {
  const params = useParams();
  const { id } = params;

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      setLoading(true);
      const data = await getTrainerById(id);
      setTrainer(data);
      setLoading(false);
    };

    if (id) {
      fetchTrainer();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูล" />;
  }

  if (!trainer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ไม่พบข้อมูลผู้ฝึกสอน
          </h2>
          <p className="text-gray-600">ไม่พบข้อมูลผู้ฝึกสอนที่มี ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          สวัสดี, คุณ {trainer.trainer_firstname} ID : {trainer.trainer_id}
        </h1>
        {/* <p className="text-muted-foreground">
          หน้าทดสอบการแสดงข้อมูลจาก Server Action
        </p> */}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2 flex justify-center mb-4">
              {trainer.trainer_profile_image ? (
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img
                    src={trainer.trainer_profile_image}
                    alt={`${trainer.trainer_firstname} ${trainer.trainer_lastname}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 text-3xl font-bold">
                    {getInitials(
                      trainer.trainer_firstname,
                      trainer.trainer_lastname
                    )}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อผู้ใช้:
              </p>
              <p className="text-lg">{trainer.trainer_username}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อ-นามสกุล:
              </p>
              <p className="text-lg">
                {trainer.trainer_firstname} {trainer.trainer_lastname}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ชื่อเล่น:
              </p>
              <p className="text-lg">{trainer.trainer_nickname || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                อีเมล:
              </p>
              <p className="text-lg">{trainer.trainer_email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                เบอร์โทรศัพท์:
              </p>
              <p className="text-lg">{trainer.trainer_phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">เพศ:</p>
              <p className="text-lg">{trainer.trainer_gender || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                วันเกิด:
              </p>
              <p className="text-lg">
                {trainer.trainer_dob ? formatDate(trainer.trainer_dob) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">อายุ:</p>
              <p className="text-lg">
                {trainer.trainer_dob
                  ? `${calculateAge(trainer.trainer_dob)} ปี`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ประสบการณ์:
              </p>
              <p className="text-lg">
                {trainer.trainer_exp ? `${trainer.trainer_exp} ปี` : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                สถานะ:
              </p>
              <p className="text-lg">
                <span
                  className={`inline-block px-2 py-1 rounded-md text-sm ${
                    trainer.trainer_status === "active"
                      ? "bg-green-100 text-green-800"
                      : trainer.trainer_status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trainer.trainer_status || "-"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      

      <div className="mt-6 bg-indigo-50 p-4 rounded-md">
        <p className="text-indigo-800 text-center font-medium">
          ข้อมูลถูกดึงมาจาก Server Action getTrainerById เรียบร้อย
        </p>
      </div>
    </div>
  );
}

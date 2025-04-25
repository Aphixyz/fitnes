"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { verifyRegistrationParams } from "@/actions/trainer/registration/generateRegistrationLink";
import RegistrationForm from "@/app/register/_components/RegistrationForm";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("trainer");
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState(null);

  useEffect(() => {
    const verifyParams = async () => {
      setVerifying(true);

      if (!trainerId || !token) {
        setError("ลิงก์ลงทะเบียนไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง");
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyRegistrationParams(token, trainerId);

        if (result.success) {
          setTrainerInfo(result.trainer);
        } else {
          setError(result.message || "ลิงก์ลงทะเบียนไม่ถูกต้องหรือหมดอายุแล้ว");
        }
      } catch (error) {
        console.error(error);
        setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ลงทะเบียน");
      } finally {
        setVerifying(false);
      }
    };

    verifyParams();
  }, [trainerId, token]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 border-b">
        <div className="container mx-auto px-4 flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-8 mr-2">
              <div className="absolute inset-0 flex items-center justify-center bg-blue-600 text-white rounded-md">
                <span className="font-bold">F</span>
              </div>
            </div>
            <span className="text-xl font-bold">FitTrack</span>
          </Link>
          <div className="ml-4 pl-4 border-l text-gray-500">
            ลงทะเบียนสมาชิกใหม่
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {verifying ? (
          <div className="max-w-lg mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-6" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="font-bold">ข้อผิดพลาด:</span>
              </div>
              <p>{error}</p>
            </div>
            <div className="mt-6 bg-white p-8 rounded-lg shadow-sm border">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">ไม่สามารถลงทะเบียนได้</h2>
              <p className="text-gray-600 mb-6">
                ลิงก์ลงทะเบียนอาจไม่ถูกต้อง หมดอายุ หรือถูกใช้งานไปแล้ว
                โปรดติดต่อเทรนเนอร์ของคุณเพื่อขอลิงก์ใหม่
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white h-10 px-4 py-2 hover:bg-blue-700"
              >
                กลับสู่หน้าหลัก
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <RegistrationForm trainerId={trainerId} trainerInfo={trainerInfo} />
          </div>
        )}
      </main>
    </div>
  );
}

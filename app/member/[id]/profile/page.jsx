import React from "react";

import { isActiveSubscription } from "@/actions/member/isActiveSubscription.js";
import { getProfileData } from "@/actions/member/getProfileData.js";
import ProfileHeader from "./_components/ProfileHeader";
import ProfileCard from "./_components/ProfileCard";

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ตรวจสอบ subscription ที่ active และดึงช่วงเวลา
  const subscriptionCheck = await isActiveSubscription(memberId);

  if (!subscriptionCheck.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionCheck.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">คุณยังไม่มีสิทธิ์ใช้งานระบบ</p>
          </div>
        </div>
      </div>
    );
  }

  // ดึงข้อมูล Profile รวบรวม
  const profileResult = await getProfileData(memberId);
  
  if (!profileResult.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูล: {profileResult.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { member, goal, registration, health } = profileResult.data;

  // ตรวจสอบความถูกต้องของข้อมูล
  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">ไม่พบข้อมูลสมาชิก</p>
          </div>
        </div>
      </div>
    );
  }

  // สร้างข้อมูลสำหรับ Goal Card subtitle
  const getGoalSubtitle = () => {
    if (goal?.hasActiveGoal && goal?.currentGoal?.type) {
      return goal.currentGoal.type; // ใช้ข้อมูลจาก database โดยตรง (เก็บเป็นภาษาไทยแล้ว)
    }
    return "ยังไม่มีเป้าหมาย";
  };

  // สร้างข้อมูลสำหรับ Package Card subtitle  
  const getPackageSubtitle = () => {
    if (registration?.hasActiveRegistration && registration?.current) {
      const packageName = registration.current.package?.name || 'ไม่ระบุแพ็คเกจ';
      const trainerName = registration.current.trainer?.fullName || 'ไม่มีเทรนเนอร์';
      return `${packageName} - ${trainerName}`;
    }
    return "ยังไม่มีแพ็คเกจ";
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20 w-full flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
      </div>

      {/* Profile Header Section */}
      <ProfileHeader 
        memberData={member}
        memberId={memberId}
      />

      {/* MY PROGRESS Section */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-500 mb-4 tracking-wide">
          MY PROGRESS
        </h2>
        
        <div className="space-y-3">
          {/* My Profile Card */}
          <ProfileCard
            title="โปรไฟล์ของฉัน"
            subtitle="ดูรายละเอียด"
            iconName="User"
            href={`/member/${id}/profile/personalprofile`}
          />

          {/* Goal Card */}
          <ProfileCard
            title="เป้าหมายของฉัน"
            subtitle={getGoalSubtitle()}
            iconName="Target"
            href={`/member/${id}/goal`}
          />

          {/* My Workout Card */}
          <ProfileCard
            title="การออกกำลังกายของฉัน"
            subtitle="ดูประวัติการออกกำลังกาย"
            iconName="Dumbbell"
            href={`/member/${id}/profile/workout`}
          />

          {/* My Nutrition Card */}
          <ProfileCard
            title="โภชนาการของฉัน"
            subtitle="โภชนาการของฉันที่ผ่านมา"
            iconName="Apple"
            href={`/member/${id}/profile/nutrition`}
          />

          {/* My Package & Trainer Card */}
          <ProfileCard
            title="แพ็คเกจ & เทรนเนอร์ของฉัน"
            subtitle={getPackageSubtitle()}
            iconName="Package"
            href={`/member/${id}/profile/package`}
          />
        </div>
      </div>

      {/* PROFILE Section */}
      <div className="px-4 mt-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-500 mb-4 tracking-wide">
          PROFILE
        </h2>
        

      </div>
    </div>
  );
}

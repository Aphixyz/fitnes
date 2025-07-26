import React from "react";
import { getMemberProfile } from "@/actions/member/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, User, MapPin, Edit } from "lucide-react";
import EditProfileForm from "./EditProfileForm";

// Server Component สำหรับแสดงข้อมูลส่วนตัว
export default async function PersonalProfilePage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  // ดึงข้อมูล member จาก server action
  const result = await getMemberProfile(parseInt(id));

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p>{result.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profile = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage
                src={profile.profileImageUrl}
                alt={profile.fullName}
              />
              <AvatarFallback className="text-lg font-semibold bg-white/20">
                {profile.firstName?.charAt(0)}
                {profile.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile.fullName}</h1>
              <p className="text-blue-100 text-sm">@{profile.username}</p>
              {profile.age && (
                <Badge
                  variant="secondary"
                  className="mt-1 bg-white/20 text-white border-0"
                >
                  {profile.age} ปี
                </Badge>
              )}
            </div>
            {/* ปุ่มแก้ไขข้อมูล */}
            <EditProfileForm memberId={memberId} profile={profile} />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="max-w-md mx-auto p-4 -mt-6">
        <Card className="bg-white shadow-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <span>ข้อมูลส่วนตัว</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ชื่อ-นามสกุล */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                <p className="font-medium">{profile.fullName}</p>
              </div>
            </div>

            {/* เพศ */}
            {profile.gender && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">เพศ</p>
                  <p className="font-medium">
                    {profile.gender === "male"
                      ? "ชาย"
                      : profile.gender === "female"
                      ? "หญิง"
                      : "ไม่ระบุ"}
                  </p>
                </div>
              </div>
            )}

            {/* วันเกิด */}
            {profile.dateOfBirth && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">วันเกิด</p>
                  <p className="font-medium">
                    {new Date(profile.dateOfBirth).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-500" />
              <span>ข้อมูลติดต่อ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* อีเมล */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="font-medium break-all">{profile.email}</p>
              </div>
            </div>

            {/* เบอร์โทรศัพท์ */}
            {profile.phone && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member ID */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Member ID: {profile.id}</p>
        </div>
      </div>
    </div>
  );
}

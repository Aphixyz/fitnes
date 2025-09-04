"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, User, Mail, Phone, Calendar, Users, Ruler } from "lucide-react";
import { getMemberProfile } from "@/actions/member/profile";
import { updateMemberProfile, updateMemberHealth } from "@/actions/member/profile";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Profile Card Component
const ProfileCard = ({ icon, title, value, isEditable = false, color = "text-gray-500", bgColor = "bg-gray-100", onClick }) => (
  <div 
    className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mb-3 ${isEditable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    onClick={isEditable ? onClick : undefined}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 ${bgColor} rounded-full`}>
        <div className={`${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
    {isEditable && (
      <ChevronRight className="h-5 w-5 text-gray-400" />
    )}
  </div>
);

export default function PersonalProfilePage({ params }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { id } = await params;
        const result = await getMemberProfile(parseInt(id));
        
        if (result.success) {
          setProfile(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params]);

  const formatDateThai = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    });
  };

  const formatGender = (gender) => {
    if (!gender) return "-";
    return gender === "male" ? "ชาย" : gender === "female" ? "หญิง" : "ไม่ระบุ";
  };

  const formatPhone = (phone) => {
    if (!phone) return "ตั้งค่าเบอร์โทรศัพท์";
    // Format phone number as XXX-XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    
    // Set initial values based on field type
    switch(field) {
      case 'fullName':
        const nameParts = (profile.fullName || '').split(' ');
        setEditValues({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        });
        break;
      case 'email':
        setEditValues({ email: profile.email || '' });
        break;
      case 'phone':
        setEditValues({ phone: profile.phone || '' });
        break;
      case 'dateOfBirth':
        const dateValue = profile.dateOfBirth ? 
          (typeof profile.dateOfBirth === 'string' ? 
            profile.dateOfBirth.split('T')[0] : 
            profile.dateOfBirth) : '';
        setEditValues({ dateOfBirth: dateValue });
        break;
      case 'gender':
        setEditValues({ gender: profile.gender || '' });
        break;
      case 'height':
        setEditValues({ height: profile.latestHeight || profile.height || '' });
        break;
    }
    
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const { id } = await params;
      const memberId = parseInt(id);
      
      // Prepare update data based on field type
      const updateData = new FormData();
      
      switch(editingField) {
        case 'fullName':
          updateData.append('member_firstname', editValues.firstName || '');
          updateData.append('member_lastname', editValues.lastName || '');
          break;
        case 'email':
          updateData.append('member_email', editValues.email || '');
          break;
        case 'phone':
          updateData.append('member_phone', editValues.phone || '');
          break;
        case 'dateOfBirth':
          updateData.append('member_dob', editValues.dateOfBirth || '');
          break;
        case 'gender':
          updateData.append('member_gender', editValues.gender || '');
          break;
        case 'height':
          // Use separate API for height data
          const heightResult = await updateMemberHealth(memberId, editValues.height);
          if (!heightResult.success) {
            console.error('Failed to update height:', heightResult.message);
            return;
          }
          break;
      }
      
      // Call API to update profile (skip for height as it's handled separately)
      let result = { success: true };
      if (editingField !== 'height') {
        result = await updateMemberProfile(memberId, updateData);
      }
      
      if (result.success) {
        // Update local profile state
        setProfile(prev => {
          const updated = { ...prev };
          
          switch(editingField) {
            case 'fullName':
              updated.fullName = `${editValues.firstName} ${editValues.lastName}`.trim();
              break;
            case 'email':
              updated.email = editValues.email;
              break;
            case 'phone':
              updated.phone = editValues.phone;
              break;
            case 'dateOfBirth':
              updated.dateOfBirth = editValues.dateOfBirth;
              break;
            case 'gender':
              updated.gender = editValues.gender;
              break;
            case 'height':
              updated.latestHeight = editValues.height;
              updated.height = editValues.height; // Keep both for compatibility
              break;
          }
          
          return updated;
        });
        
        setIsDrawerOpen(false);
        setEditingField(null);
      } else {
        console.error('Failed to update profile:', result.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-500">{error || "ไม่พบข้อมูลผู้ใช้"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <div className="sticky top-0 z-50 h-20 bg-white border-b border-gray-200 pt-2 items-center justify-center">
        <div className="flex items-center justify-between p-4 h-16">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors items-start justify-start"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">โปรไฟล์ของฉัน</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Info Section */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
            ข้อมูลติดต่อ
          </h2>
          
          <ProfileCard
            icon={<User className="h-5 w-5" />}
            title="ชื่อ-นามสกุล"
            value={profile.fullName || "-"}
            isEditable={true}
            color="text-white"
            bgColor="bg-green-500"
            onClick={() => handleEditClick('fullName')}
          />

          <ProfileCard
            icon={<Mail className="h-5 w-5" />}
            title="อีเมล"
            value={profile.email || "-"}
            isEditable={true}
            color="text-white"
            bgColor="bg-red-500"
            onClick={() => handleEditClick('email')}
          />

          <ProfileCard
            icon={<Phone className="h-5 w-5" />}
            title="เบอร์โทรศัพท์"
            value={formatPhone(profile.phone)}
            isEditable={true}
            color="text-white"
            bgColor="bg-orange-500"
            onClick={() => handleEditClick('phone')}
          />
        </div>

        {/* Personal Info Section */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
            ข้อมูลส่วนตัว
          </h2>

          <ProfileCard
            icon={<Calendar className="h-5 w-5" />}
            title="วันเกิด"
            value={formatDateThai(profile.dateOfBirth)}
            isEditable={true}
            color="text-white"
            bgColor="bg-yellow-500"
            onClick={() => handleEditClick('dateOfBirth')}
          />

          <ProfileCard
            icon={<Users className="h-5 w-5" />}
            title="เพศ"
            value={formatGender(profile.gender)}
            isEditable={true}
            color="text-white"
            bgColor="bg-purple-500"
            onClick={() => handleEditClick('gender')}
          />

          <ProfileCard
            icon={<Ruler className="h-5 w-5" />}
            title="ส่วนสูง"
            value={profile.height ? `${profile.height} ซม.` : "-"}
            isEditable={true}
            color="text-white"
            bgColor="bg-indigo-500"
            onClick={() => handleEditClick('height')}
          />
        </div>
      </div>

      {/* Edit Drawer Modal */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center border-b border-gray-200 pb-4">
            <DrawerTitle className="text-lg font-semibold">
              แก้ไข{editingField === 'fullName' ? 'ชื่อ-นามสกุล' : 
                     editingField === 'email' ? 'อีเมล' :
                     editingField === 'phone' ? 'เบอร์โทรศัพท์' :
                     editingField === 'dateOfBirth' ? 'วันเกิด' :
                     editingField === 'gender' ? 'เพศ' :
                     editingField === 'height' ? 'ส่วนสูง' : ''}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 space-y-6">
            {/* Full Name Editor */}
            {editingField === 'fullName' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                    ชื่อ
                  </Label>
                  <Input
                    id="firstName"
                    value={editValues.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="ใส่ชื่อของคุณ"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                    นามสกุล
                  </Label>
                  <Input
                    id="lastName"
                    value={editValues.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="ใส่นามสกุลของคุณ"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Email Editor */}
            {editingField === 'email' && (
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editValues.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ใส่อีเมลใหม่ของคุณ"
                  className="w-full"
                />
              </div>
            )}

            {/* Phone Editor */}
            {editingField === 'phone' && (
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editValues.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="ใส่เบอร์โทรศัพท์"
                  className="w-full"
                />
              </div>
            )}

            {/* Birth Date Editor */}
            {editingField === 'dateOfBirth' && (
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 mb-2 block">
                  วันเกิด
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editValues.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Gender Editor */}
            {editingField === 'gender' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  เพศ
                </Label>
                <RadioGroup
                  value={editValues.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="male" id="male" className="text-green-500" />
                    <Label htmlFor="male" className="flex-1 cursor-pointer font-medium">
                      ชาย
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="female" id="female" className="text-green-500" />
                    <Label htmlFor="female" className="flex-1 cursor-pointer font-medium">
                      หญิง
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Height Editor */}
            {editingField === 'height' && (
              <div className="text-center py-8">
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-4">
                    <Input
                      id="height"
                      type="number"
                      value={editValues.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="173"
                      className="w-32 h-20 text-center text-5xl font-light border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900"
                      inputMode="numeric"
                      style={{ fontSize: '4rem', fontWeight: '300' }}
                    />
                    <span className="text-2xl font-light text-gray-600">ซม.</span>
                  </div>
                  <div className="w-full h-px bg-gray-300 mt-4 mx-auto max-w-xs"></div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-gray-200 px-6 pb-6">
            <Button 
              onClick={handleSave}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg"
            >
              บันทึก
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
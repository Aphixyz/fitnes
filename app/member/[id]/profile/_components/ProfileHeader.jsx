"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * ProfileHeader Component - แสดงรูปโปรไฟล์และปุ่มเปลี่ยนรูป
 * @param {Object} memberData - ข้อมูลสมาชิก
 * @param {number} memberId - รหัสสมาชิก
 */
export default function ProfileHeader({ 
  memberData, 
  memberId 
}) {
  // Use profileImage from server action, handle both database path and uploaded preview
  const [profilePhoto, setProfilePhoto] = useState(memberData?.profileImage || null);
  const [isPreview, setIsPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // ตรวจสอบว่า path เป็น valid image path หรือไม่
  const isValidImagePath = (path) => {
    return path && 
           typeof path === 'string' && 
           path.trim() !== '' && 
           (path.includes('.jpg') || path.includes('.jpeg') || path.includes('.png') || path.includes('.webp'));
  };

  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `/uploads/${path}`;
  };
  
  // คำนวณตัวอักษรแรกสำหรับ fallback
  const getInitials = () => {
    if (memberData?.fullName) {
      return memberData.fullName.charAt(0).toUpperCase();
    }
    if (memberData?.firstName) {
      return memberData.firstName.charAt(0).toUpperCase();
    }
    return '?';
  };
  
  // ตรวจสอบว่าควรแสดงรูปหรือไม่
  const shouldShowImage = () => {
    return profilePhoto && 
           !imageError && 
           isValidImagePath(profilePhoto) &&
           !isPreview;
  };

  // Effect for cleanup and memberData changes
  useEffect(() => {
    // Reset error state when memberData changes
    setImageError(false);
    
    // Update profile photo if memberData.profileImage changes
    if (memberData?.profileImage !== profilePhoto && !isPreview) {
      setProfilePhoto(memberData?.profileImage || null);
    }
    
    // Cleanup function
    return () => {
      // Clean up any preview URLs when component unmounts
      if (isPreview && profilePhoto && profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(profilePhoto);
      }
    };
  }, [memberData?.profileImage, profilePhoto, isPreview]);

  // Cleanup preview URL when isPreview changes
  useEffect(() => {
    if (!isPreview && profilePhoto && profilePhoto.startsWith('blob:')) {
      URL.revokeObjectURL(profilePhoto);
    }
  }, [isPreview, profilePhoto]);
  
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // ตรวจสอบประเภทและขนาดของไฟล์
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // ไม่เกิน 5MB
        const photoUrl = URL.createObjectURL(file);
        setProfilePhoto(photoUrl);
        setIsPreview(true);
        setImageError(false);
        
        try {
          // TODO: Implement photo upload logic
          console.log('Photo selected:', file.name, 'Size:', file.size, 'Member ID:', memberId);
          // เพื่อใช้ในอนาคต: อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์
          // const formData = new FormData();
          // formData.append('profileImage', file);
          // const result = await uploadProfileImage(memberId, formData);
        } catch (error) {
          console.error('Error handling photo upload:', error);
        }
      } else {
        alert('กรุณาเลือกไฟล์รูปภาพที่มีขนาดไม่เกิน 5MB');
      }
    }
  };

  const handleRemovePhoto = async () => {
    // ลบ preview URL เพื่อป้องกัน memory leak
    if (isPreview && profilePhoto) {
      URL.revokeObjectURL(profilePhoto);
    }
    setProfilePhoto(null);
    setIsPreview(false);
    setImageError(false);
    
    try {
      // TODO: Implement photo removal logic
      console.log('Photo removed for member:', memberId);
      // เพื่อใช้ในอนาคต: ลบรูปภาพจากเซิร์ฟเวอร์
      // const result = await removeProfileImage(memberId);
    } catch (error) {
      console.error('Error handling photo removal:', error);
    }
  };

  return (
    <div className="flex flex-col items-center py-8 bg-white">
      {/* Profile Photo Container */}
      <div className="relative mb-4">
        {/* Main Profile Photo */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
          {isPreview && profilePhoto ? (
            /* Preview uploaded image - ใช้ img สำหรับ blob URL */
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profilePhoto}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  console.warn('Failed to load preview image');
                  setImageError(true);
                }}
              />
            </>
          ) : shouldShowImage() ? (
            // Database image with Next.js Image component
            <Image
              src={getImageSrc(profilePhoto)}
              alt={`${memberData?.fullName || memberData?.firstName || 'Member'} Profile`}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={() => {
                console.warn('Failed to load profile image from database:', profilePhoto);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Profile image loaded successfully:', profilePhoto);
                setImageError(false);
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyb5bt69OqQqBtvNUKofJBeYGU=="
              priority={false}
            />
          ) : (
            // แสดงตัวอักษรเมื่อไม่มีรูปหรือโหลดไม่ได้
            <div className="text-white text-4xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Remove Button (X) - แสดงเฉพาะเมื่อมีรูป */}
        {profilePhoto && (
          <button
            onClick={handleRemovePhoto}
            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Change Photo Button */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="photo-upload"
        />
        <Button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
          asChild
        >
          <label htmlFor="photo-upload" className="cursor-pointer">
            Change Photo
          </label>
        </Button>
      </div>

      {/* Member Name - แสดงชื่อและอีเมลที่มี */}
      {(memberData?.fullName || memberData?.firstName) && (
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {memberData.fullName || `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim()}
          </h2>
          {memberData?.email && (
            <p className="text-sm text-gray-500 mt-1">
              {memberData.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
"use server";

import db from "@/lib/db";

/**
 * Get member progress photos for a specific date
 * @param {number} memberId - Member ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Progress photo data from member_health table
 */
export async function getMemberProgressPhotos(memberId, date) {
  if (!memberId || !date) {
    throw new Error("กรุณาระบุรหัสสมาชิกและวันที่");
  }

  try {
    // Get progress photos from member_health table for the specific date
    const [progressPhotosResult] = await db.query(
      `SELECT 
         member_health_id,
         member_id,
         member_health_measurementdate,
         photo_front,
         photo_side,
         photo_back,
         member_health_weight,
         member_health_bodyfat
       FROM member_health 
       WHERE member_id = ? AND member_health_measurementdate = ?
       ORDER BY member_health_id DESC
       LIMIT 1`,
      [memberId, date]
    );

    if (!progressPhotosResult || progressPhotosResult.length === 0) {
      return {
        success: true,
        data: {
          date,
          hasProgressPhotos: false,
          photos: {},
          photoCount: 0,
          angles: []
        }
      };
    }

    const photoData = progressPhotosResult[0];
    
    // Process photo data
    const photos = {};
    const angles = [];
    let photoCount = 0;

    // Check each photo type and build the photo object
    if (photoData.photo_front) {
      photos.front = photoData.photo_front;
      angles.push('front');
      photoCount++;
    }
    
    if (photoData.photo_side) {
      photos.side = photoData.photo_side;
      angles.push('side');
      photoCount++;
    }
    
    if (photoData.photo_back) {
      photos.back = photoData.photo_back;
      angles.push('back');
      photoCount++;
    }

    return {
      success: true,
      data: {
        date,
        hasProgressPhotos: photoCount > 0,
        memberHealthId: photoData.member_health_id,
        measurementDate: photoData.member_health_measurementdate,
        photos,
        photoCount,
        angles,
        additionalData: {
          weight: photoData.member_health_weight,
          bodyFat: photoData.member_health_bodyfat
        }
      }
    };
  } catch (error) {
    console.error("Error fetching member progress photos:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการโหลดข้อมูลรูปภาพความคืบหน้า",
      data: null
    };
  }
}
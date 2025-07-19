"use server";

import pool from "@/lib/db";

// ===== Get Progress Photos Function =====
export const getProgressPhotos = async (memberId, date = null) => {
    try {
      let query = `
        SELECT 
          member_health_id,
          member_health_measurementdate,
          photo_front,
          photo_side,
          photo_back
        FROM member_health 
        WHERE member_id = ?
      `;
  
      const params = [memberId];
  
      if (date) {
        query += " AND member_health_measurementdate = ?";
        params.push(date);
      }
  
      query += " ORDER BY member_health_measurementdate DESC";
  
      const [rows] = await pool.execute(query, params);
  
      return {
        success: true,
        data: rows,
      };
    } catch (error) {
      console.error("Error getting progress photos:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ",
      };
    }
  };
  
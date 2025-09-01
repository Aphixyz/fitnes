"use server";

import pool from "@/lib/db";

// ===== Fetch Member Personal Info for Trainer =====
// ดึงข้อมูลส่วนตัวครบถ้วนของ Member สำหรับ Trainer ดู
export async function fetchMemberPersonalInfo(memberId) {
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    // ดึงข้อมูลส่วนตัวครบถ้วนของ member
    const [memberData] = await pool.execute(
      `
      SELECT 
        -- ข้อมูลพื้นฐานจาก member table
        m.member_id,
        m.member_firstname,
        m.member_lastname,
        m.member_email,
        m.member_phone,
        m.member_gender,
        m.member_dob,
        m.member_profileimage,
        
        -- ข้อมูลสุขภาพล่าสุดจาก member_health table
        mh.member_health_height,
        mh.member_health_weight,
        mh.member_activity_level,
        mh.member_health_condition,
        mh.member_health_measurementdate,
        
        -- ข้อมูลเป้าหมายปัจจุบันจาก fitness_goal table
        fg.fitness_goal_type,
        fg.fitness_training_frequency,
        fg.fitness_experience_level,
        fg.fitness_goal_targetweight,
        fg.fitness_training_time,
        fg.fitness_goal_startdate,
        fg.fitness_goal_enddate,
        
        -- ข้อมูลการลงทะเบียนจาก registration table
        r.registration_startdate,
        r.registration_enddate
      FROM member m
      
      -- JOIN กับ member_health เพื่อดึงข้อมูลสุขภาพล่าสุด
      LEFT JOIN (
        SELECT 
          member_id,
          member_health_height,
          member_health_weight,
          member_activity_level,
          member_health_condition,
          member_health_measurementdate,
          ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY member_health_measurementdate DESC) as rn
        FROM member_health
      ) mh ON m.member_id = mh.member_id AND mh.rn = 1
      
      -- JOIN กับ fitness_goal เพื่อดึงเป้าหมายปัจจุบัน
      LEFT JOIN fitness_goal fg ON m.member_id = fg.member_id 
        AND fg.fitness_goal_status = 'active'
      
      -- JOIN กับ registration เพื่อดึงข้อมูลการลงทะเบียน
      LEFT JOIN registration r ON m.member_id = r.member_id
        AND r.registration_status = 'active'
      
      WHERE m.member_id = ?
      ORDER BY fg.create_at DESC
      LIMIT 1
    `,
      [memberId]
    );

    if (memberData.length === 0) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    const data = memberData[0];

    // คำนวณอายุจากวันเกิด
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    // คำนวณ BMI
    const calculateBMI = (weight, height) => {
      if (!weight || !height) return null;
      const heightInMeters = height / 100;
      return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    };

    // จัดรูปแบบข้อมูลก่อนส่งกลับ
    const formattedData = {
      // ข้อมูลพื้นฐาน
      member_id: data.member_id,
      member_firstname: data.member_firstname,
      member_lastname: data.member_lastname,
      full_name: `${data.member_firstname} ${data.member_lastname}`,
      member_email: data.member_email,
      member_phone: data.member_phone,
      member_gender: data.member_gender,
      member_dob: data.member_dob,
      member_age: calculateAge(data.member_dob),
      member_profileimage: data.member_profileimage,
      
      // ข้อมูลร่างกายและสุขภาพ
      member_health_height: data.member_health_height,
      member_health_weight: data.member_health_weight,
      calculated_bmi: calculateBMI(data.member_health_weight, data.member_health_height),
      member_activity_level: data.member_activity_level,
      member_health_condition: data.member_health_condition,
      member_health_measurementdate: data.member_health_measurementdate,
      
      // ข้อมูลเป้าหมาย
      fitness_goal_type: data.fitness_goal_type,
      fitness_training_frequency: data.fitness_training_frequency,
      fitness_experience_level: data.fitness_experience_level,
      fitness_goal_targetweight: data.fitness_goal_targetweight,
      fitness_training_time: data.fitness_training_time,
      fitness_goal_startdate: data.fitness_goal_startdate,
      fitness_goal_enddate: data.fitness_goal_enddate,
      
      // ข้อมูลการลงทะเบียน
      registration_startdate: data.registration_startdate,
      registration_enddate: data.registration_enddate,
    };

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching member personal info:", error);
    return {
      success: false,
      error: "Failed to fetch member personal information",
    };
  }
}
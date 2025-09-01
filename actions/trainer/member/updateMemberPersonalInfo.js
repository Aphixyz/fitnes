"use server";

import pool from "@/lib/db";

// ===== Update Member Personal Info =====
// อัปเดตข้อมูลส่วนตัวของ Member โดย Trainer
export async function updateMemberPersonalInfo(memberId, updateData) {
  const connection = await pool.getConnection();
  
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    await connection.beginTransaction();

    // 1. อัปเดตข้อมูลพื้นฐานในตาราง member
    if (updateData.basicInfo) {
      const {
        member_firstname,
        member_lastname,
        member_email,
        member_phone,
        member_gender,
        member_dob,
        member_profileimage
      } = updateData.basicInfo;

      const basicInfoFields = [];
      const basicInfoValues = [];

      if (member_firstname !== undefined) {
        basicInfoFields.push("member_firstname = ?");
        basicInfoValues.push(member_firstname);
      }
      if (member_lastname !== undefined) {
        basicInfoFields.push("member_lastname = ?");
        basicInfoValues.push(member_lastname);
      }
      if (member_email !== undefined) {
        basicInfoFields.push("member_email = ?");
        basicInfoValues.push(member_email);
      }
      if (member_phone !== undefined) {
        basicInfoFields.push("member_phone = ?");
        basicInfoValues.push(member_phone);
      }
      if (member_gender !== undefined) {
        basicInfoFields.push("member_gender = ?");
        basicInfoValues.push(member_gender);
      }
      if (member_dob !== undefined) {
        basicInfoFields.push("member_dob = ?");
        basicInfoValues.push(member_dob);
      }
      if (member_profileimage !== undefined) {
        basicInfoFields.push("member_profileimage = ?");
        basicInfoValues.push(member_profileimage);
      }

      if (basicInfoFields.length > 0) {
        const updateBasicQuery = `
          UPDATE member 
          SET ${basicInfoFields.join(", ")}
          WHERE member_id = ?
        `;
        basicInfoValues.push(memberId);
        
        await connection.execute(updateBasicQuery, basicInfoValues);
      }
    }

    // 2. อัปเดตข้อมูลสุขภาพในตาราง member_health
    if (updateData.healthInfo) {
      const {
        member_health_height,
        member_health_weight,
        member_activity_level,
        member_health_condition
      } = updateData.healthInfo;

      // ตรวจสอบว่ามีข้อมูลสุขภาพล่าสุดหรือไม่
      const [existingHealth] = await connection.execute(
        `SELECT member_health_id 
         FROM member_health 
         WHERE member_id = ? 
         ORDER BY member_health_measurementdate DESC 
         LIMIT 1`,
        [memberId]
      );

      if (existingHealth.length > 0) {
        // อัปเดตข้อมูลสุขภาพที่มีอยู่
        const healthFields = [];
        const healthValues = [];

        if (member_health_height !== undefined) {
          healthFields.push("member_health_height = ?");
          healthValues.push(member_health_height);
        }
        if (member_health_weight !== undefined) {
          healthFields.push("member_health_weight = ?");
          healthValues.push(member_health_weight);
        }
        if (member_activity_level !== undefined) {
          healthFields.push("member_activity_level = ?");
          healthValues.push(member_activity_level);
        }
        if (member_health_condition !== undefined) {
          healthFields.push("member_health_condition = ?");
          healthValues.push(member_health_condition);
        }

        if (healthFields.length > 0) {
          // อัปเดตวันที่วัดเป็นวันปัจจุบันด้วย
          healthFields.push("member_health_measurementdate = CURDATE()");
          
          const updateHealthQuery = `
            UPDATE member_health 
            SET ${healthFields.join(", ")}
            WHERE member_health_id = ?
          `;
          healthValues.push(existingHealth[0].member_health_id);
          
          await connection.execute(updateHealthQuery, healthValues);
        }
      } else {
        // สร้างข้อมูลสุขภาพใหม่
        await connection.execute(
          `INSERT INTO member_health (
            member_id, 
            member_health_height, 
            member_health_weight, 
            member_activity_level, 
            member_health_condition, 
            member_health_measurementdate
          ) VALUES (?, ?, ?, ?, ?, CURDATE())`,
          [
            memberId,
            member_health_height || null,
            member_health_weight || null,
            member_activity_level || null,
            member_health_condition || null
          ]
        );
      }
    }

    // 3. อัปเดตข้อมูลเป้าหมายในตาราง fitness_goal
    if (updateData.goalInfo) {
      const {
        fitness_goal_type,
        fitness_training_frequency,
        fitness_experience_level,
        fitness_goal_targetweight,
        fitness_training_time,
        fitness_goal_startdate,
        fitness_goal_enddate
      } = updateData.goalInfo;

      // ตรวจสอบว่ามีเป้าหมายที่ active อยู่หรือไม่
      const [existingGoal] = await connection.execute(
        `SELECT fitness_goal_id 
         FROM fitness_goal 
         WHERE member_id = ? AND fitness_goal_status = 'active' 
         LIMIT 1`,
        [memberId]
      );

      if (existingGoal.length > 0) {
        // อัปเดตเป้าหมายที่มีอยู่
        const goalFields = [];
        const goalValues = [];

        if (fitness_goal_type !== undefined) {
          goalFields.push("fitness_goal_type = ?");
          goalValues.push(fitness_goal_type);
        }
        if (fitness_training_frequency !== undefined) {
          goalFields.push("fitness_training_frequency = ?");
          goalValues.push(fitness_training_frequency);
        }
        if (fitness_experience_level !== undefined) {
          goalFields.push("fitness_experience_level = ?");
          goalValues.push(fitness_experience_level);
        }
        if (fitness_goal_targetweight !== undefined) {
          goalFields.push("fitness_goal_targetweight = ?");
          goalValues.push(fitness_goal_targetweight);
        }
        if (fitness_training_time !== undefined) {
          goalFields.push("fitness_training_time = ?");
          goalValues.push(fitness_training_time);
        }
        if (fitness_goal_startdate !== undefined) {
          goalFields.push("fitness_goal_startdate = ?");
          goalValues.push(fitness_goal_startdate);
        }
        if (fitness_goal_enddate !== undefined) {
          goalFields.push("fitness_goal_enddate = ?");
          goalValues.push(fitness_goal_enddate);
        }

        if (goalFields.length > 0) {
          // อัปเดตวันที่แก้ไข
          goalFields.push("update_at = CURRENT_TIMESTAMP");
          
          const updateGoalQuery = `
            UPDATE fitness_goal 
            SET ${goalFields.join(", ")}
            WHERE fitness_goal_id = ?
          `;
          goalValues.push(existingGoal[0].fitness_goal_id);
          
          await connection.execute(updateGoalQuery, goalValues);
        }
      } else {
        // สร้างเป้าหมายใหม่ (ถ้ามีข้อมูลเป้าหมายส่งมา)
        if (fitness_goal_type || fitness_goal_targetweight || fitness_goal_startdate) {
          await connection.execute(
            `INSERT INTO fitness_goal (
              member_id,
              fitness_goal_type,
              fitness_training_frequency,
              fitness_experience_level,
              fitness_goal_targetweight,
              fitness_training_time,
              fitness_goal_startdate,
              fitness_goal_enddate,
              fitness_goal_status,
              create_at,
              update_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              memberId,
              fitness_goal_type || null,
              fitness_training_frequency || null,
              fitness_experience_level || null,
              fitness_goal_targetweight || null,
              fitness_training_time || null,
              fitness_goal_startdate || null,
              fitness_goal_enddate || null
            ]
          );
        }
      }
    }

    await connection.commit();

    return {
      success: true,
      message: "อัปเดตข้อมูลส่วนตัวสำเร็จ",
    };

  } catch (error) {
    await connection.rollback();
    console.error("Error updating member personal info:", error);
    
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว",
      details: error.message,
    };
  } finally {
    connection.release();
  }
}

// ===== Update Member Profile Image =====
// อัปเดตรูปโปรไฟล์ของ Member
export async function updateMemberProfileImage(memberId, profileImageUrl) {
  try {
    if (!memberId || !profileImageUrl) {
      return {
        success: false,
        error: "Member ID and profile image URL are required",
      };
    }

    await pool.execute(
      `UPDATE member 
       SET member_profileimage = ? 
       WHERE member_id = ?`,
      [profileImageUrl, memberId]
    );

    return {
      success: true,
      message: "อัปเดตรูปโปรไฟล์สำเร็จ",
    };

  } catch (error) {
    console.error("Error updating member profile image:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์",
    };
  }
}

// ===== Validate Member Data =====
// ตรวจสอบความถูกต้องของข้อมูลก่อนอัปเดต
export async function validateMemberPersonalInfo(updateData) {
  const errors = [];

  // ตรวจสอบข้อมูลพื้นฐาน
  if (updateData.basicInfo) {
    const { member_email, member_phone, member_dob } = updateData.basicInfo;

    // ตรวจสอบรูปแบบอีเมล
    if (member_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member_email)) {
      errors.push("รูปแบบอีเมลไม่ถูกต้อง");
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (เบอร์ไทย)
    if (member_phone && !/^[0-9]{9,10}$/.test(member_phone.replace(/[-\s]/g, ""))) {
      errors.push("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
    }

    // ตรวจสอบวันเกิด (ต้องไม่เป็นอนาคต)
    if (member_dob && new Date(member_dob) > new Date()) {
      errors.push("วันเกิดไม่สามารถเป็นวันในอนาคตได้");
    }
  }

  // ตรวจสอบข้อมูลสุขภาพ
  if (updateData.healthInfo) {
    const { 
      member_health_height, 
      member_health_weight, 
      member_activity_level 
    } = updateData.healthInfo;

    // ตรวจสอบส่วนสูง (30-300 ซม.)
    if (member_health_height && (member_health_height < 30 || member_health_height > 300)) {
      errors.push("ส่วนสูงต้องอยู่ระหว่าง 30-300 ซม.");
    }

    // ตรวจสอบน้ำหนัก (1-500 กก.)
    if (member_health_weight && (member_health_weight < 1 || member_health_weight > 500)) {
      errors.push("น้ำหนักต้องอยู่ระหว่าง 1-500 กก.");
    }

    // ตรวจสอบระดับกิจกรรม (1-5)
    if (member_activity_level && (member_activity_level < 1 || member_activity_level > 5)) {
      errors.push("ระดับกิจกรรมต้องอยู่ระหว่าง 1-5");
    }
  }

  // ตรวจสอบข้อมูลเป้าหมาย
  if (updateData.goalInfo) {
    const { 
      fitness_training_frequency,
      fitness_goal_targetweight,
      fitness_goal_startdate,
      fitness_goal_enddate
    } = updateData.goalInfo;

    // ตรวจสอบความถี่การฝึก (1-7 ครั้ง/สัปดาห์)
    if (fitness_training_frequency && (fitness_training_frequency < 1 || fitness_training_frequency > 7)) {
      errors.push("ความถี่การฝึกต้องอยู่ระหว่าง 1-7 ครั้งต่อสัปดาห์");
    }

    // ตรวจสอบน้ำหนักเป้าหมาย
    if (fitness_goal_targetweight && (fitness_goal_targetweight < 1 || fitness_goal_targetweight > 500)) {
      errors.push("น้ำหนักเป้าหมายต้องอยู่ระหว่าง 1-500 กก.");
    }

    // ตรวจสอบวันที่เป้าหมาย
    if (fitness_goal_startdate && fitness_goal_enddate) {
      if (new Date(fitness_goal_startdate) >= new Date(fitness_goal_enddate)) {
        errors.push("วันสิ้นสุดเป้าหมายต้องมาหลังวันเริ่มต้น");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
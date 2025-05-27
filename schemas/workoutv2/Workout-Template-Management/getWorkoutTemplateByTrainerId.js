'use server'

import db from '@/lib/db';

/**
 * ดึงข้อมูลเทมเพลตโปรแกรมการออกกำลังกายทั้งหมดที่สร้างโดยเทรนเนอร์คนนี้
 * @param {number} trainerId - รหัสเทรนเนอร์
 * @param {boolean} includePublic - รวมเทมเพลตสาธารณะของเทรนเนอร์อื่นด้วยหรือไม่
 * @returns {Promise<Object>} ผลลัพธ์การดึงข้อมูล
 */
export async function getWorkoutTemplateByTrainerId(trainerId, includePublic = false) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId) {
      throw new Error('กรุณาระบุรหัสเทรนเนอร์');
    }

    // สร้าง query สำหรับดึงข้อมูลเทมเพลต
    let query = `
      SELECT 
        wt.template_id,
        wt.trainer_id,
        wt.template_name,
        wt.description,
        wt.difficulty_level,
        wt.is_public,
        wt.created_at,
        tr.trainer_firstname,
        tr.trainer_lastname,
        COUNT(DISTINCT ts.session_id) AS session_count,
        COUNT(te.template_exercise_id) AS exercise_count
      FROM 
        workout_template wt
      LEFT JOIN 
        trainer tr ON wt.trainer_id = tr.trainer_id
      LEFT JOIN 
        template_session ts ON wt.template_id = ts.template_id
      LEFT JOIN 
        template_exercise te ON ts.session_id = te.session_id
    `;
    
    const params = [];
    
    if (includePublic) {
      // ดึงเทมเพลตของเทรนเนอร์นี้ และเทมเพลตสาธารณะที่สร้างโดยเทรนเนอร์อื่น
      query += ` WHERE wt.trainer_id = ? OR wt.is_public = 1`;
      params.push(trainerId);
    } else {
      // ดึงเฉพาะเทมเพลตของเทรนเนอร์นี้
      query += ` WHERE wt.trainer_id = ?`;
      params.push(trainerId);
    }
    
    // กำหนดการจัดกลุ่มและเรียงลำดับ
    query += ` 
      GROUP BY 
        wt.template_id
      ORDER BY 
        wt.created_at DESC
    `;
    
    // ดึงข้อมูล
    const [templates] = await db.query(query, params);
    
    // แปลงข้อมูลเป็นรูปแบบที่เหมาะสม
    const formattedTemplates = templates.map(template => ({
      ...template,
      trainer_name: `${template.trainer_firstname || ''} ${template.trainer_lastname || ''}`.trim(),
      is_own_template: template.trainer_id === Number(trainerId)
    }));
    
    // ดึงข้อมูลเพิ่มเติมสำหรับแต่ละเทมเพลต
    const templatesWithDetails = await Promise.all(
      formattedTemplates.map(async (template) => {
        // ดึงข้อมูลกลุ่มกล้ามเนื้อที่เกี่ยวข้อง
        const [muscleGroups] = await db.query(`
          SELECT DISTINCT 
            e.muscle_groups
          FROM 
            template_session ts
          JOIN 
            template_exercise te ON ts.session_id = te.session_id
          JOIN 
            exercises e ON te.exercise_id = e.id
          WHERE 
            ts.template_id = ?
        `, [template.template_id]);
        
        // รวมกลุ่มกล้ามเนื้อที่ไม่ซ้ำกัน
        const uniqueMuscleGroups = new Set();
        muscleGroups.forEach(item => {
          if (item.muscle_groups) {
            const groups = item.muscle_groups.split(',');
            groups.forEach(group => uniqueMuscleGroups.add(group.trim()));
          }
        });
        
        return {
          ...template,
          target_muscles: Array.from(uniqueMuscleGroups)
        };
      })
    );
    
    return {
      success: true,
      templates: templatesWithDetails
    };
  } catch (error) {
    console.error('Error fetching workout templates by trainer ID:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเทมเพลตโปรแกรมการออกกำลังกาย'
    };
  }
}
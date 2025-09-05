/**
 * Date utility functions เพื่อจัดการปัญหา timezone
 */

/**
 * แปลง Date object เป็น string รูปแบบ YYYY-MM-DD โดยใช้ local timezone
 * แก้ไขปัญหาการใช้ toISOString() ที่จะแปลงเป็น UTC ทำให้วันที่เพี้ยน
 * 
 * @param {Date} date - Date object
 * @returns {string} วันที่ในรูปแบบ YYYY-MM-DD
 */
export function formatDateToLocalString(date) {
  if (!date || !(date instanceof Date)) {
    return new Date().toLocaleDateString('sv-SE'); // fallback ใช้ format sv-SE (YYYY-MM-DD)
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * แปลง Date object เป็น string สำหรับ database
 * ใช้สำหรับบันทึกวันที่ลงฐานข้อมูลโดยไม่มีปัญหา timezone
 * 
 * @param {Date} date - Date object
 * @returns {string} วันที่ในรูปแบบ YYYY-MM-DD
 */
export function formatDateForDatabase(date = new Date()) {
  return formatDateToLocalString(date);
}

/**
 * ตรวจสอบว่าวันที่เป็นวันนี้หรือไม่ (เปรียบเทียบเฉพาะวันที่ ไม่รวมเวลา)
 * 
 * @param {Date} date - วันที่ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้าเป็นวันนี้
 */
export function isToday(date) {
  const today = new Date();
  return formatDateToLocalString(date) === formatDateToLocalString(today);
}

/**
 * สร้าง Date object จาก string โดยใช้ local timezone
 * แก้ไขปัญหาการ parse วันที่ที่อาจเพี้ยนเนื่องจาก timezone
 * 
 * @param {string|Date} dateInput - วันที่ในรูปแบบ YYYY-MM-DD หรือ Date object
 * @returns {Date} Date object
 */
export function parseDateFromString(dateInput) {
  if (!dateInput) return new Date();
  
  // ถ้าเป็น Date object อยู่แล้ว ให้ return กลับไป
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  // ถ้าไม่ใช่ string ให้แปลงเป็น string ก่อน
  const dateString = String(dateInput);
  
  // ตรวจสอบรูปแบบ YYYY-MM-DD
  if (!dateString.includes('-')) {
    // ถ้าไม่ใช่รูปแบบ YYYY-MM-DD ให้ใช้ new Date() แปลง
    return new Date(dateString);
  }
  
  // แยกส่วน YYYY-MM-DD และสร้าง Date object โดยใช้ local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month เป็น 0-based
}

/**
 * ฟอร์แมทวันที่เป็นภาษาไทยแบบย่อ (เช่น "ก.ย. 05")
 * แก้ไขปัญหา timezone โดยใช้ parseDateFromString แทน new Date()
 * 
 * @param {string|Date} dateInput - วันที่ในรูปแบบ YYYY-MM-DD หรือ Date object
 * @returns {string} วันที่ในรูปแบบภาษาไทย
 */
export function formatThaiDateShort(dateInput) {
  if (!dateInput) return '-';
  
  try {
    const date = parseDateFromString(dateInput);
    
    // ตรวจสอบว่าเป็น valid date หรือไม่
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    
    return `${month} ${day}`;
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return '-';
  }
}
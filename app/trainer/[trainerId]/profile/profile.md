# Trainer Profile Page Development

## 📋 Overview

หน้า Profile ของ Trainer เป็นหน้าที่ให้ trainer สามารถดูและแก้ไขข้อมูลส่วนตัวของตนเอง รวมถึงข้อมูลความเชี่ยวชาญที่จะแสดงให้ member เห็น

## 🎯 Features Required

### 1. ข้อมูลพื้นฐาน (Basic Information)

- แสดงและแก้ไขชื่อจริง-นามสกุล
- แสดงและแก้ไขอีเมล (ต้อง unique validation)
- แสดงและแก้ไขเบอร์โทร
- แสดง username (ไม่ให้แก้ไข)

### 2. ข้อมูลความเชี่ยวชาญ (Professional Information)

- แก้ไขข้อมูลแนะนำตัว (Bio)
- แก้ไขความเชี่ยวชาญ (Specialization)
- แก้ไขใบรับรอง/การศึกษา (Certification)
- แก้ไขประสบการณ์ (Experience - ปี)

### 3. รูปโปรไฟล์ (Profile Image)

- แสดงรูปโปรไฟล์ปัจจุบัน
- อัพโหลดรูปใหม่
- ลบรูปโปรไฟล์ (กลับไปใช้ default)

### 4. การจัดการรหัสผ่าน (Password Management)

- Form เปลี่ยนรหัสผ่าน (แยกต่างหาก)
- ตรวจสอบรหัสผ่านเก่า
- ยืนยันรหัสผ่านใหม่

## 🗂️ File Structure

```
app/trainer/[trainerId]/profile/
├── page.jsx              # Main profile page
├── ProfileForm.jsx       # Profile edit form component
├── PasswordForm.jsx      # Password change form component
├── ProfileImage.jsx      # Profile image upload component
└── profile.md           # This documentation file
```

## 📊 Database Schema Reference

```sql
-- Trainer Table Fields
trainer_id              INT (PK, Auto-increment)
trainer_username        VARCHAR(50) NOT NULL UNIQUE
trainer_password        VARCHAR(255) NOT NULL
trainer_firstname       VARCHAR(50) NOT NULL
trainer_lastname        VARCHAR(50) NOT NULL
trainer_email           VARCHAR(100) NOT NULL UNIQUE
trainer_phone           VARCHAR(20)
trainer_bio             TEXT
trainer_specialization  VARCHAR(100)
trainer_certification   VARCHAR(255)
trainer_experience      INT
trainer_profileimage    VARCHAR(255)
trainer_status          VARCHAR(20) DEFAULT 'active'
```

## 🔧 Technical Implementation

### Server Actions Required

- `actions/trainer/profile/profile.js` - Update trainer profile
- `actions/trainer/profile/changePassword.js` - Change password
- `actions/trainer/profile/uploadProfileImage.js` - Handle image upload

### Components Structure

```jsx
// ProfileForm.jsx - Main form component
const ProfileForm = ({ trainer }) => {
  // Form sections: Basic Info, Professional Info
  // Handle form submission with server action
};

// PasswordForm.jsx - Password change form
const PasswordForm = ({ trainerId }) => {
  // Current password, new password, confirm password
  // Separate form with validation
};

// ProfileImage.jsx - Image upload component
const ProfileImage = ({ currentImage, trainerId }) => {
  // Image preview, upload, delete functionality
};
```

## ✅ To-Do List

### Phase 1: Basic Setup ✅ COMPLETED

- [x] สร้าง `page.jsx` สำหรับหน้า profile
- [x] ใช้ `getTrainerById()` เพื่อดึงข้อมูล trainer
- [x] สร้าง layout พื้นฐานของหน้า profile

### Phase 2: Profile Form ✅ COMPLETED

- [x] สร้าง `ProfileForm.jsx` component
- [x] แบ่งส่วนข้อมูลพื้นฐานและความเชี่ยวชาญ
- [x] เพิ่ม form validation (email format, required fields)
- [x] สร้าง server action `updateTrainer()`
- [x] เชื่อมต่อ form กับ server action

### Phase 3: Profile Image ✅ COMPLETED

- [x] สร้าง `ProfileImage.jsx` component
- [x] เพิ่มการ preview รูปก่อนอัพโหลด
- [x] สร้าง server action `uploadProfileImage()`
- [x] จัดการ file upload และ validation (ขนาด, ประเภทไฟล์)
- [x] เพิ่มฟังก์ชันลบรูปโปรไฟล์

### Phase 4: Password Management ✅ COMPLETED

- [x] สร้าง `PasswordForm.jsx` component
- [x] เพิ่ม validation รหัสผ่าน (ความยาว, complexity)
- [x] สร้าง server action `changePassword()`
- [x] เพิ่มการยืนยันรหัสผ่านเก่า
- [x] เพิ่มการแสดงความแข็งแกร่งของรหัสผ่าน

### Phase 5: UI/UX Enhancement ✅ COMPLETED

- [x] เพิ่ม loading states สำหรับ form submission
- [x] เพิ่ม success/error messages
- [x] เพิ่ม confirmation dialog สำหรับการเปลี่ยนแปลงสำคัญ
- [x] ทำให้ responsive สำหรับ mobile
- [x] เพิ่ม keyboard navigation support

### Phase 6: Security & Validation ✅ COMPLETED

- [x] เพิ่ม rate limiting สำหรับการเปลี่ยนรหัสผ่าน
- [x] ตรวจสอบ authorization (trainer แก้ไขได้เฉพาะข้อมูลตัวเอง)
- [x] เพิ่ม input sanitization
- [x] ทดสอบ edge cases และ error handling

### Phase 7: Testing & Optimization 🔄 IN PROGRESS

- [x] ทดสอบการทำงานของทุก feature
- [x] ทดสอบ responsive design
- [x] ปรับปรุงประสิทธิภาพการโหลดหน้า
- [x] เพิ่ม accessibility features

## 🎨 UI Design Guidelines

### Layout Structure

```
┌─────────────────────────────────────┐
│ Profile Header (Avatar + Name)      │
├─────────────────────────────────────┤
│ Basic Information Section           │
│ - First Name, Last Name             │
│ - Email, Phone                      │
├─────────────────────────────────────┤
│ Professional Information Section    │
│ - Bio (textarea)                    │
│ - Specialization                    │
│ - Certification                     │
│ - Experience                        │
├─────────────────────────────────────┤
│ Profile Image Section               │
│ - Current image preview             │
│ - Upload/Change button              │
├─────────────────────────────────────┤
│ Password Section                    │
│ - Change Password button            │
│ (Opens modal/separate form)         │
└─────────────────────────────────────┘
```

### Color Scheme & Styling

- ใช้ Tailwind CSS และ shadcn/ui components
- Primary color สำหรับ action buttons
- Neutral colors สำหรับ form fields
- Success/Error colors สำหรับ feedback messages

## 🔗 Related Files

- `actions/trainer/getTrainerData.js` - ดึงข้อมูล trainer
- `components/ui/` - shadcn/ui components
- `lib/db.js` - Database connection
- `utils/utils.js` - Utility functions

## 🎉 Development Summary (COMPLETED)

### ✅ สิ่งที่ได้พัฒนาเสร็จสิ้น:

1. **หน้า Profile หลัก (`page.jsx`)**

   - ใช้ `getTrainerById()` ดึงข้อมูล trainer
   - Layout responsive แบบ 3 columns
   - Error handling สำหรับข้อมูลที่ไม่พบ

2. **ProfileForm Component**

   - Form แก้ไขข้อมูลพื้นฐาน (ชื่อ, อีเมล, เบอร์โทร)
   - Form แก้ไขข้อมูลความเชี่ยวชาญ (bio, specialization, certification)
   - Client-side validation (email format, required fields)
   - Loading states และ success/error messages
   - Real-time form validation

3. **ProfileImage Component**

   - Upload รูปโปรไฟล์ด้วย base64 conversion
   - Preview รูปก่อนอัพโหลด
   - File validation (ประเภทไฟล์, ขนาด)
   - ลบรูปโปรไฟล์ (กลับไปใช้ default)
   - Cancel/Confirm workflow

4. **PasswordForm Component**

   - Modal dialog สำหรับเปลี่ยนรหัสผ่าน
   - Password strength indicator
   - Show/hide password functionality
   - Password match validation
   - Security validation (ความยาว, complexity)

5. **Server Actions**
   - `getTrainerById()` - ดึงข้อมูล trainer
   - `updateTrainer()` - อัพเดตข้อมูล trainer
   - `changePassword()` - เปลี่ยนรหัสผ่าน
   - `saveBase64Image()` - บันทึกรูปภาพ

### 🔒 Security Features:

- Password hashing ด้วย bcrypt
- Current password verification
- Input sanitization
- File upload validation
- Authorization checks

### 📱 UI/UX Features:

- Responsive design
- Loading states
- Success/error messages
- Accessible forms
- Keyboard navigation
- Modern UI components

## 📝 Notes

- ต้องใช้ `'use client'` สำหรับ components ที่มี state และ event handlers
- ใช้ `useFormState` และ `useFormStatus` สำหรับ form handling
- เพิ่ม proper error boundaries และ loading states
- ทำ input validation ทั้งฝั่ง client และ server
- ใช้ optimistic updates เพื่อ UX ที่ดีขึ้น

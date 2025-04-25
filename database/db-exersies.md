การจัดเก็บข้อมูลท่าออกกำลังกายในรูปแบบ static files
1.	โครงสร้างไฟล์
/public
  /data
    /exercises
      exercises.json         # ข้อมูลท่าออกกำลังกายทั้งหมด
      categories.json        # หมวดหมู่ของท่าออกกำลังกาย
      muscle-groups.json     # กลุ่มกล้ามเนื้อ
      equipment.json         # อุปกรณ์ที่ใช้
2.	โครงสร้างข้อมูลใน exercises.json
[
  {
    "id": "squat",
    "name": "สควอท",
    "thai_name": "สควอท",
    "description": "ท่าบริหารกล้ามเนื้อขา กระตุ้นกล้ามเนื้อต้นขาและสะโพก",
    "instructions": "ยืนตรง เท้าห่างกันเท่าไหล่ ย่อตัวลงเหมือนนั่งเก้าอี้ รักษาหลังตรง แล้วยืดตัวขึ้น",
    "category": "strength",
    "muscle_groups": ["quadriceps", "hamstrings", "glutes"],
    "equipment": ["bodyweight", "dumbbells"],
    "difficulty": "beginner",
    "image": "/images/exercises/squat.jpg",
    "video": "/videos/exercises/squat.mp4",
    "variants": [
      {
        "id": "goblet-squat",
        "name": "Goblet Squat",
        "description": "สควอทโดยถือดัมเบลหรือเคตเทิลเบลตรงหน้าอก"
      }
    ]
  },
  // ท่าออกกำลังกายอื่นๆ
] 


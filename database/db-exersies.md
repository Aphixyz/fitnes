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

CREATE TABLE workout_exercise (
    workout_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_plan_id INT NOT NULL,
    exercise_id VARCHAR(50) NOT NULL, -- รหัสท่าออกกำลังกายจาก exercises.json
    exercise_day VARCHAR(20), -- วันในสัปดาห์ เช่น "Monday"
    exercise_order INT NOT NULL,
    sets INT DEFAULT 3,
    repetitions VARCHAR(50), -- เช่น "12-15" หรือ "10,8,6"
    duration_minutes INT,
    rest_seconds INT DEFAULT 60,
    weight_kg VARCHAR(50), -- เช่น "50,45,40" สำหรับแต่ละเซ็ต
    notes TEXT,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE CASCADE
);

CREATE TABLE exercise_log (
    exercise_log_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_log_id INT NOT NULL,
    exercise_id VARCHAR(50) NOT NULL, -- รหัสท่าออกกำลังกายจาก exercises.json
    exercise_order INT,
    sets_completed INT,
    reps_per_set VARCHAR(50), -- e.g. "12,10,8"
    weight_per_set VARCHAR(50), -- e.g. "50,45,40"
    duration_minutes INT,
    notes TEXT,
    difficulty_rating INT, -- 1-10
    FOREIGN KEY (workout_log_id) REFERENCES workout_log(workout_log_id) ON DELETE CASCADE
);

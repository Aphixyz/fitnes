-- Database Schema for Fitness Tracker
CREATE DATABASE fitness_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitness_tracker;

-- Trainer Table - เก็บข้อมูลเทรนเนอร์
TABLE trainer (
    trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_username VARCHAR(50) NOT NULL UNIQUE,
    trainer_password VARCHAR(255) NOT NULL,
    trainer_firstname VARCHAR(50) NOT NULL,
    trainer_lastname VARCHAR(50) NOT NULL,
    trainer_email VARCHAR(100) NOT NULL UNIQUE,
    trainer_phone VARCHAR(20),
    trainer_bio TEXT,
    trainer_specialization VARCHAR(100),
    trainer_certification VARCHAR(255),
    trainer_experience INT,
    trainer_profileimage VARCHAR(255),
    trainer_status VARCHAR(20) DEFAULT 'active'
);

-- Member Table - เก็บข้อมูลสมาชิก
TABLE member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    member_username VARCHAR(50) NOT NULL UNIQUE,
    member_password VARCHAR(255) NOT NULL,
    member_firstname VARCHAR(50) NOT NULL,
    member_lastname VARCHAR(50) NOT NULL,
    member_email VARCHAR(100) NOT NULL UNIQUE,
    member_phone VARCHAR(20),
    member_gender VARCHAR(50),
    member_dob DATE,
    member_profileimage VARCHAR(255),
    member_status VARCHAR(20) DEFAULT 'active'
);

-- Health Metrics Table - เก็บข้อมูลสุขภาพของสมาชิก
TABLE member_health (
    health_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    initial_weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hip DECIMAL(5,2),
    arm DECIMAL(5,2),
    thigh DECIMAL(5,2),
    health_condition TEXT,
    allergy TEXT,
    fitness_level VARCHAR(20) DEFAULT 'beginner',
    note TEXT,
    measurement_date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Fitness Goals Table - เก็บเป้าหมายการออกกำลังกาย
TABLE fitness_goal (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_weight DECIMAL(5,2),
    weight_difference DECIMAL(5,2),
    muscle_target TEXT,
    fitness_goal_startdate DATE NOT NULL,
    fitness_goal_enddate DATE NOT NULL,
    goal_duration_months INT,
    goal_status VARCHAR(20) DEFAULT 'active',
    note TEXT,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Registration Table - เก็บข้อมูลการลงทะเบียนระหว่างเทรนเนอร์และสมาชิก
TABLE registration (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    member_id INT,
    member_data TEXT,
    registration_status INT DEFAULT 0, -- 0: pending, 1: active, 2: expired, 3: rejected
    registration_startdate DATE,
    registration_enddate DATE,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE SET NULL
);

CREATE TABLE workout_plan (
  workout_plan_id INT AUTO_INCREMENT PRIMARY KEY,
  trainer_id INT NOT NULL,
  member_id INT NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  plan_duration INT NOT NULL,
  plan_startdate DATE NOT NULL,
  plan_enddate DATE NOT NULL,
  plan_note TEXT,
  plan_status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_program (
  workout_program_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_plan_id INT NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_note TEXT,
  order_index INT NOT NULL,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE CASCADE
);

CREATE TABLE program_exercise (
  program_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_program_id INT NOT NULL,
  exercise_id VARCHAR(100) NOT NULL,
  order_index INT NOT NULL,
  rest TIME DEFAULT NULL,
  notes TEXT,
  FOREIGN KEY (workout_program_id) REFERENCES workout_program(workout_program_id) ON DELETE CASCADE
);

CREATE TABLE program_exercise_set (
  program_exercise_set_id INT AUTO_INCREMENT PRIMARY KEY,
  program_exercise_id INT NOT NULL,
  set_order INT NOT NULL,
  weight FLOAT DEFAULT NULL,
  reps INT DEFAULT NULL,
  time TIME DEFAULT NULL,        -- สำหรับ cardio หรือ mobility
  distance FLOAT DEFAULT NULL,   -- km หรือ m
  FOREIGN KEY (program_exercise_id) REFERENCES program_exercise(program_exercise_id) ON DELETE CASCADE
);

TABLE workout_log (
  workout_log_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  workout_plan_id INT,
  workout_date DATE NOT NULL,
  duration_minutes INT,
  intensity_level INT,
  completion_percentage INT DEFAULT 100,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE SET NULL
);

TABLE exercise_log (
  exercise_log_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_log_id INT NOT NULL,
  exercise_id VARCHAR(50),
  exercise_order INT,
  sets_completed INT,
  reps_per_set VARCHAR(50),
  weight_per_set VARCHAR(50),
  duration_minutes INT,
  difficulty_rating INT,
  notes TEXT,
  FOREIGN KEY (workout_log_id) REFERENCES workout_log(workout_log_id) ON DELETE CASCADE
);

-- Food Table - ข้อมูลอาหาร
TABLE food (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    food_name VARCHAR(100) NOT NULL,
    food_category VARCHAR(50),
    serving_size VARCHAR(50),
    calories INT,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    fiber DECIMAL(5,2),
    sugar DECIMAL(5,2),
    sodium DECIMAL(5,2),
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE SET NULL
);

-- Nutrition Plan Table - แผนโภชนาการ
TABLE nutrition_plan (
    nutrition_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    member_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_description TEXT,
    plan_startdate DATE,
    plan_enddate DATE,
    daily_calories INT,
    protein_target INT,
    carbs_target INT,
    fat_target INT,
    plan_status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Meal Plan Table - แผนมื้ออาหาร
TABLE meal_plan (
    meal_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    nutrition_plan_id INT NOT NULL,
    meal_name VARCHAR(50) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    meal_time VARCHAR(20),
    calories_target INT,
    notes TEXT,
    FOREIGN KEY (nutrition_plan_id) REFERENCES nutrition_plan(nutrition_plan_id) ON DELETE CASCADE
);

-- Meal Food Table - อาหารในแต่ละมื้อ
TABLE meal_food (
    meal_food_id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT NOT NULL,
    food_id INT NOT NULL,
    serving_quantity DECIMAL(5,2) DEFAULT 1,
    day_of_week VARCHAR(20), -- all, monday, tuesday, etc.
    notes TEXT,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plan(meal_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food(food_id) ON DELETE CASCADE
);

-- Nutrition Log Table - บันทึกการบริโภค
TABLE nutrition_log (
    nutrition_log_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    log_date DATE NOT NULL,
    meal_type VARCHAR(50), -- Breakfast, Lunch, Dinner, Snack
    meal_time TIME,
    total_calories INT,
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Food Log Table - บันทึกอาหารที่บริโภค
TABLE food_log (
    food_log_id INT AUTO_INCREMENT PRIMARY KEY,
    nutrition_log_id INT NOT NULL,
    food_id INT,
    custom_food_name VARCHAR(100),
    serving_quantity DECIMAL(5,2),
    calories INT,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    notes TEXT,
    FOREIGN KEY (nutrition_log_id) REFERENCES nutrition_log(nutrition_log_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food(food_id) ON DELETE SET NULL
);

-- Challenge Table - ความท้าทายเพื่อกระตุ้นการออกกำลังกาย
TABLE challenge (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    challenge_name VARCHAR(100) NOT NULL,
    challenge_description TEXT,
    challenge_type VARCHAR(50), -- workout, nutrition, weight
    challenge_goal TEXT, -- เป้าหมายที่ต้องทำให้สำเร็จ
    challenge_startdate DATE,
    challenge_enddate DATE,
    points_reward INT DEFAULT 0,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE
);

-- Member Challenge Table - ความท้าทายที่สมาชิกเข้าร่วม
TABLE member_challenge (
    member_challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    challenge_id INT NOT NULL,
    join_date DATE DEFAULT (CURRENT_DATE),
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'joined',
    progress INT DEFAULT 0, -- percentage
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenge(challenge_id) ON DELETE CASCADE
);

-- Payment Table - ข้อมูลการชำระเงิน
TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (registration_id) REFERENCES registration(registration_id) ON DELETE CASCADE
);

-- Payment Plan Table - แผนการชำระเงิน
TABLE payment_plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_description TEXT,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
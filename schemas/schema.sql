# Database Schema Documentation

## Overview

FitTrack uses MySQL as its primary database, containerized with Docker for development and production environments. The database schema is designed to support all core features including user management, workout tracking, nutrition planning, and gamification.

## Tables

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
CREATE TABLE registration (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    trainer_id INT NOT NULL,
    packages_id INT,
    registration_startdate DATE,
    registration_enddate DATE,
    registration_status VARCHAR(20) DEFAULT "active",
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE SET NULL
);

-- Packages Table -เก็บข้อมูลแพ็คเกจที่ trainer สร้างขึ้น
CREATE TABLE packages (
    packages_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    packages_name VARCHAR,
    packages_duratuin_months INT,
    packages_price DECINAL(10,2),
    packages_description VARCHAR,
);

-- Workout Plan Table -เก็บข้อมูลแผนการออกกำลังกายของ trainer
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

-- Workout Program Table -เก็บข้อมูลแผนการออกกำลังกายของ 
CREATE TABLE workout_program (
  workout_program_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_plan_id INT NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_note TEXT,
  order_index INT NOT NULL,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE CASCADE
);

-- Program Exercise Table -เก็บข้อมูลการออกกำลังกายของ 
CREATE TABLE program_exercise (
  program_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_program_id INT NOT NULL,
  exercise_id VARCHAR(100) NOT NULL,
  order_index INT NOT NULL,
  rest TIME DEFAULT NULL,
  notes TEXT,
  FOREIGN KEY (workout_program_id) REFERENCES workout_program(workout_program_id) ON DELETE CASCADE
);

-- Program Exercise Set Table -เก็บข้อมูลการออกกำลังกายของ 
CREATE TABLE program_exercise_set (
  program_exercise_set_id INT AUTO_INCREMENT PRIMARY KEY,
  program_exercise_id INT NOT NULL,
  set_order INT NOT NULL,
  note TEXT,
  rest TIME DEFAULT NULL,
  weight FLOAT DEFAULT NULL,
  reps INT DEFAULT NULL,
  time TIME DEFAULT NULL,        -- สำหรับ cardio หรือ mobility
  distance FLOAT DEFAULT NULL,   -- km หรือ m
  FOREIGN KEY (program_exercise_id) REFERENCES program_exercise(program_exercise_id) ON DELETE CASCADE
);

-- Macro Plan Table -เก็บข้อมูลแผนการออกกำลังกายของ 
CREATE TABLE macro_plan (
  macro_plan_id   INT AUTO_INCREMENT PRIMARY KEY,
  trainer_id      INT        NOT NULL,
  member_id       INT        NOT NULL,
  -- สัดส่วน P/C/F ที่ Trainer กำหนด (% ต้อง >=0 และรวมกัน =100)
  protein_ratio   DECIMAL(5,2) NOT NULL,
  carb_ratio      DECIMAL(5,2) NOT NULL,
  fat_ratio       DECIMAL(5,2) NOT NULL,
  -- ช่วงเวลาของแผน
  start_date      DATE       NOT NULL,
  end_date        DATE       NOT NULL,
  -- สถานะของแผน (active/inactive)
  plan_status     VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Intake_logs Table - เก็บข้อมูลการบริโภคอาหารของ Member
TABLE intake_logs (
    intake_logs_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    date DATE NOT NULL,
    calories INT,
    protein INT,
    carb INT,
    fat INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
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

## Database Utilities

The database connection and query utilities are managed through `lib/db.js`. This file provides:

1. Connection pooling
2. Query execution helpers
3. Transaction management
4. Error handling

## Data Validation

All database operations are validated using schemas defined in the `schemas` directory. These schemas ensure:

1. Data type correctness
2. Required field presence
3. Value constraints
4. Relationship integrity
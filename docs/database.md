# Database Schema Documentation

## Overview

FitTrack uses MySQL as its primary database, containerized with Docker for development and production environments. The database schema is designed to support all core features including user management, workout tracking, nutrition planning, and gamification.

## Database Tables

### Trainer - เก็บข้อมูลเทรนเนอร์

```sql
CREATE TABLE trainer (
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
```

### Member - เก็บข้อมูลสมาชิก

```sql
CREATE TABLE member (
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
```

### member_health Health Metrics Table - เก็บข้อมูลสุขภาพของสมาชิก

```sql
CREATE TABLE member_health (
    member_health_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    member_health_weight DECIMAL(5,2),
    member_health_height DECIMAL(5,2),
    member_health_bodyfat DECIMAL(10,2),
    member_activity_level INT,
    member_health_condition TEXT,
    member_health_chest DECIMAL(10,2),
    member_health_waist DECIMAL(10,2),
    member_health_hip DECIMAL(10,2),
    member_health_arm DECIMAL(10,2),
    member_health_thigh DECIMAL(10,2),
    member_health_measurementdate DATE NOT NULL,
    create_ate DATETIME DEFAULT on update current_timestamp,
    update_at DATETIME DEFAULT on update current_timestamp,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);
```

### fitness_goal Fitness Goals Table - เก็บเป้าหมายการออกกำลังกาย

```sql
CREATE TABLE fitness_goal (
    fitness_goal_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    fitness_goal_type VARCHAR(50) NOT NULL,
    fitness_training_frequency INT,
    fitness_experience_level VARCHAR,
    fitness_goal_targetweight DECIMAL(5,2),
    fitness_training_time VARCHAR(20),
    fitness_desired_time SMALLINT,
    fitness_goal_startdate DATE NOT NULL,
    fitness_goal_enddate DATE NOT NULL,
    fitness_goal_status VARCHAR(20) DEFAULT 'active',
    create_at DATETIME DEFAULT on update current_timestamp,
    update_at DATETIME DEFAULT on update current_timestamp,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);
```

## Registration Table -เก็บข้อมูลการลงทะเบียนระหว่างเทรนเนอร์และสมาชิก

```sql
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
```
## Packages Table -เก็บข้อมูลแพ็คเกจที่ trainer สร้าง

```sql
CREATE TABLE packages (
    packages_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    packages_name VARCHAR,
    packages_duratuin_months INT,
    packages_price DECINAL(10,2),
    packages_description VARCHAR,
);
```

### workout_plan

```sql
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
```

### workout_program

```sql
CREATE TABLE workout_program (
  workout_program_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_plan_id INT NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_note TEXT,
  order_index INT NOT NULL,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE CASCADE
);
```

### program_exercise

```sql
CREATE TABLE program_exercise (
  program_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_program_id INT NOT NULL,
  exercise_id VARCHAR(100) NOT NULL,
  order_index INT NOT NULL,
  rest INT DEFAULT NULL,
  notes TEXT,
  FOREIGN KEY (workout_program_id) REFERENCES workout_program(workout_program_id) ON DELETE CASCADE
);
```

### program_exercise_set

```sql
CREATE TABLE program_exercise_set (
  program_exercise_set_id INT AUTO_INCREMENT PRIMARY KEY,
  program_exercise_id INT NOT NULL,
  set_order INT NOT NULL,
  weight DECIMAL DEFAULT NULL,
  reps INT DEFAULT NULL,
  time INT DEFAULT NULL,        -- m นาที และ s วินาที
  distance INT DEFAULT NULL,   -- km กิโลเมตร หรือ m เมตร
  FOREIGN KEY (program_exercise_id) REFERENCES program_exercise(program_exercise_id) ON DELETE CASCADE
);
```

### Workout_Logs

```sql
CREATE TABLE workout_logs (
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
```
### exercise_log

```sql
CREATE TABLE exercise_log (
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
```

### macro_Plans
```sql
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
```

### Nutrition_Logs

```sql
CREATE TABLE macro_logs (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(36) NOT NULL,
    meal_name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein_grams INT NOT NULL,
    carbs_grams INT NOT NULL,
    fat_grams INT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES users(id)
);
```

### Macr


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

## Backup and Recovery

1. **Automated Backups**

   - Daily full backups
   - Transaction log backups
   - Backup retention policy

2. **Recovery Procedures**
   - Point-in-time recovery
   - Disaster recovery plan
   - Data restoration process

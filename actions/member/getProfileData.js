"use server";

import pool from "@/lib/db";

/**
 * Fetch Member Profile data for the Member Profile page
 * @param {number} memberId - The member ID to fetch profile data for
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>} Profile data response object
 */
export async function getProfileData(memberId) {
  try {
    if (!memberId || typeof memberId !== 'number') {
      throw new Error("Valid member ID is required");
    }

    // Fetch member data including profile image path
    const [memberRows] = await pool.query(
      `SELECT member_id, member_username, member_firstname, member_lastname, 
              member_email, member_phone, member_gender, member_dob, 
              member_profileimage
       FROM member 
       WHERE member_id = ?`,
      [memberId]
    );

    if (!memberRows.length) {
      throw new Error("Member not found");
    }

    const memberData = memberRows[0];

    // Fetch active fitness goal type and related data
    const [goalRows] = await pool.query(
      `SELECT fitness_goal_id, fitness_goal_type, fitness_training_frequency,
              fitness_experience_level, fitness_goal_targetweight, 
              fitness_training_time, fitness_desired_time,
              fitness_goal_startdate, fitness_goal_enddate, 
              fitness_goal_status, create_at
       FROM fitness_goal 
       WHERE member_id = ? AND fitness_goal_status = 'active' 
       ORDER BY fitness_goal_enddate DESC 
       LIMIT 1`,
      [memberId]
    );

    const activeGoal = goalRows.length > 0 ? goalRows[0] : null;

    // Fetch total goals count for stats
    const [goalCountRows] = await pool.query(
      `SELECT COUNT(*) as total_goals
       FROM fitness_goal 
       WHERE member_id = ?`,
      [memberId]
    );

    const totalGoals = goalCountRows[0]?.total_goals || 0;

    // Fetch active registration with trainer and package info
    const [registrationRows] = await pool.query(
      `SELECT r.registration_id, r.registration_startdate, r.registration_enddate,
              t.trainer_id, t.trainer_firstname, t.trainer_lastname, 
              t.trainer_profile_image, t.trainer_specialization,
              p.packages_id, p.packages_name, p.packages_duration_months, 
              p.packages_price
       FROM registration r
       LEFT JOIN trainer t ON r.trainer_id = t.trainer_id
       LEFT JOIN packages p ON r.packages_id = p.packages_id
       WHERE r.member_id = ? AND r.registration_enddate >= CURDATE()
       ORDER BY r.registration_startdate DESC
       LIMIT 1`,
      [memberId]
    );

    const activeRegistration = registrationRows.length > 0 ? registrationRows[0] : null;

    // Fetch latest health metrics for additional profile context
    const [healthRows] = await pool.query(
      `SELECT member_health_height, member_health_weight, member_activity_level,
              member_health_measurementdate
       FROM member_health 
       WHERE member_id = ? 
       ORDER BY member_health_measurementdate DESC 
       LIMIT 1`,
      [memberId]
    );

    const latestHealth = healthRows.length > 0 ? healthRows[0] : null;

    return {
      success: true,
      data: {
        member: {
          id: memberData.member_id,
          username: memberData.member_username,
          firstName: memberData.member_firstname,
          lastName: memberData.member_lastname,
          fullName: `${memberData.member_firstname} ${memberData.member_lastname}`,
          email: memberData.member_email,
          phone: memberData.member_phone,
          gender: memberData.member_gender,
          dateOfBirth: memberData.member_dob,
          profileImage: memberData.member_profileimage, // Required profile image path
        },
        goal: {
          hasActiveGoal: !!activeGoal,
          currentGoal: activeGoal ? {
            id: activeGoal.fitness_goal_id,
            type: activeGoal.fitness_goal_type, // Required fitness_goal_type where status = 'active'
            trainingFrequency: activeGoal.fitness_training_frequency,
            experienceLevel: activeGoal.fitness_experience_level,
            targetWeight: activeGoal.fitness_goal_targetweight,
            trainingTime: activeGoal.fitness_training_time,
            desiredTime: activeGoal.fitness_desired_time,
            startDate: activeGoal.fitness_goal_startdate,
            endDate: activeGoal.fitness_goal_enddate,
            status: activeGoal.fitness_goal_status,
            createdAt: activeGoal.create_at
          } : null,
          totalGoals: totalGoals
        },
        registration: {
          hasActiveRegistration: !!activeRegistration,
          current: activeRegistration ? {
            id: activeRegistration.registration_id,
            startDate: activeRegistration.registration_startdate,
            endDate: activeRegistration.registration_enddate,
            trainer: activeRegistration.trainer_id ? {
              id: activeRegistration.trainer_id,
              firstName: activeRegistration.trainer_firstname,
              lastName: activeRegistration.trainer_lastname,
              fullName: `${activeRegistration.trainer_firstname} ${activeRegistration.trainer_lastname}`,
              profileImage: activeRegistration.trainer_profile_image,
              specialization: activeRegistration.trainer_specialization
            } : null,
            package: activeRegistration.packages_id ? {
              id: activeRegistration.packages_id,
              name: activeRegistration.packages_name,
              durationMonths: activeRegistration.packages_duration_months,
              price: activeRegistration.packages_price
            } : null
          } : null
        },
        health: {
          hasHealthData: !!latestHealth,
          latest: latestHealth ? {
            height: latestHealth.member_health_height,
            weight: latestHealth.member_health_weight,
            activityLevel: latestHealth.member_activity_level,
            measurementDate: latestHealth.member_health_measurementdate
          } : null
        }
      }
    };

  } catch (error) {
    console.error("Error fetching member profile data:", error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}


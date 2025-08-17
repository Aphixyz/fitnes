/**
 * Test suite for getMemberActivityTimeline function
 * Tests various scenarios including permissions, data formatting, and edge cases
 */

import { getMemberActivityTimeline } from '@/actions/trainer/dashboard/getMemberActivityTimeline';
import pool from '@/lib/db';

// Mock the database pool
jest.mock('@/lib/db', () => ({
  getConnection: jest.fn(),
}));

describe('getMemberActivityTimeline', () => {
  let mockConnection;
  let mockQuery;
  let mockRelease;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockRelease = jest.fn();
    mockConnection = {
      query: mockQuery,
      release: mockRelease,
    };
    pool.getConnection.mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Parameter validation', () => {
    test('should return error for invalid trainerId', async () => {
      const result = await getMemberActivityTimeline('invalid', 1);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid trainerId or memberId');
    });

    test('should return error for invalid memberId', async () => {
      const result = await getMemberActivityTimeline(1, 'invalid');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid trainerId or memberId');
    });

    test('should accept valid trainerId and memberId as numbers', async () => {
      // Mock relationship check - no member found
      mockQuery.mockResolvedValueOnce([[]]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('ไม่พบสมาชิกนี้หรือคุณไม่มีสิทธิ์เข้าถึงข้อมูล');
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  describe('Permission validation', () => {
    test('should return error when trainer-member relationship does not exist', async () => {
      // Mock relationship check - no relationship found
      mockQuery.mockResolvedValueOnce([[]]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('ไม่พบสมาชิกนี้หรือคุณไม่มีสิทธิ์เข้าถึงข้อมูล');
      expect(mockRelease).toHaveBeenCalled();
    });

    test('should return error when registration is not active', async () => {
      // Mock relationship check - inactive registration
      mockQuery.mockResolvedValueOnce([[]]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('ไม่พบสมาชิกนี้หรือคุณไม่มีสิทธิ์เข้าถึงข้อมูล');
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  describe('Successful data retrieval', () => {
    const mockMemberInfo = {
      member_id: 2,
      full_name: 'John Doe',
      member_profileimage: '/profile/john.jpg',
      registration_status: 'active'
    };

    test('should return timeline data with default options', async () => {
      // Mock relationship check - valid relationship
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      // Mock activities query - return mixed activities
      const mockActivities = [
        {
          type: 'workout',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T08:00:00',
          program_name: 'Push Day',
          total_sets: 12,
          total_volume: 2400,
          duration: null,
          exercises: 'bench_press,shoulder_press'
        },
        {
          type: 'nutrition',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T12:00:00',
          program_name: 'daily_nutrition',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'calories:650|protein:35|carb:45|fat:25'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(true);
      expect(result.data.member.memberId).toBe(2);
      expect(result.data.member.fullName).toBe('John Doe');
      expect(result.data.activities).toHaveLength(1); // Grouped by date
      expect(result.data.activities[0].date).toBe('2025-01-10');
      expect(result.data.activities[0].activitiesByDate).toHaveLength(2);
      expect(result.data.summary.totalDays).toBe(30);
    });

    test('should filter by activity types', async () => {
      // Mock relationship check
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      // Mock activities query - only workout data should be included
      const mockActivities = [
        {
          type: 'workout',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T08:00:00',
          program_name: 'Push Day',
          total_sets: 12,
          total_volume: 2400,
          duration: null,
          exercises: 'bench_press,shoulder_press'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const options = { activityTypes: ['workout'] };
      const result = await getMemberActivityTimeline(1, 2, options);
      
      expect(result.success).toBe(true);
      expect(result.data.activities[0].activitiesByDate).toHaveLength(1);
      expect(result.data.activities[0].activitiesByDate[0].type).toBe('workout');
    });

    test('should respect custom days parameter', async () => {
      // Mock relationship check
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);
      mockQuery.mockResolvedValueOnce([[]]);

      const options = { days: 7 };
      const result = await getMemberActivityTimeline(1, 2, options);
      
      expect(result.success).toBe(true);
      expect(result.data.summary.totalDays).toBe(7);
    });

    test('should format workout activity data correctly', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'workout',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T08:00:00',
          program_name: 'Push Day',
          total_sets: 12,
          total_volume: 2400,
          duration: null,
          exercises: 'bench_press,shoulder_press'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      const workoutActivity = result.data.activities[0].activitiesByDate[0];
      expect(workoutActivity.type).toBe('workout');
      expect(workoutActivity.data.programName).toBe('Push Day');
      expect(workoutActivity.data.totalSets).toBe(12);
      expect(workoutActivity.data.totalVolume).toBe(2400);
      expect(workoutActivity.data.exercises).toEqual(['bench_press', 'shoulder_press']);
    });

    test('should format nutrition activity data correctly', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'nutrition',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T12:00:00',
          program_name: 'daily_nutrition',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'calories:650|protein:35|carb:45|fat:25'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      const nutritionActivity = result.data.activities[0].activitiesByDate[0];
      expect(nutritionActivity.type).toBe('nutrition');
      expect(nutritionActivity.data.totalCalories).toBe(650);
      expect(nutritionActivity.data.protein).toBe(35);
      expect(nutritionActivity.data.carb).toBe(45);
      expect(nutritionActivity.data.fat).toBe(25);
    });

    test('should format health metrics activity data correctly', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'health_metrics',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T07:00:00',
          program_name: 'health_measurement',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'weight:75.5|bodyfat:12.3|chest:100|waist:85'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      const healthActivity = result.data.activities[0].activitiesByDate[0];
      expect(healthActivity.type).toBe('health_metrics');
      expect(healthActivity.data.weight).toBe(75.5);
      expect(healthActivity.data.bodyFat).toBe(12.3);
      expect(healthActivity.data.measurements.chest).toBe(100);
      expect(healthActivity.data.measurements.waist).toBe(85);
    });

    test('should format progress photo activity data correctly', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'progress_photo',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T07:05:00',
          program_name: 'progress_photos',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'front:1|side:1|back:0'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      const photoActivity = result.data.activities[0].activitiesByDate[0];
      expect(photoActivity.type).toBe('progress_photo');
      expect(photoActivity.data.photoCount).toBe(2);
      expect(photoActivity.data.angles).toEqual(['front', 'side']);
      expect(photoActivity.data.hasComparison).toBe(true);
    });

    test('should calculate consistency correctly', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      // Mock activities spanning 3 days out of 30
      const mockActivities = [
        {
          type: 'workout',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T08:00:00',
          program_name: 'Push Day',
          total_sets: 12,
          total_volume: 2400,
          duration: null,
          exercises: 'bench_press'
        },
        {
          type: 'nutrition',
          date: new Date('2025-01-08'),
          timestamp: '2025-01-08T12:00:00',
          program_name: 'daily_nutrition',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'calories:500|protein:30|carb:40|fat:20'
        },
        {
          type: 'workout',
          date: new Date('2025-01-05'),
          timestamp: '2025-01-05T08:00:00',
          program_name: 'Pull Day',
          total_sets: 10,
          total_volume: 2000,
          duration: null,
          exercises: 'pull_up'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      // 3 days with activity out of 30 days = 10% consistency
      expect(result.data.summary.consistency).toBe(10);
    });
  });

  describe('Error handling', () => {
    test('should handle database connection errors', async () => {
      pool.getConnection.mockRejectedValue(new Error('Database connection failed'));

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('เกิดข้อผิดพลาดในการดึงข้อมูล timeline activities');
      expect(result.error).toBe('Database connection failed');
    });

    test('should handle query errors', async () => {
      mockQuery.mockRejectedValue(new Error('Query execution failed'));

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('เกิดข้อผิดพลาดในการดึงข้อมูล timeline activities');
      expect(result.error).toBe('Query execution failed');
      expect(mockRelease).toHaveBeenCalled();
    });

    test('should return error for empty activity types', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const options = { activityTypes: [] };
      const result = await getMemberActivityTimeline(1, 2, options);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('ไม่ได้เลือกประเภทกิจกรรมใดๆ');
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty activity results', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);
      mockQuery.mockResolvedValueOnce([[]]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(true);
      expect(result.data.activities).toHaveLength(0);
      expect(result.data.summary.activitiesCounts.workout).toBe(0);
      expect(result.data.summary.consistency).toBe(0);
    });

    test('should handle null/undefined values in activity data', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'nutrition',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T12:00:00',
          program_name: 'daily_nutrition',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: null
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      expect(result.success).toBe(true);
      const nutritionActivity = result.data.activities[0].activitiesByDate[0];
      expect(nutritionActivity.data.totalCalories).toBe(0);
      expect(nutritionActivity.data.protein).toBe(0);
    });

    test('should sort activities by timestamp within same date', async () => {
      mockQuery.mockResolvedValueOnce([[mockMemberInfo]]);

      const mockActivities = [
        {
          type: 'workout',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T08:00:00',
          program_name: 'Morning Workout',
          total_sets: 10,
          total_volume: 2000,
          duration: null,
          exercises: 'bench_press'
        },
        {
          type: 'nutrition',
          date: new Date('2025-01-10'),
          timestamp: '2025-01-10T18:00:00',
          program_name: 'Evening Meal',
          total_sets: null,
          total_volume: null,
          duration: null,
          exercises: 'calories:800|protein:40|carb:50|fat:30'
        }
      ];
      mockQuery.mockResolvedValueOnce([mockActivities]);

      const result = await getMemberActivityTimeline(1, 2);
      
      const activitiesForDate = result.data.activities[0].activitiesByDate;
      expect(activitiesForDate[0].timestamp).toBe('2025-01-10T18:00:00'); // Evening meal first (latest)
      expect(activitiesForDate[1].timestamp).toBe('2025-01-10T08:00:00'); // Morning workout second
    });
  });
});
/**
 * Usage examples for getMemberActivityTimeline function
 * This file shows how to use the function with different parameters
 */

import { getMemberActivityTimeline } from '@/actions/trainer/dashboard/getMemberActivityTimeline';

// Example 1: Basic usage with default options
async function basicUsage() {
  console.log('=== Basic Usage Example ===');
  
  const trainerId = 1;
  const memberId = 5;
  
  try {
    const result = await getMemberActivityTimeline(trainerId, memberId);
    
    if (result.success) {
      console.log('Member:', result.data.member);
      console.log('Total activities found:', result.data.activities.length);
      console.log('Summary:', result.data.summary);
      
      // Display activities by date
      result.data.activities.forEach(dayData => {
        console.log(`\nDate: ${dayData.date} (${dayData.activitiesByDate.length} activities)`);
        dayData.activitiesByDate.forEach(activity => {
          console.log(`  - ${activity.type} at ${activity.timestamp}`);
          console.log(`    Data:`, activity.data);
        });
      });
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

// Example 2: Filter by specific activity types
async function filterByActivityTypes() {
  console.log('=== Filter by Activity Types Example ===');
  
  const trainerId = 1;
  const memberId = 5;
  const options = {
    activityTypes: ['workout', 'nutrition'], // Only workout and nutrition
    days: 7, // Last 7 days only
    limit: 50 // Limit to 50 items
  };
  
  try {
    const result = await getMemberActivityTimeline(trainerId, memberId, options);
    
    if (result.success) {
      console.log(`Activities for ${result.data.member.fullName}:`);
      console.log('Activity counts:', result.data.summary.activitiesCounts);
      console.log(`Consistency: ${result.data.summary.consistency}%`);
      
      // Show only workout and nutrition activities
      result.data.activities.forEach(dayData => {
        const workouts = dayData.activitiesByDate.filter(a => a.type === 'workout');
        const nutrition = dayData.activitiesByDate.filter(a => a.type === 'nutrition');
        
        if (workouts.length > 0 || nutrition.length > 0) {
          console.log(`\n${dayData.date}:`);
          
          workouts.forEach(workout => {
            console.log(`  💪 Workout: ${workout.data.programName}`);
            console.log(`      Sets: ${workout.data.totalSets}, Volume: ${workout.data.totalVolume}kg`);
          });
          
          nutrition.forEach(meal => {
            console.log(`  🍽️ Nutrition: ${meal.data.totalCalories} calories`);
            console.log(`      P/C/F: ${meal.data.protein}g/${meal.data.carb}g/${meal.data.fat}g`);
          });
        }
      });
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

// Example 3: Health metrics and progress photos only
async function healthAndProgressOnly() {
  console.log('=== Health Metrics and Progress Photos Example ===');
  
  const trainerId = 1;
  const memberId = 5;
  const options = {
    activityTypes: ['health_metrics', 'progress_photo'],
    days: 90, // Last 3 months
    limit: 20
  };
  
  try {
    const result = await getMemberActivityTimeline(trainerId, memberId, options);
    
    if (result.success) {
      console.log(`Health tracking for ${result.data.member.fullName}:`);
      
      result.data.activities.forEach(dayData => {
        console.log(`\n${dayData.date}:`);
        
        dayData.activitiesByDate.forEach(activity => {
          if (activity.type === 'health_metrics') {
            console.log(`  📊 Health Metrics:`);
            if (activity.data.weight) console.log(`      Weight: ${activity.data.weight}kg`);
            if (activity.data.bodyFat) console.log(`      Body Fat: ${activity.data.bodyFat}%`);
            if (Object.keys(activity.data.measurements).length > 0) {
              console.log(`      Measurements:`, activity.data.measurements);
            }
          }
          
          if (activity.type === 'progress_photo') {
            console.log(`  📸 Progress Photos:`);
            console.log(`      Photos: ${activity.data.photoCount} (${activity.data.angles.join(', ')})`);
            console.log(`      Has comparison: ${activity.data.hasComparison ? 'Yes' : 'No'}`);
          }
        });
      });
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

// Example 4: Recent activity overview (last 14 days)
async function recentActivityOverview() {
  console.log('=== Recent Activity Overview Example ===');
  
  const trainerId = 1;
  const memberId = 5;
  const options = {
    activityTypes: ['all'], // All activity types
    days: 14, // Last 2 weeks
    limit: 100
  };
  
  try {
    const result = await getMemberActivityTimeline(trainerId, memberId, options);
    
    if (result.success) {
      const { member, activities, summary } = result.data;
      
      console.log(`\n📋 Activity Report for ${member.fullName}`);
      console.log('=' .repeat(50));
      console.log(`📅 Period: Last ${summary.totalDays} days`);
      console.log(`🎯 Consistency: ${summary.consistency}%`);
      console.log('\n📊 Activity Breakdown:');
      console.log(`  💪 Workouts: ${summary.activitiesCounts.workout}`);
      console.log(`  🍽️ Nutrition logs: ${summary.activitiesCounts.nutrition}`);
      console.log(`  📊 Health metrics: ${summary.activitiesCounts.health_metrics}`);
      console.log(`  📸 Progress photos: ${summary.activitiesCounts.progress_photo}`);
      
      // Show last 5 days of activity
      console.log('\n🕒 Recent Activity (Last 5 Days):');
      activities.slice(0, 5).forEach(dayData => {
        console.log(`\n  ${dayData.date} (${dayData.activitiesByDate.length} activities):`);
        dayData.activitiesByDate.forEach(activity => {
          const time = activity.timestamp.split('T')[1].substring(0, 5);
          let summary = '';
          
          switch (activity.type) {
            case 'workout':
              summary = `${activity.data.programName} - ${activity.data.totalSets} sets`;
              break;
            case 'nutrition':
              summary = `${activity.data.totalCalories} cal, ${activity.data.protein}g protein`;
              break;
            case 'health_metrics':
              const metrics = [];
              if (activity.data.weight) metrics.push(`${activity.data.weight}kg`);
              if (activity.data.bodyFat) metrics.push(`${activity.data.bodyFat}% BF`);
              summary = metrics.join(', ') || 'Measurements recorded';
              break;
            case 'progress_photo':
              summary = `${activity.data.photoCount} photos (${activity.data.angles.join(', ')})`;
              break;
          }
          
          const icons = {
            workout: '💪',
            nutrition: '🍽️',
            health_metrics: '📊',
            progress_photo: '📸'
          };
          
          console.log(`    ${time} ${icons[activity.type]} ${summary}`);
        });
      });
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

// Example 5: Error handling
async function errorHandlingExample() {
  console.log('=== Error Handling Example ===');
  
  // Test with invalid trainer-member relationship
  const invalidTrainerId = 999;
  const invalidMemberId = 999;
  
  try {
    const result = await getMemberActivityTimeline(invalidTrainerId, invalidMemberId);
    
    if (!result.success) {
      console.log('Expected error occurred:', result.message);
      console.log('Error details:', result.error || 'No additional details');
    } else {
      console.log('Unexpected success - this should have failed');
    }
  } catch (error) {
    console.error('Exception caught:', error.message);
  }
  
  // Test with invalid parameters
  try {
    const result = await getMemberActivityTimeline('invalid', null);
    console.log('Invalid params result:', result.message);
  } catch (error) {
    console.error('Exception with invalid params:', error.message);
  }
}

// Example usage in a React component or API route
export const useInReactComponent = () => {
  /*
  // In a React component with SWR:
  const { data, error, isLoading } = useSWR(
    trainerId && memberId ? `/api/member-timeline/${trainerId}/${memberId}` : null,
    () => getMemberActivityTimeline(trainerId, memberId, {
      days: 30,
      activityTypes: ['all'],
      limit: 100
    })
  );
  
  if (isLoading) return <div>Loading timeline...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.success) return <div>Error: {data?.message}</div>;
  
  return (
    <div>
      <h2>{data.data.member.fullName} - Activity Timeline</h2>
      <p>Consistency: {data.data.summary.consistency}%</p>
      {data.data.activities.map(dayData => (
        <div key={dayData.date}>
          <h3>{dayData.date}</h3>
          {dayData.activitiesByDate.map((activity, idx) => (
            <div key={idx}>
              {activity.type}: {JSON.stringify(activity.data)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  */
};

// Example usage in API route
export const useInAPIRoute = () => {
  /*
  // In pages/api/trainer/[trainerId]/member/[memberId]/timeline.js
  export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    const { trainerId, memberId } = req.query;
    const { days = 30, activityTypes = ['all'], limit = 100 } = req.query;
    
    try {
      const result = await getMemberActivityTimeline(
        parseInt(trainerId),
        parseInt(memberId),
        {
          days: parseInt(days),
          activityTypes: Array.isArray(activityTypes) ? activityTypes : [activityTypes],
          limit: parseInt(limit)
        }
      );
      
      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('Timeline API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  */
};

// Run examples (uncomment to test)
// basicUsage();
// filterByActivityTypes();
// healthAndProgressOnly();
// recentActivityOverview();
// errorHandlingExample();
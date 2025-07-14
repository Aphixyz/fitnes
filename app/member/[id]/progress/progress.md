# Progress Page Implementation Guide

Below is a detailed breakdown of each component, data source, server actions, interaction pattern, and layout. Hand this off directly to front-end and back-end developers to implement.

---

## 1. Hero Metrics

**Purpose:** Surface the most important summary numbers at a glance.

**Data sources & calculations:**

- **Total Volume**
  - Table: `program_exercise_set` (or pre-aggregated materialized view)
  - SQL:
    ```sql
    SELECT SUM(weight * reps) AS total_volume
    FROM program_exercise_set
    WHERE workout_plan_id IN (
      SELECT workout_plan_id
      FROM workout_plan
      WHERE member_id = :member_id
        AND plan_startdate >= :start_date
        AND plan_enddate   <= :end_date
    );
    ```
- **Total Sessions**
  - Table: `exercise_log`
  - SQL:
    ```sql
    SELECT COUNT(*) AS session_count
    FROM exercise_log
    WHERE member_id = :member_id
      AND log_date BETWEEN :start_date AND :end_date;
    ```
- **Goal Progress %**
  - Tables: `fitness_goal`, `member_health`
  - Steps:
    1. Fetch **start_weight** from the earliest `member_health` entry.
    2. Fetch **target_weight** from the most recent active goal.
    3. Fetch **current_weight** from the latest `member_health` entry.
    4. Compute:
       ```text
       progress_pct = (start_weight – current_weight)
                      / (start_weight – target_weight) * 100
       ```

**UI:**

- Three cards or tiles at top of page, each showing:
  1. Label (e.g. “Total Volume”)
  2. Big number (e.g. “12,340 kg”)
  3. Subtitle (e.g. “kg lifted”)

---

## 2. Trend Charts

**Purpose:** Show time-series trends for weight, calories

Back-end logic:
• Query corresponding table (member_health or intake_logs) for each date in range.

Front-end requirements:
• Line chart component (Rechart.js)
• X-axis: date; Y-axis: metric value
• Controls:
  Time-range selector (buttons: 1W / 1M / 3M / 1Y / All)
• Metric selector (tabs or dropdown: Weight / Calories )

## 3. Goal Comparison

**Purpose:** Overlay actual progress vs. target goal over time.

Back-end logic: 
1. Fetch all fitness_goal records for the member, sorted by startdate. 
2. Fetch daily member_health_weight entries between the first goal’s startdate and today. 
3. For each date:
    • Actual = weight logged on that date (or interpolated if missing)
    • Target = linearly interpolate between consecutive goal start/end weights

UI:
• Combined line chart with two series:
• Actual (solid line)
• Target (dashed line)
• Annotations at: goal start, mid-point, goal end
• Under chart: progress bar or donut chart showing % complete

## 4. Calendar Heat-map

**Purpose:** Visualize workout frequency and consistency.

Back-end logic: 
1. Generate full date series for the specified range. 
2. Count logs per day:

```
SELECT log_date, COUNT(*) AS count
FROM exercise_log
WHERE member_id = :member_id
AND log_date BETWEEN :start_date AND :end_date
GROUP BY log_date;
```

3. Return an array of { date: 'YYYY-MM-DD', count: n }.

UI:
• 7×N grid (Sunday–Saturday rows)
• Color scale:
• 0 logs → light gray
• 1–2 logs → medium shade
• ≥3 logs → dark shade
• Tooltip on hover: “June 12, 2025: 2 sessions”
• Clickable cell to drill into daily details


## 5. Progressive Disclosure & Layout

Principle: Surface high-value info first; hide deeper detail behind toggles.

Wireframe (top → bottom):
	1.	Hero Metrics (3 tiles)
	2.	Trend Charts (tabs or carousel)
	3.	Goal Comparison (line + progress indicator)
	4.	Calendar Heat-map (collapsed preview + “View full calendar” toggle)
	5.	Detailed Logs (expandable table or modal)

Collapsible sections:
	•	Full calendar view
	•	List of individual logs (date, program, volume)
	•	Detailed nutrition entries

Total Volume: คำนวณจาก program_exercise_set (weight × reps)
Total Sessions: นับจาก exercise_log
Goal Progress %: คำนวณจาก fitness_goal และ member_health

// actions/member/progress/heroMetrics.js
- getTotalVolume(memberId, startDate, endDate)
- getTotalSessions(memberId, startDate, endDate) 
- getGoalProgress(memberId)

Trend Charts
Weight Trend: ดึงจาก member_health (member_health_weight)
Calories Trend: ดึงจาก intake_logs (calories)
Nutrition Trend: ดึงจาก intake_logs (protein, carb, fat)

// actions/member/progress/trendCharts.js
- getWeightTrend(memberId, period, startDate, endDate)
- getCaloriesTrend(memberId, period, startDate, endDate)
- getNutritionTrend(memberId, period, startDate, endDate)
i need server action come with back-end function
Goal Comparison
Goal Target Line: ดึงจาก fitness_goal และ interpolate
Actual Progress Line: ดึงจาก member_health (weight progression)

// actions/member/progress/goalComparison.js
- getGoalComparisonData(memberId, startDate, endDate)
- getGoalTargetLine(memberId, goalId)
- getActualProgressLine(memberId, startDate, endDate)

Calendar Heatmap
Workout Frequency: นับจาก exercise_log ต่อวัน
Color Scale: 0=light gray, 1-2=medium, ≥3=dark

// actions/member/progress/calendarHeatmap.js
- getWorkoutFrequencyData(memberId, startDate, endDate)
- getCalendarHeatmapData(memberId, year, month)

Detailed Logs
Workout Logs: ดึงจาก exercise_log + exercise_log_set
Nutrition Logs: ดึงจาก intake_logs
Health Logs: ดึงจาก member_health

// actions/member/progress/detailedLogs.js
- getDetailedWorkoutLogs(memberId, startDate, endDate)
- getDetailedNutritionLogs(memberId, startDate, endDate)
- getDetailedHealthLogs(memberId, startDate, endDate)
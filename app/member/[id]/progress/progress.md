# 📊 Progress Feature - Architecture & Chart Strategy

## 🏗️ Component Architecture

### SSR + Client Components Strategy

```
📁 app/member/[id]/progress/
├── page.jsx (SSR - Server-side Rendering)
│   ├── ดึงข้อมูลเริ่มต้นด้วย fetchProgress()
│   ├── ส่ง initialData ไปยัง Client Components
│   └── Suspense wrapper สำหรับ loading states
│
└── _components/
    ├── ProgressDashboard.jsx (Client - Main Container)
    │   ├── State management (period, data)
    │   ├── useTransition สำหรับ smooth updates
    │   └── Orchestrate ทุก components
    │
    ├── FilterControls.jsx (Client - Interactive)
    │   ├── Period selection (WEEK, 1M, 2M, 3M, 6M, 1Y, ALL)
    │   ├── Date range picker
    │   └── Real-time filtering
    │
    ├── metrics/ (Static + Interactive)
    │   ├── MetricsOverview.jsx - Grid layout สำหรับ summary cards
    │   ├── SummaryCard.jsx - Individual metric display
    │   └── ProgressionChart.jsx - Main progress visualization
    │
    └── shared/
        ├── ChartContainer.jsx - Reusable chart wrapper
        ├── ErrorBoundary.jsx - Error handling
        └── ProgressSkeleton.jsx - Loading states
```

## 📈 Chart Selection by Metrics

### 1. Total Volume (Volume Progression)

**Chart Type:** Line Chart with Dots

```javascript
// เหตุผล: แสดงแนวโน้มการเพิ่มขึ้นของปริมาณการออกกำลังกาย
// Dots: เน้น data points แต่ละวัน
<LineChart data={volumeData}>
  <Line
    type="monotone"
    dataKey="total_volume"
    stroke="#3b82f6"
    strokeWidth={2}
    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
  />
</LineChart>
```

### 2. Total Reps (Repetition Tracking)

**Chart Type:** Bar Chart with Labels

```javascript
// เหตุผล: เปรียบเทียบจำนวนครั้งระหว่างวัน/สัปดาห์
// Labels: แสดงค่าชัดเจนบน bars
<BarChart data={repsData}>
  <Bar dataKey="total_reps" fill="#10b981" label={{ position: "top" }} />
</BarChart>
```

### 3. Total Duration (Time Analysis)

**Chart Type:** Area Chart

```javascript
// เหตุผล: แสดงการกระจายเวลาใน workout sessions
// Area fill: เน้นการสะสมเวลา
<AreaChart data={durationData}>
  <Area
    type="monotone"
    dataKey="total_duration"
    stroke="#f59e0b"
    fill="#fef3c7"
  />
</AreaChart>
```

### 4. Total Distance (Distance Progress)

**Chart Type:** Line Chart

```javascript
// เหตุผล: ติดตามระยะทางสะสม (สำหรับ cardio)
// Smooth line: แสดงความต่อเนื่องของการปรับปรุง
<LineChart data={distanceData}>
  <Line
    type="monotone"
    dataKey="total_distance"
    stroke="#8b5cf6"
    strokeWidth={2}
  />
</LineChart>
```

### 5. Session Count (Frequency Analysis)

**Chart Type:** Radial Chart with Shape

```javascript
// เหตุผล: แสดงความสม่ำเสมอในการออกกำลังกาย
// Radial: เหมาะกับการแสดงความถี่และรูปแบบ
<RadialBarChart data={sessionData}>
  <RadialBar dataKey="session_count" cornerRadius={10} fill="#ec4899" />
</RadialBarChart>
```

## 🎨 Best Practices

### 1. Color Coding Strategy

```javascript
const chartColors = {
  volume: '#3b82f6',      // Blue - Primary metric (strength focus)
  reps: '#10b981',        // Green - Achievement/success
  duration: '#f59e0b',    // Orange - Time-based activities
  distance: '#8b5cf6',    // Purple - Cardio/endurance focus
  sessions: '#ec4899',    // Pink - Frequency/consistency

  // Supporting colors
  background: '#f8fafc',
  grid: '#e2e8f0',
  text: '#1e293b'
};

// Usage in components
<Line stroke={chartColors.volume} />
<Bar fill={chartColors.reps} />
<Area stroke={chartColors.duration} fill={`${chartColors.duration}20`} />
```

### 2. Responsive Design Implementation

```javascript
// Container responsive heights
const chartHeights = {
  mobile: "h-[250px]",
  tablet: "h-[300px]",
  desktop: "h-[400px]",
  large: "h-[500px]",
};

// Grid responsive layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Primary chart - full width */}
  <Card className="col-span-full">
    <div className="h-[250px] md:h-[350px] lg:h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>{/* Chart components */}</LineChart>
      </ResponsiveContainer>
    </div>
  </Card>

  {/* Secondary charts - responsive grid */}
  <Card className="md:col-span-1">
    <div className="h-[200px] md:h-[250px]">{/* Smaller charts */}</div>
  </Card>
</div>;

// Font sizes responsive
const textSizes = {
  title: "text-lg md:text-xl lg:text-2xl",
  subtitle: "text-sm md:text-base",
  label: "text-xs md:text-sm",
  value: "text-base md:text-lg lg:text-xl",
};
```

## 📝 Data Structure & Props Interface

### fetchProgress Response Structure

```javascript
// Server Action Response
const progressResponse = {
  success: true,
  data: {
    period: {
      type: "1M", // WEEK|1M|2M|3M|6M|1Y|ALL
      label: "1 เดือนที่ผ่านมา",
      totalSessions: 15,
    },
    totals: {
      volume: 25600, // kg
      reps: 450, // ครั้ง
      duration: 5400, // วินาที
      durationFormatted: "1ช 30น 0ส",
      distance: 12500, // เมตร
      sessions: 15, // วัน
    },
    averages: {
      volumePerSession: 1707, // kg/session
      repsPerSession: 30, // reps/session
      durationPerSession: 360, // วินาที/session
      durationPerSessionFormatted: "6น 0ส",
      distancePerSession: 833, // เมตร/session
      workoutFrequency: 3.8, // ครั้ง/สัปดาห์
    },
    dailyProgress: [
      {
        date: "2024-01-15",
        metrics: {
          volume: 1800,
          reps: 32,
          duration: 420,
          durationFormatted: "7น 0ส",
          distance: 1000,
        },
      },
      // ... more daily records
    ],
    metadata: {
      generatedAt: "2024-01-15T10:30:00.000Z",
      memberId: 123,
      hasData: true,
    },
  },
};
```

### Component Props Interfaces

```javascript
// ProgressDashboard Props
interface ProgressDashboardProps {
  memberId: number;
  initialData: ProgressData;
  initialPeriod: PeriodType;
}

// SummaryCard Props
interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  average?: string;
  icon: string;
  trend?: "up" | "down" | "stable";
  color: string;
}

// ProgressionChart Props
interface ProgressionChartProps {
  dailyProgress: DailyProgress[];
  period: PeriodInfo;
  metric: "volume" | "reps" | "duration" | "distance";
  height?: string;
  showTrendLine?: boolean;
}

// FilterControls Props
interface FilterControlsProps {
  currentPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  onRefresh: () => void;
  isLoading: boolean;
  customDateRange?: {
    startDate: string,
    endDate: string,
  };
}
```

## 🔄 State Management Patterns

### Dashboard State

```javascript
// ProgressDashboard.jsx State
const [progressData, setProgressData] = useState(initialData);
const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);
const [isPending, startTransition] = useTransition();
const [error, setError] = useState(null);

// State updates
const handlePeriodChange = (newPeriod) => {
  setCurrentPeriod(newPeriod);
  setError(null);

  startTransition(async () => {
    try {
      const result = await fetchProgress(memberId, newPeriod);
      if (result.success) setProgressData(result.data);
      else setError(result.message);
    } catch (err) {
      setError(err.message);
    }
  });
};
```

### Custom Hooks

```javascript
// hooks/useProgressData.js - จัดการ data fetching
const useProgressData = (memberId, initialData) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (period) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProgress(memberId, period);
      if (result.success) setData(result.data);
      else throw new Error(result.message);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return { data, loading, error, fetchData };
};
```

## 🚨 Error Handling & Loading States

### Error Boundary Implementation

```javascript
// _components/shared/ErrorBoundary.jsx
class ProgressErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Progress Chart Error:", error, errorInfo);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            ⚠️ เกิดข้อผิดพลาดในการแสดงกราฟ
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            ลองใหม่
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Loading States

```javascript
// Loading Components
const LoadingStates = {
  // Chart loading
  ChartSkeleton: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      <p className="ml-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
    </div>
  ),

  // Cards loading
  CardSkeleton: () => (
    <div className="h-24 bg-gray-200 rounded animate-pulse" />
  ),
};
```

## 🎨 User Interaction Patterns

### Interaction Patterns

```javascript
// Basic interactions
const interactions = {
  // Period change
  onPeriodChange: async (newPeriod) => {
    setCurrentPeriod(newPeriod);
    startTransition(async () => {
      await fetchData(newPeriod);
    });
  },

  // Chart hover
  onChartHover: (data) => {
    setTooltip({ visible: true, data });
  },

  // Refresh data
  onRefresh: async () => {
    startTransition(async () => {
      await fetchData(currentPeriod);
    });
  },
};
```

## 🎯 Implementation Checklist

### Core Components

- [ ] SSR page.jsx with fetchProgress()
- [ ] ProgressDashboard with state management
- [ ] FilterControls with period selection
- [ ] SummaryCards with metrics display
- [ ] ProgressionChart with data visualization

### Essential Features

- [ ] Error handling and loading states
- [ ] Period filtering (WEEK, 1M, 3M, 6M, 1Y, ALL)
- [ ] Smooth transitions with useTransition
- [ ] Responsive design
- [ ] Color coding for metrics

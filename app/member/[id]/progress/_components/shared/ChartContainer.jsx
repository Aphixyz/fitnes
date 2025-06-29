import React from "react";
import { ChartErrorFallback } from "./ErrorBoundary";
import { ChartSkeleton } from "./ProgressSkeleton";

const ChartContainer = ({
  title,
  subtitle,
  children,
  height = "h-80",
  isLoading = false,
  error = null,
  onRetry,
  className = "",
  actions = null,
  showBorder = true,
  showShadow = true,
}) => {
  const containerClasses = `
    bg-white rounded-lg p-6 
    ${showBorder ? "border" : ""} 
    ${showShadow ? "shadow-sm" : ""} 
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Chart Content */}
      <div className={`${height} relative`}>
        {isLoading ? (
          <ChartSkeleton height={height} />
        ) : error ? (
          <ChartErrorFallback error={error} retry={onRetry} />
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </div>
  );
};

// Variants สำหรับแต่ละ chart type
export const LineChartContainer = ({ children, ...props }) => (
  <ChartContainer
    {...props}
    className={`${props.className || ""} line-chart-container`}
  >
    {children}
  </ChartContainer>
);

export const BarChartContainer = ({ children, ...props }) => (
  <ChartContainer
    {...props}
    className={`${props.className || ""} bar-chart-container`}
  >
    {children}
  </ChartContainer>
);

export const AreaChartContainer = ({ children, ...props }) => (
  <ChartContainer
    {...props}
    className={`${props.className || ""} area-chart-container`}
  >
    {children}
  </ChartContainer>
);

export const RadialChartContainer = ({ children, ...props }) => (
  <ChartContainer
    {...props}
    height="h-64"
    className={`${props.className || ""} radial-chart-container`}
  >
    {children}
  </ChartContainer>
);

// Responsive helper สำหรับ chart heights
export const chartHeights = {
  mobile: "h-[250px]",
  tablet: "h-[300px]",
  desktop: "h-[400px]",
  large: "h-[500px]",
};

// Chart colors theme
export const chartColors = {
  volume: "#3b82f6", // Blue - Primary metric
  reps: "#10b981", // Green - Achievement
  duration: "#f59e0b", // Orange - Time-based
  distance: "#8b5cf6", // Purple - Cardio
  sessions: "#ec4899", // Pink - Frequency

  // Supporting colors
  background: "#f8fafc",
  grid: "#e2e8f0",
  text: "#1e293b",

  // Gradients
  volumeGradient: "from-blue-500 to-blue-600",
  repsGradient: "from-green-500 to-green-600",
  durationGradient: "from-orange-500 to-orange-600",
  distanceGradient: "from-purple-500 to-purple-600",
  sessionsGradient: "from-pink-500 to-pink-600",
};

export default ChartContainer;

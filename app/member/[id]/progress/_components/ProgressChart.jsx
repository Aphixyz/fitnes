"use client";

import { useState } from "react";

const ProgressChart = ({ data, color = "#3B82F6", unit = "" }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-2">🫩</div>
          <p>ไม่มีข้อมูลสถิติ</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scales
  const chartWidth = 400;
  const chartHeight = 240;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Get min/max values with some padding
  const values = data.map(d => d.value).filter(v => v != null);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  let yMin, yMax;
  
  if (data.length === 1) {
    // For single data point, create a range around the value
    const singleValue = values[0];
    const range = Math.max(singleValue * 0.05, 2); // 5% of value or minimum 2 units
    yMin = Math.max(0, singleValue - range);
    yMax = singleValue + range;
  } else {
    // For multiple data points, use the existing logic
    const valueRange = maxValue - minValue || 1;
    yMin = Math.max(0, minValue - valueRange * 0.1);
    yMax = maxValue + valueRange * 0.1;
  }

  // Create SVG path for line chart
  const createPath = () => {
    if (data.length === 1) return "";
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * plotWidth;
      const y = plotHeight - ((point.value - yMin) / (yMax - yMin)) * plotHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    
    return `${date.getDate()} ${thaiMonths[date.getMonth()]}`;
  };

  const formatYAxisValue = (value) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return Math.round(value);
  };

  // Generate Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return yMin + (yMax - yMin) * (i / (yTicks - 1));
  });

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          width="100%"
          height={chartHeight}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
            {/* Grid lines */}
            <g>
              {yTickValues.map((tick, index) => (
                <line
                  key={index}
                  x1={padding.left}
                  y1={padding.top + (plotHeight - ((tick - yMin) / (yMax - yMin)) * plotHeight)}
                  x2={padding.left + plotWidth}
                  y2={padding.top + (plotHeight - ((tick - yMin) / (yMax - yMin)) * plotHeight)}
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                  opacity="0.7"
                />
              ))}
            </g>

            {/* Y-axis labels */}
            <g>
              {yTickValues.map((tick, index) => (
                <text
                  key={index}
                  x={padding.left - 8}
                  y={padding.top + (plotHeight - ((tick - yMin) / (yMax - yMin)) * plotHeight) + 4}
                  textAnchor="end"
                  fontSize="13"
                  fill="#6B7280"
                  fontWeight="500"
                >
                  {formatYAxisValue(tick)}{unit}
                </text>
              ))}
            </g>

            {/* X-axis labels */}
            <g>
              {data.map((point, index) => {
                // For single data point, center the label
                const x = data.length === 1 
                  ? padding.left + plotWidth / 2 
                  : padding.left + (index / (data.length - 1)) * plotWidth;
                
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#6B7280"
                    fontWeight="500"
                  >
                    {formatDate(point.date)}
                  </text>
                );
              })}
            </g>

            {/* Line chart or single point */}
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {data.length > 1 ? (
                <path
                  d={createPath()}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              ) : null}

              {/* Data points */}
              {data.map((point, index) => {
                const x = data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth;
                const y = plotHeight - ((point.value - yMin) / (yMax - yMin)) * plotHeight;
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={selectedPoint === index ? 7 : 5}
                    fill={color}
                    stroke="white"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                );
              })}

              {/* Tooltip */}
              {selectedPoint !== null && data[selectedPoint] && (
                <g>
                  {(() => {
                    const point = data[selectedPoint];
                    const x = data.length === 1 ? plotWidth / 2 : (selectedPoint / (data.length - 1)) * plotWidth;
                    const y = plotHeight - ((point.value - yMin) / (yMax - yMin)) * plotHeight;
                    
                    return (
                      <>
                        <rect
                          x={x - 35}
                          y={y - 45}
                          width="70"
                          height="28"
                          rx="6"
                          fill="rgba(0, 0, 0, 0.85)"
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                        />
                        <text
                          x={x}
                          y={y - 24}
                          textAnchor="middle"
                          fontSize="13"
                          fill="white"
                          fontWeight="600"
                        >
                          {Math.round(point.value)}{unit}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </g>
        </svg>
      </div>
    </div>
  );
};

export default ProgressChart;
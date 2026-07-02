"use client";

import { useEffect, useState, useRef, useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  strokeWidth = 2,
  color = "#004C9B",
  fillColor,
  showDots = false,
  className = "",
}: SparklineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const gradientId = `sparkline-gradient-${id}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - min) / range) * chartHeight,
  }));

  const pathD = points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        opacity={isVisible ? 1 : 0}
        style={{
          transition: "opacity 0.5s ease-out",
        }}
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isVisible ? "none" : "1000"}
        strokeDashoffset={isVisible ? 0 : 1000}
        style={{
          transition: "stroke-dashoffset 1s ease-out",
          filter: `drop-shadow(0 0 3px ${color}60)`,
        }}
      />

      {/* Dots */}
      {showDots &&
        points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={color}
            opacity={isVisible ? 1 : 0}
            style={{
              transition: `opacity 0.3s ease-out ${i * 0.1}s, transform 0.3s ease-out ${i * 0.1}s`,
              transform: isVisible ? "scale(1)" : "scale(0)",
              transformOrigin: `${point.x}px ${point.y}px`,
            }}
          />
        ))}
    </svg>
  );
}

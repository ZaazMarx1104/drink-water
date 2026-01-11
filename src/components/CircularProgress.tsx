import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
  showAnimation?: boolean;
}

export function CircularProgress({
  value,
  max,
  size = 200,
  strokeWidth = 12,
  children,
  className,
  showAnimation = true,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((animatedValue / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, showAnimation]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: percentage > 0 ? 'drop-shadow(0 0 8px hsl(var(--accent) / 0.5))' : 'none',
          }}
        />
        
        {/* Water wave effect inside */}
        <defs>
          <clipPath id="circleClip">
            <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} />
          </clipPath>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Water fill */}
        <rect
          x={strokeWidth / 2}
          y={size - (size - strokeWidth) * (percentage / 100) - strokeWidth / 2}
          width={size - strokeWidth}
          height={(size - strokeWidth) * (percentage / 100)}
          fill="url(#waterGradient)"
          clipPath="url(#circleClip)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

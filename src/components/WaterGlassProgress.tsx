import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WaterGlassProgressProps {
  value: number;
  max: number;
  size?: number;
  children?: React.ReactNode;
  className?: string;
  showAnimation?: boolean;
}

export function WaterGlassProgress({
  value,
  max,
  size = 240,
  children,
  className,
  showAnimation = true,
}: WaterGlassProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((animatedValue / max) * 100, 100);

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

  // Glass dimensions
  const glassWidth = size * 0.7;
  const glassHeight = size * 0.85;
  const glassX = (size - glassWidth) / 2;
  const glassY = size * 0.08;
  const borderRadius = 20;
  const taperAmount = 15;

  // Water fill height (from bottom)
  const waterMaxHeight = glassHeight - 10;
  const waterHeight = (percentage / 100) * waterMaxHeight;
  const waterY = glassY + glassHeight - 5 - waterHeight;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        <defs>
          {/* Water gradient - fills from bottom */}
          <linearGradient id="waterFillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
          </linearGradient>

          {/* Glass gradient for 3D effect */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            <stop offset="30%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            <stop offset="70%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
          </linearGradient>

          {/* Bubble glow filter */}
          <filter id="bubbleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Clip path for water inside glass */}
          <clipPath id="glassClip">
            <path
              d={`
                M ${glassX + taperAmount + 5} ${glassY + 5}
                L ${glassX + glassWidth - taperAmount - 5} ${glassY + 5}
                L ${glassX + glassWidth - 5} ${glassY + glassHeight - borderRadius - 5}
                Q ${glassX + glassWidth - 5} ${glassY + glassHeight - 5} ${glassX + glassWidth - borderRadius - 5} ${glassY + glassHeight - 5}
                L ${glassX + borderRadius + 5} ${glassY + glassHeight - 5}
                Q ${glassX + 5} ${glassY + glassHeight - 5} ${glassX + 5} ${glassY + glassHeight - borderRadius - 5}
                L ${glassX + taperAmount + 5} ${glassY + 5}
                Z
              `}
            />
          </clipPath>

          {/* Wave animation */}
          <pattern id="wavePattern" x="0" y="0" width="100" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M0 5 Q25 0 50 5 T100 5"
              fill="none"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="1"
              opacity="0.3"
            >
              <animate
                attributeName="d"
                values="M0 5 Q25 0 50 5 T100 5;M0 5 Q25 10 50 5 T100 5;M0 5 Q25 0 50 5 T100 5"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>
        </defs>

        {/* Glass outline - tapered cup shape */}
        <path
          d={`
            M ${glassX + taperAmount} ${glassY}
            L ${glassX + glassWidth - taperAmount} ${glassY}
            L ${glassX + glassWidth} ${glassY + glassHeight - borderRadius}
            Q ${glassX + glassWidth} ${glassY + glassHeight} ${glassX + glassWidth - borderRadius} ${glassY + glassHeight}
            L ${glassX + borderRadius} ${glassY + glassHeight}
            Q ${glassX} ${glassY + glassHeight} ${glassX} ${glassY + glassHeight - borderRadius}
            L ${glassX + taperAmount} ${glassY}
            Z
          `}
          fill="url(#glassGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Water fill */}
        <g clipPath="url(#glassClip)">
          <rect
            x={glassX}
            y={waterY}
            width={glassWidth}
            height={waterHeight + 10}
            fill="url(#waterFillGradient)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Wave surface effect */}
          {percentage > 0 && (
            <ellipse
              cx={size / 2}
              cy={waterY + 3}
              rx={glassWidth / 2 - 10}
              ry={6}
              fill="hsl(var(--accent))"
              opacity="0.4"
              className="transition-all duration-1000 ease-out"
            >
              <animate
                attributeName="ry"
                values="6;8;6"
                dur="2s"
                repeatCount="indefinite"
              />
            </ellipse>
          )}

          {/* Bubbles */}
          {percentage > 10 && (
            <>
              <circle
                cx={glassX + glassWidth * 0.3}
                cy={glassY + glassHeight - 40}
                r="4"
                fill="hsl(var(--primary-foreground))"
                opacity="0.4"
                filter="url(#bubbleGlow)"
              >
                <animate
                  attributeName="cy"
                  values={`${glassY + glassHeight - 40};${waterY + 20};${glassY + glassHeight - 40}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={glassX + glassWidth * 0.7}
                cy={glassY + glassHeight - 60}
                r="3"
                fill="hsl(var(--primary-foreground))"
                opacity="0.3"
                filter="url(#bubbleGlow)"
              >
                <animate
                  attributeName="cy"
                  values={`${glassY + glassHeight - 60};${waterY + 30};${glassY + glassHeight - 60}`}
                  dur="5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={glassX + glassWidth * 0.5}
                cy={glassY + glassHeight - 30}
                r="2"
                fill="hsl(var(--primary-foreground))"
                opacity="0.35"
                filter="url(#bubbleGlow)"
              >
                <animate
                  attributeName="cy"
                  values={`${glassY + glassHeight - 30};${waterY + 15};${glassY + glassHeight - 30}`}
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </g>

        {/* Glass highlight/shine */}
        <path
          d={`
            M ${glassX + taperAmount + 15} ${glassY + 10}
            L ${glassX + taperAmount + 25} ${glassY + 10}
            L ${glassX + 20} ${glassY + glassHeight - 30}
            L ${glassX + 15} ${glassY + glassHeight - 30}
            Z
          `}
          fill="hsl(var(--primary-foreground))"
          opacity="0.15"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

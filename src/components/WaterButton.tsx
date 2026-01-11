import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';

interface WaterButtonProps {
  amount: number;
  onClick: (amount: number) => void;
  label?: string;
  variant?: 'default' | 'primary' | 'custom';
  className?: string;
}

export function WaterButton({
  amount,
  onClick,
  label,
  variant = 'default',
  className,
}: WaterButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick(amount);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const displayLabel = label || `${amount}ml`;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 font-semibold transition-all duration-300",
        "active:scale-95 hover:shadow-water no-select",
        variant === 'default' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === 'primary' && "water-gradient text-primary-foreground shadow-water",
        variant === 'custom' && "border-2 border-dashed border-primary/30 text-primary hover:border-primary",
        isAnimating && "animate-drink-splash",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1">
        {variant === 'custom' ? (
          <span className="text-lg">+</span>
        ) : (
          <Droplets className="h-5 w-5" />
        )}
        <span className="text-sm">{displayLabel}</span>
      </div>
      
      {/* Ripple effect */}
      {isAnimating && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="absolute h-full w-full animate-ripple rounded-full bg-primary-foreground/20" />
        </span>
      )}
    </button>
  );
}

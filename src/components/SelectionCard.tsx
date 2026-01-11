import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'default' | 'checkbox';
  className?: string;
}

export function SelectionCard({
  label,
  selected,
  onClick,
  variant = 'default',
  className,
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-all no-select",
        "hover:border-primary/50 active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-card text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium",
          selected && "text-foreground"
        )}>
          {label}
        </span>
        
        {variant === 'checkbox' ? (
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted"
          )}>
            {selected && <Check className="h-4 w-4" />}
          </div>
        ) : (
          <div className={cn(
            "h-5 w-5 rounded-full border-2 transition-all",
            selected
              ? "border-primary bg-primary"
              : "border-muted"
          )}>
            {selected && (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

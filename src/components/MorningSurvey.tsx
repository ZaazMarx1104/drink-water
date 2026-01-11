import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sun, Droplets, Frown, Meh, Smile, Heart, Zap } from 'lucide-react';

interface MorningSurveyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousIntake: number;
  previousTarget: number;
  onSubmit: (rating: number) => void;
}

const ratings = [
  { value: 1, label: 'Dehydrated', icon: Frown, color: 'text-destructive' },
  { value: 2, label: 'Slightly dry', icon: Meh, color: 'text-orange-500' },
  { value: 3, label: 'Just right', icon: Smile, color: 'text-accent' },
  { value: 4, label: 'Well hydrated', icon: Heart, color: 'text-primary' },
  { value: 5, label: 'Over-hydrated', icon: Zap, color: 'text-purple-500' },
];

export function MorningSurvey({
  open,
  onOpenChange,
  previousIntake,
  previousTarget,
  onSubmit,
}: MorningSurveyProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedRating) {
      onSubmit(selectedRating);
      onOpenChange(false);
    }
  };

  const percentage = Math.round((previousIntake / previousTarget) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center animate-float">
            <Sun className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-xl">Good Morning! ☀️</DialogTitle>
          <DialogDescription className="text-center">
            How did you feel about your hydration yesterday?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Previous day stats */}
          <div className="rounded-xl bg-muted p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Yesterday's Intake</span>
            </div>
            <p className="text-3xl font-bold water-text-gradient">{previousIntake} ml</p>
            <p className="text-sm text-muted-foreground">
              {percentage}% of your {previousTarget} ml target
            </p>
          </div>

          {/* Rating selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-center text-muted-foreground">
              Rate how you felt (1 = dehydrated, 5 = over-hydrated)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {ratings.map((rating) => {
                const Icon = rating.icon;
                const isSelected = selectedRating === rating.value;
                return (
                  <button
                    key={rating.value}
                    onClick={() => setSelectedRating(rating.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-xl transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground scale-105 shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <Icon className={cn('h-6 w-6 mb-1', !isSelected && rating.color)} />
                    <span className="text-xs font-medium">{rating.value}</span>
                  </button>
                );
              })}
            </div>
            {selectedRating && (
              <p className="text-center text-sm font-medium animate-fade-in">
                {ratings.find((r) => r.value === selectedRating)?.label}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedRating}
          className="w-full h-12 water-gradient"
        >
          Submit & Start Today
        </Button>
      </DialogContent>
    </Dialog>
  );
}

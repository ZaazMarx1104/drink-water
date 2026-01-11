import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectionCard } from './SelectionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const otherGenderOptions = [
  { value: 'trans-male-transitioned', label: 'Trans-male (transitioned)' },
  { value: 'trans-female-transitioned', label: 'Trans-female (transitioned)' },
  { value: 'intersex-male', label: 'Intersex (identify as male)' },
  { value: 'intersex-female', label: 'Intersex (identify as female)' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'trans-male-transition', label: 'Trans-male (mid-transition)' },
  { value: 'trans-female-transition', label: 'Trans-female (mid-transition)' },
  { value: 'other', label: 'Other' },
];

interface GenderPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGender: string;
  onSelectGender: (gender: string) => void;
  hrtMonths: number;
  onHrtMonthsChange: (months: number) => void;
}

export function GenderPopup({
  open,
  onOpenChange,
  selectedGender,
  onSelectGender,
  hrtMonths,
  onHrtMonthsChange,
}: GenderPopupProps) {
  const isMidTransition = selectedGender.includes('transition');

  const handleSelect = (value: string) => {
    onSelectGender(value);
    if (!value.includes('transition')) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Select Your Gender</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {otherGenderOptions.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              selected={selectedGender === option.value}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>

        {isMidTransition && (
          <div className="animate-slide-up pb-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Months on HRT (0-24)
            </Label>
            <Input
              type="number"
              min={0}
              max={24}
              value={hrtMonths}
              onChange={(e) => onHrtMonthsChange(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)))}
              className="mt-2 h-14 text-lg"
              placeholder="Enter months"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This helps calculate your hydration needs during transition.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

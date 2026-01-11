import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  showSkip?: boolean;
  showBack?: boolean;
  continueDisabled?: boolean;
  illustration?: React.ReactNode;
}

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onContinue,
  onSkip,
  onBack,
  showSkip = false,
  showBack = false,
  continueDisabled = false,
  illustration,
}: OnboardingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background safe-area-top safe-area-bottom relative z-10">
      {/* Header with progress */}
      <div className="flex items-center justify-between p-4">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {step}/{totalSteps}
            </span>
          </div>
        )}
        
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i + 1 <= step ? "bg-primary w-4" : "bg-muted w-2"
              )}
            />
          ))}
        </div>
        
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        )}
        
        {!showSkip && <div className="w-10" />}
      </div>

      {/* Illustration */}
      {illustration && (
        <div className="flex justify-center py-6">
          {illustration}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 animate-slide-up">
        <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="mb-6 text-muted-foreground">{subtitle}</p>
        )}
        
        <div className="py-4">
          {children}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="p-6 space-y-3">
        <Button
          onClick={onContinue}
          disabled={continueDisabled}
          className="w-full h-14 text-lg font-semibold water-gradient hover:opacity-90 shadow-water"
        >
          CONTINUE
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        
        {showSkip && onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full h-12 text-muted-foreground"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip this step
          </Button>
        )}
      </div>
    </div>
  );
}

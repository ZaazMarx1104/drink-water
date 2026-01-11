import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface WaterWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'hourly' | 'daily';
  onConfirm: () => void;
}

export function WaterWarningDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
}: WaterWarningDialogProps) {
  const isHourly = type === 'hourly';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            {isHourly ? 'Water Intake Warning' : 'Overhydration Warning'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isHourly ? (
              <>
                You've consumed more than <strong>1 liter in the last hour</strong>. 
                Drinking too much water too quickly can lead to <strong>water intoxication</strong> (hyponatremia), 
                which can be dangerous.
              </>
            ) : (
              <>
                You've already consumed <strong>150% of your recommended daily intake</strong>. 
                Excessive water consumption can dilute sodium levels in your blood, 
                potentially causing <strong>water toxicity</strong>.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            Add Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

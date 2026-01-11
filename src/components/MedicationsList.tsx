import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Pill } from 'lucide-react';

export interface Medication {
  id: string;
  name: string;
  type: 'prescription' | 'over-the-counter' | 'supplement' | 'other';
}

const medicationTypes = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'over-the-counter', label: 'Over-the-counter' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'other', label: 'Other' },
];

interface MedicationsListProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
}

export function MedicationsList({ medications, onMedicationsChange }: MedicationsListProps) {
  const [newMedName, setNewMedName] = useState('');
  const [newMedType, setNewMedType] = useState<Medication['type']>('prescription');

  const addMedication = () => {
    if (newMedName.trim()) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: newMedName.trim(),
        type: newMedType,
      };
      onMedicationsChange([...medications, newMed]);
      setNewMedName('');
      setNewMedType('prescription');
    }
  };

  const removeMedication = (id: string) => {
    onMedicationsChange(medications.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={newMedName}
            onChange={(e) => setNewMedName(e.target.value)}
            placeholder="Medication name"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addMedication()}
          />
          <Select value={newMedType} onValueChange={(v) => setNewMedType(v as Medication['type'])}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {medicationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={addMedication}
          variant="outline"
          className="w-full"
          disabled={!newMedName.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {medications.length > 0 && (
        <div className="space-y-2">
          {medications.map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-xl bg-muted p-3 animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{med.type}</p>
                </div>
              </div>
              <button
                onClick={() => removeMedication(med.id)}
                className="p-1 text-muted-foreground hover:text-destructive rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

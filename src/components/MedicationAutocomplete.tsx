import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

// Common medications for hydration-affecting conditions
export const medicationsList = [
  // Diabetes medications
  'Metformin',
  'Insulin',
  'Glipizide',
  'Glyburide',
  'Januvia (Sitagliptin)',
  'Jardiance (Empagliflozin)',
  'Farxiga (Dapagliflozin)',
  'Ozempic (Semaglutide)',
  'Trulicity (Dulaglutide)',
  
  // Kidney/UTI medications
  'Flomax (Tamsulosin)',
  'Allopurinol',
  'Potassium Citrate',
  'Nitrofurantoin',
  'Ciprofloxacin',
  'Bactrim (Sulfamethoxazole)',
  
  // Heart medications
  'Lisinopril',
  'Losartan',
  'Metoprolol',
  'Amlodipine',
  'Furosemide (Lasix)',
  'Spironolactone',
  'Hydrochlorothiazide',
  'Carvedilol',
  'Digoxin',
  
  // Thyroid medications
  'Levothyroxine',
  'Methimazole',
  'Propylthiouracil',
  
  // Liver medications
  'Lactulose',
  'Rifaximin',
  'Propranolol',
  
  // Asthma medications
  'Albuterol (Ventolin)',
  'Fluticasone (Flovent)',
  'Montelukast (Singulair)',
  'Budesonide',
  'Prednisone',
  
  // Pregnancy/Breastfeeding safe
  'Prenatal Vitamins',
  'Folic Acid',
  'Iron Supplements',
  'Calcium Supplements',
  
  // Common OTC
  'Acetaminophen (Tylenol)',
  'Ibuprofen (Advil)',
  'Aspirin',
  'Vitamin D',
  'Omega-3 Fish Oil',
  'Magnesium',
  'Probiotics',
];

interface MedicationAutocompleteProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MedicationAutocomplete({
  selected,
  onChange,
  placeholder = 'Search medications...',
}: MedicationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = medicationsList.filter(
    (option) =>
      option.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(option)
  );

  const showAddCustom =
    query.trim() &&
    !medicationsList.some((o) => o.toLowerCase() === query.toLowerCase()) &&
    !selected.some((s) => s.toLowerCase() === query.toLowerCase());

  const handleSelect = (option: string) => {
    onChange([...selected, option]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const handleAddCustom = () => {
    if (query.trim()) {
      onChange([...selected, query.trim()]);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (showAddCustom) {
        handleAddCustom();
      }
    }
    if (e.key === 'Backspace' && !query && selected.length > 0) {
      handleRemove(selected[selected.length - 1]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="px-3 py-1.5 text-sm flex items-center gap-1.5 animate-fade-in"
            >
              <Pill className="h-3 w-3" />
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (query || filteredOptions.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.slice(0, 10).map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2",
                "first:rounded-t-xl last:rounded-b-xl"
              )}
            >
              <Pill className="h-4 w-4 text-muted-foreground" />
              <span>{option}</span>
            </button>
          ))}

          {showAddCustom && (
            <button
              onClick={handleAddCustom}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 text-primary border-t border-border"
            >
              <span>Add "{query}"</span>
            </button>
          )}

          {filteredOptions.length === 0 && !showAddCustom && query && (
            <div className="px-4 py-3 text-muted-foreground text-sm">
              No matching medications found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

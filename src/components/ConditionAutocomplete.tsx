import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionAutocompleteProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export function ConditionAutocomplete({
  options,
  selected,
  onChange,
  placeholder = 'Search conditions...',
  allowCustom = true,
}: ConditionAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(option)
  );

  const showAddCustom =
    allowCustom &&
    query.trim() &&
    !options.some((o) => o.toLowerCase() === query.toLowerCase()) &&
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
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-1.5 animate-fade-in"
            >
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
          {filteredOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between",
                "first:rounded-t-xl last:rounded-b-xl"
              )}
            >
              <span>{option}</span>
              {selected.includes(option) && (
                <Check className="h-4 w-4 text-primary" />
              )}
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
              No matching conditions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

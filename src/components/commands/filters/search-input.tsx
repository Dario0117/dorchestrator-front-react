import { Input } from '@components/ui/input';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 300;

interface SearchInputProps {
  value?: string;
  onSearch: (value: string | undefined) => void;
  placeholder?: string;
  ariaLabel?: string;
  minLength?: number;
}

export function SearchInput({
  value,
  onSearch,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  minLength = 3,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateSearch = (text: string) => {
    const searchValue = text.length >= minLength ? text : undefined;
    onSearch(searchValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalValue(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => updateSearch(text), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setLocalValue('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearch(undefined);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-11 pl-9 pr-9 text-base md:text-sm"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

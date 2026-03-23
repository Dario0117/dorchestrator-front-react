import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import { Positioned } from '@components/ds/atoms/positioned';
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
    <Positioned
      position="relative"
      minW0
      grow
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        padding="search"
      />
      {localValue && (
        <Positioned
          position="absolute"
          insetRight="sm"
          insetYCenter
        >
          <Button
            variant="ghost"
            size="inline"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        </Positioned>
      )}
    </Positioned>
  );
}

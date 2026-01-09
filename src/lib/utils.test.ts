import { cn } from '@lib/utils';

describe('cn utility function', () => {
  it('should combine class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('should handle empty strings', () => {
    const result = cn('base', '', 'end');
    expect(result).toBe('base end');
  });

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should handle conflicting classes
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8'); // Latest class wins
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with conditional classes', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'base': true,
    });
    expect(result).toBe('active base');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      'btn',
      'px-4 py-2',
      {
        'bg-blue-500': isActive,
        'bg-gray-300': isDisabled,
        'hover:bg-blue-600': isActive && !isDisabled,
      },
      isActive && 'text-white',
      'rounded',
    );

    expect(result).toContain('btn');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('rounded');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).not.toContain('bg-gray-300');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single argument', () => {
    const result = cn('single-class');
    expect(result).toBe('single-class');
  });

  it('should handle Tailwind responsive classes', () => {
    const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
    expect(result).toBe('text-sm md:text-base lg:text-lg');
  });

  it('should merge similar Tailwind utilities correctly', () => {
    // Test that twMerge handles similar utilities properly
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle state variants', () => {
    const result = cn(
      'hover:bg-gray-100',
      'focus:bg-gray-200',
      'active:bg-gray-300',
    );
    expect(result).toBe(
      'hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-300',
    );
  });

  it('should work with component variants pattern', () => {
    const variants = {
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      variant: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-900',
      },
    };

    const result = cn(
      'rounded font-medium',
      variants.size.md,
      variants.variant.primary,
    );

    expect(result).toContain('rounded');
    expect(result).toContain('font-medium');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('text-base');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
  });
});

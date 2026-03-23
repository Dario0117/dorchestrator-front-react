import { normalizeFieldErrors } from '@domains/org/forms/components/normalize-field-errors';

describe('normalizeFieldErrors', () => {
  it('should return string errors as-is', () => {
    expect(normalizeFieldErrors(['Field is required'])).toEqual([
      'Field is required',
    ]);
  });

  it('should flatten array errors', () => {
    expect(normalizeFieldErrors([['Error 1', 'Error 2']])).toEqual([
      'Error 1',
      'Error 2',
    ]);
  });

  it('should extract message from object errors', () => {
    expect(normalizeFieldErrors([{ message: 'Invalid value' }])).toEqual([
      'Invalid value',
    ]);
  });

  it('should return "Invalid input" for unrecognized error types', () => {
    expect(normalizeFieldErrors([42])).toEqual(['Invalid input']);
    expect(normalizeFieldErrors([null])).toEqual(['Invalid input']);
    expect(normalizeFieldErrors([undefined])).toEqual(['Invalid input']);
  });

  it('should handle mixed error types', () => {
    expect(
      normalizeFieldErrors([
        'Direct string',
        ['Nested 1', 'Nested 2'],
        { message: 'Object message' },
        true,
      ]),
    ).toEqual([
      'Direct string',
      'Nested 1',
      'Nested 2',
      'Object message',
      'Invalid input',
    ]);
  });

  it('should return empty array for empty input', () => {
    expect(normalizeFieldErrors([])).toEqual([]);
  });

  it('should filter non-string items from nested arrays', () => {
    expect(normalizeFieldErrors([[123, 'Valid', null]])).toEqual(['Valid']);
  });
});

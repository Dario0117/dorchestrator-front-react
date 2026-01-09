import {
  generateInitials,
  generateSlugSuggestion,
  isValidSlug,
} from '@lib/organization-logo.utils';
import { describe, expect, it } from 'vitest';

describe('generateInitials', () => {
  it('should generate initials from organization name', () => {
    expect(generateInitials('Acme Corporation')).toBe('AC');
    expect(generateInitials('My Company')).toBe('MC');
    expect(generateInitials('Tech Innovations Lab')).toBe('TIL');
  });

  it('should handle single word names', () => {
    expect(generateInitials('Apple')).toBe('A');
    expect(generateInitials('Microsoft')).toBe('M');
  });

  it('should handle empty strings', () => {
    expect(generateInitials('')).toBe('');
    expect(generateInitials('   ')).toBe('');
  });

  it('should limit to 3 initials maximum', () => {
    expect(generateInitials('One Two Three Four Five')).toBe('OTT');
  });

  it('should uppercase all initials', () => {
    expect(generateInitials('acme corporation')).toBe('AC');
    expect(generateInitials('lower CASE MiXed')).toBe('LCM');
  });

  it('should handle multiple spaces between words', () => {
    expect(generateInitials('Acme    Corporation')).toBe('AC');
    expect(generateInitials('  Tech   Lab  ')).toBe('TL');
  });

  it('should handle special characters in words', () => {
    expect(generateInitials('Acme & Co.')).toBe('A&C');
    expect(generateInitials('Tech-Innovations')).toBe('T');
  });
});

describe('isValidSlug', () => {
  it('should accept valid slugs', () => {
    expect(isValidSlug('acme-corporation')).toBe(true);
    expect(isValidSlug('my-company')).toBe(true);
    expect(isValidSlug('tech123')).toBe(true);
    expect(isValidSlug('test-123-abc')).toBe(true);
  });

  it('should reject slugs with uppercase letters', () => {
    expect(isValidSlug('Acme-Corporation')).toBe(false);
    expect(isValidSlug('MyCompany')).toBe(false);
  });

  it('should reject slugs with special characters', () => {
    expect(isValidSlug('acme_corporation')).toBe(false);
    expect(isValidSlug('acme.corporation')).toBe(false);
    expect(isValidSlug('acme@corp')).toBe(false);
    expect(isValidSlug('acme corp')).toBe(false);
  });

  it('should reject slugs with leading/trailing hyphens', () => {
    expect(isValidSlug('-acme-corp')).toBe(false);
    expect(isValidSlug('acme-corp-')).toBe(false);
    expect(isValidSlug('-acme-')).toBe(false);
  });

  it('should reject slugs with consecutive hyphens', () => {
    expect(isValidSlug('acme--corp')).toBe(false);
    expect(isValidSlug('my---company')).toBe(false);
  });

  it('should reject empty strings', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('   ')).toBe(false);
  });

  it('should accept slugs with only numbers', () => {
    expect(isValidSlug('123')).toBe(true);
    expect(isValidSlug('2024')).toBe(true);
  });

  it('should accept slugs with only letters', () => {
    expect(isValidSlug('acme')).toBe(true);
    expect(isValidSlug('company')).toBe(true);
  });
});

describe('generateSlugSuggestion', () => {
  it('should generate slug from organization name', () => {
    expect(generateSlugSuggestion('Acme Corporation')).toBe('acme-corporation');
    expect(generateSlugSuggestion('My Company')).toBe('my-company');
    expect(generateSlugSuggestion('Tech Innovations Lab')).toBe(
      'tech-innovations-lab',
    );
  });

  it('should convert to lowercase', () => {
    expect(generateSlugSuggestion('ACME CORPORATION')).toBe('acme-corporation');
    expect(generateSlugSuggestion('MiXeD CaSe')).toBe('mixed-case');
  });

  it('should replace special characters with hyphens', () => {
    expect(generateSlugSuggestion('Acme & Co.')).toBe('acme-co');
    expect(generateSlugSuggestion('Tech@Innovations')).toBe('tech-innovations');
    expect(generateSlugSuggestion('My_Company')).toBe('my-company');
  });

  it('should remove leading/trailing hyphens', () => {
    expect(generateSlugSuggestion('  Acme Corp  ')).toBe('acme-corp');
    expect(generateSlugSuggestion('- Tech Lab -')).toBe('tech-lab');
  });

  it('should remove consecutive hyphens', () => {
    expect(generateSlugSuggestion('Acme  &  Corp')).toBe('acme-corp');
    expect(generateSlugSuggestion('My---Company')).toBe('my-company');
  });

  it('should handle empty strings', () => {
    expect(generateSlugSuggestion('')).toBe('');
    expect(generateSlugSuggestion('   ')).toBe('');
  });

  it('should handle numbers', () => {
    expect(generateSlugSuggestion('Company 123')).toBe('company-123');
    expect(generateSlugSuggestion('2024 Tech')).toBe('2024-tech');
  });

  it('should handle special characters only', () => {
    expect(generateSlugSuggestion('!@#$%')).toBe('');
    expect(generateSlugSuggestion('& & &')).toBe('');
  });
});

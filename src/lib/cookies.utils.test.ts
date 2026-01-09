/** biome-ignore-all lint/suspicious/noDocumentCookie: testing */
import { getCookie, removeCookie, setCookie } from '@lib/cookies.utils';

describe('cookies', () => {
  let mockDocumentCookie: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock document.cookie
    mockDocumentCookie = vi.spyOn(document, 'cookie', 'get');
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    mockDocumentCookie.mockRestore();
    document.cookie = '';
  });

  describe('getCookie', () => {
    it('should return cookie value when cookie exists', () => {
      document.cookie = 'testCookie=testValue; path=/';

      const result = getCookie('testCookie');

      expect(result).toBe('testValue');
    });

    it('should return undefined when cookie does not exist', () => {
      document.cookie = 'otherCookie=otherValue; path=/';

      const result = getCookie('nonExistentCookie');

      expect(result).toBeUndefined();
    });

    it('should return correct value when multiple cookies exist', () => {
      document.cookie = 'cookie1=value1; cookie2=value2; cookie3=value3';

      const result = getCookie('cookie2');

      expect(result).toBe('value2');
    });

    it('should handle cookies with special characters', () => {
      document.cookie = 'specialCookie=value%20with%20spaces; path=/';

      const result = getCookie('specialCookie');

      expect(result).toBe('value%20with%20spaces');
    });

    it('should return first part of value if cookie contains semicolon', () => {
      document.cookie = 'testCookie=value;extraPart; path=/';

      const result = getCookie('testCookie');

      expect(result).toBe('value');
    });

    it('should return undefined for empty cookie name', () => {
      document.cookie = 'testCookie=testValue; path=/';

      const result = getCookie('');

      expect(result).toBeUndefined();
    });
  });

  describe('setCookie', () => {
    it('should set cookie with default max age', () => {
      setCookie('testCookie', 'testValue');

      expect(document.cookie).toBe(
        'testCookie=testValue; path=/; max-age=604800',
      );
    });

    it('should set cookie with custom max age', () => {
      setCookie('testCookie', 'testValue', 3600);

      expect(document.cookie).toBe(
        'testCookie=testValue; path=/; max-age=3600',
      );
    });

    it('should set cookie with empty value', () => {
      setCookie('testCookie', '');

      expect(document.cookie).toBe('testCookie=; path=/; max-age=604800');
    });

    it('should set cookie with special characters in value', () => {
      setCookie('testCookie', 'value with spaces');

      expect(document.cookie).toBe(
        'testCookie=value with spaces; path=/; max-age=604800',
      );
    });

    it('should set multiple cookies', () => {
      setCookie('cookie1', 'value1');
      expect(document.cookie).toBe('cookie1=value1; path=/; max-age=604800');

      setCookie('cookie2', 'value2');
      expect(document.cookie).toBe('cookie2=value2; path=/; max-age=604800');
    });
  });

  describe('removeCookie', () => {
    it('should remove cookie by setting max-age to 0', () => {
      removeCookie('testCookie');

      expect(document.cookie).toBe('testCookie=; path=/; max-age=0');
    });

    it('should remove cookie with empty name', () => {
      removeCookie('');

      expect(document.cookie).toBe('=; path=/; max-age=0');
    });

    it('should remove multiple cookies', () => {
      removeCookie('cookie1');
      expect(document.cookie).toBe('cookie1=; path=/; max-age=0');

      removeCookie('cookie2');
      expect(document.cookie).toBe('cookie2=; path=/; max-age=0');
    });
  });

  describe('integration', () => {
    it('should set and get cookie correctly', () => {
      setCookie('integrationTest', 'integrationValue');

      // Simulate the cookie being set by manually updating document.cookie
      document.cookie =
        'integrationTest=integrationValue; path=/; max-age=604800';

      const result = getCookie('integrationTest');

      expect(result).toBe('integrationValue');
    });

    it('should set and remove cookie correctly', () => {
      setCookie('toRemove', 'tempValue');
      removeCookie('toRemove');

      expect(document.cookie).toContain('toRemove=; path=/; max-age=0');
    });
  });
});

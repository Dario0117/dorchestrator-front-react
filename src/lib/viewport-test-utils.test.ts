import {
  setDesktopViewport,
  setMobileViewport,
  setTabletViewport,
  setViewport,
} from '@lib/viewport-test-utils';

describe('viewport test utils', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  describe('setMobileViewport', () => {
    it('should set viewport to mobile size (375x667)', () => {
      setMobileViewport();

      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
    });

    it('should dispatch a resize event', () => {
      const resizeSpy = vi.fn();
      window.addEventListener('resize', resizeSpy);

      setMobileViewport();

      expect(resizeSpy).toHaveBeenCalledTimes(1);
      window.removeEventListener('resize', resizeSpy);
    });
  });

  describe('setTabletViewport', () => {
    it('should set viewport to tablet size (768x1024)', () => {
      setTabletViewport();

      expect(window.innerWidth).toBe(768);
      expect(window.innerHeight).toBe(1024);
    });

    it('should dispatch a resize event', () => {
      const resizeSpy = vi.fn();
      window.addEventListener('resize', resizeSpy);

      setTabletViewport();

      expect(resizeSpy).toHaveBeenCalledTimes(1);
      window.removeEventListener('resize', resizeSpy);
    });
  });

  describe('setDesktopViewport', () => {
    it('should set viewport to desktop size (1280x720)', () => {
      setDesktopViewport();

      expect(window.innerWidth).toBe(1280);
      expect(window.innerHeight).toBe(720);
    });

    it('should dispatch a resize event', () => {
      const resizeSpy = vi.fn();
      window.addEventListener('resize', resizeSpy);

      setDesktopViewport();

      expect(resizeSpy).toHaveBeenCalledTimes(1);
      window.removeEventListener('resize', resizeSpy);
    });
  });

  describe('setViewport', () => {
    it('should set viewport to custom size', () => {
      setViewport(1920, 1080);

      expect(window.innerWidth).toBe(1920);
      expect(window.innerHeight).toBe(1080);
    });

    it('should dispatch a resize event', () => {
      const resizeSpy = vi.fn();
      window.addEventListener('resize', resizeSpy);

      setViewport(800, 600);

      expect(resizeSpy).toHaveBeenCalledTimes(1);
      window.removeEventListener('resize', resizeSpy);
    });
  });
});

import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Image } from './image';

describe('Image', () => {
  describe('rendering', () => {
    it('renders an img element', () => {
      render(
        <Image
          alt="test"
          src="/test.png"
        />,
      );
      expect(screen.getByAltText('test')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts fit prop', () => {
      render(
        <Image
          alt="test"
          fit="cover"
        />,
      );
      expect(screen.getByAltText('test')).toBeInTheDocument();
    });

    it('accepts fullWidth prop', () => {
      render(
        <Image
          alt="test"
          fullWidth
        />,
      );
      expect(screen.getByAltText('test')).toBeInTheDocument();
    });

    it('accepts fullHeight prop', () => {
      render(
        <Image
          alt="test"
          fullHeight
        />,
      );
      expect(screen.getByAltText('test')).toBeInTheDocument();
    });

    it('accepts rounded prop', () => {
      render(
        <Image
          alt="test"
          rounded="md"
        />,
      );
      expect(screen.getByAltText('test')).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the img element', () => {
      const ref = createRef<HTMLImageElement>();
      render(
        <Image
          ref={ref}
          alt="test"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLImageElement);
    });
  });
});

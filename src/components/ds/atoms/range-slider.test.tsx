import { RangeSlider } from '@components/ds/atoms/range-slider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { createRef } from 'react';

describe('RangeSlider', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      renderWithProviders(<RangeSlider data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('renders with type="range"', () => {
      renderWithProviders(<RangeSlider data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveAttribute('type', 'range');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the input element', () => {
      const ref = createRef<HTMLInputElement>();
      renderWithProviders(<RangeSlider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('additional props', () => {
    it('accepts min and max props', () => {
      renderWithProviders(
        <RangeSlider
          data-testid="slider"
          min={0}
          max={100}
        />,
      );
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
    });

    it('accepts step prop', () => {
      renderWithProviders(
        <RangeSlider
          data-testid="slider"
          step={5}
        />,
      );
      expect(screen.getByTestId('slider')).toHaveAttribute('step', '5');
    });

    it('accepts value and onChange', () => {
      const onChange = vi.fn();
      renderWithProviders(
        <RangeSlider
          data-testid="slider"
          value={50}
          onChange={onChange}
        />,
      );
      expect(screen.getByTestId('slider')).toHaveAttribute('value', '50');
    });
  });
});

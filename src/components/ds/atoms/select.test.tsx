import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

describe('Select', () => {
  describe('rendering', () => {
    it('renders a select with trigger and items', () => {
      render(
        <Select defaultValue="apple">
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('renders trigger with grow prop', () => {
      render(
        <Select defaultValue="a">
          <SelectTrigger
            grow
            data-testid="trigger"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('renders trigger with size prop', () => {
      render(
        <Select defaultValue="a">
          <SelectTrigger
            size="sm"
            data-testid="trigger"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });
});
